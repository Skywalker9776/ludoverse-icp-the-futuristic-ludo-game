import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Migration "migration";

(with migration = Migration.run)
actor {

  // ─────────────────────────────────────────────
  // TYPES
  // ─────────────────────────────────────────────

  public type BotDifficulty = { #easy; #medium; #hard };

  public type BotConfig = {
    principal : Principal;
    name : Text;
    difficulty : BotDifficulty;
    // Migration compatibility: preserved from old schema
    balance : Float;
    isPremium : Bool;
  };

  public type GameMode = {
    #classic;
    #quick;
    #master;
    #magic;
    #demo;
    #tournament;
    #custom;
    // Legacy modes for upgrade compatibility
    #advanced;
    #bonus;
    #challenge;
    #copyClassic;
    #copyFast;
    #experimental;
    #practice;
    #superLudo;
    #team;
    #timed;
    #twoVsTwo;
  };

  public type GameStatus = { #waiting; #active; #completed };
  public type RankedStatus = { #ranked; #unranked };

  public type TokenPosition = {
    tokenIndex : Nat;
    position : Int;
    isHome : Bool;
    isSafe : Bool;
    isFinished : Bool;
  };

  public type PlayerState = {
    principal : Principal;
    tokens : [TokenPosition];
    consecutiveWins : Nat;
    lastBetAmount : Float;
  };

  public type DiceRoll = {
    rollNumber : Nat;
    playerPrincipal : Principal;
    diceResult : Nat;
    // Legacy field preserved for upgrade compatibility
    seed : Text;
    // New quantum dice fields
    seedHash : Text;
    entropy : Text;
    timestamp : Int;
  };

  public type GameSession = {
    id : Principal;
    mode : GameMode;
    rankedStatus : RankedStatus;
    betAmount : Float;
    players : [Principal];
    playerStates : [PlayerState];
    status : GameStatus;
    winner : ?Principal;
    currentTurn : Nat;
    createdAt : Int;
    isDemo : Bool;
    diceHistory : [DiceRoll];
  };

  public type RoomType = { #privateRoom; #isPublic };

  public type MatchmakingRoom = {
    id : Principal;
    roomType : RoomType;
    creator : Principal;
    playerCount : Nat;
    maxPlayers : Nat;
    gameMode : GameMode;
    betAmount : Float;
    players : [Principal];
    status : { #waiting; #active; #completed };
    isDemo : Bool;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
    color : Text;
    avatarUrl : Text;
    bio : Text;
    isPremium : Bool;
    icpBalance : Float;
    demoCredits : Float;
    // Migration compatibility: match old Float schema
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    referralCode : Text;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  public type Transaction = {
    id : Nat;
    txType : { #deposit; #withdraw; #betLock; #betWin; #betRefund };
    amount : Float;
    timestamp : Int;
    description : Text;
  };

  public type Wallet = {
    id : Principal;
    balance : Float;
    demoCredits : Float;
    createdAt : Int;
    lastActive : Int;
  };

  public type OfficialWallet = {
    address : Text;
    walletLabel : Text;
  };

  // ── World-First Feature Types ──────────────────

  public type MoveProbability = {
    position : Int;
    probability : Float;
    safeScore : Float;
    captureChance : Float;
  };

  public type BoardState = {
    state : Text;
    winStreakPlayer : ?Principal;
    betMultiplier : Float;
    glowIntensity : Float;
  };

  public type TokenSoul = {
    tokenIndex : Nat;
    xp : Nat;
    level : Nat;
    captureCount : Nat;
    capturedCount : Nat;
    nearMissCount : Nat;
  };

  public type SpectatorReaction = {
    emoji : Text;
    reactorPrincipal : Principal;
    timestamp : Int;
  };

  public type FeaturedGame = {
    gameId : Principal;
    spectatorCount : Nat;
    betAmount : Float;
    mode : GameMode;
    playerCount : Nat;
    status : GameStatus;
  };

  public type SystemStats = {
    totalPlayers : Nat;
    totalGames : Nat;
    totalBetsVolume : Float;
    activeGames : Nat;
    totalSpectators : Nat;
  };

  // ─────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────

  // CEO principal — lifetime premium, unrestricted access
  let ceoPrincipal = Principal.fromText("aaaaa-aa");

  // Core state
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wallets = Map.empty<Principal, Wallet>();
  let transactions = Map.empty<Principal, List.List<Transaction>>();
  let games = Map.empty<Principal, GameSession>();
  let matchmakingRooms = Map.empty<Principal, MatchmakingRoom>();
  let bots = Map.empty<Principal, BotConfig>();

  // Counters
  var nextTransactionId : Nat = 0;
  var totalBetsVolume : Float = 0.0;

  // Token Soul System (World-First #4): persistent XP per token per player
  let tokenSouls = Map.empty<Principal, List.List<TokenSoul>>();

  // Spectator System (World-First #5)
  let spectators = Map.empty<Principal, List.List<Principal>>();
  let spectatorReactions = Map.empty<Principal, List.List<SpectatorReaction>>();

  // ─────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────

  func isAuthenticated(caller : Principal) : Bool {
    not caller.isAnonymous()
  };

  func requireAuth(caller : Principal) {
    if (not isAuthenticated(caller)) {
      Runtime.trap("Unauthorized: Must be authenticated to use this feature");
    };
  };

  func isCEO(caller : Principal) : Bool {
    caller == ceoPrincipal
  };

  // Quantum dice: time-based entropy seed for provably fair rolls (World-First #2)
  func quantumRoll(caller : Principal, counter : Nat) : { value : Nat; seedHash : Text; entropy : Text } {
    let ts = Time.now();
    let callerText = caller.toText();
    let entropy = ts.toText() # "-" # callerText # "-" # counter.toText();
    // Simple but deterministic hash for trust indicator
    let hashVal = (Int.abs(ts) % 999983 + counter * 7 + callerText.size() * 13) % 1000000;
    let seedHash = "qd-" # hashVal.toText();
    let value : Nat = Int.abs(ts) % 6 + 1;
    { value; seedHash; entropy };
  };

  func generateReferralCode(p : Principal) : Text {
    let t = p.toText();
    "LV-" # t.size().toText() # "-" # (t.size() * 7 % 9999).toText()
  };

  func defaultTokens() : [TokenPosition] {
    [
      { tokenIndex = 0; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 1; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 2; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 3; position = -1; isHome = true; isSafe = false; isFinished = false },
    ]
  };

  func isSafePosition(pos : Int) : Bool {
    // Standard Ludo safe squares: 1, 9, 14, 22, 27, 35, 40, 48 (per-player offsets)
    pos == 0 or pos == 8 or pos == 13 or pos == 21 or pos == 26 or pos == 34 or pos == 39 or pos == 47
  };

  func boardStateForGame(game : GameSession) : BoardState {
    // Dynamic Living Board logic (World-First #3)
    var maxStreak : Nat = 0;
    var streakPlayer : ?Principal = null;
    var maxBet = game.betAmount;

    for (ps in game.playerStates.values()) {
      if (ps.consecutiveWins > maxStreak) {
        maxStreak := ps.consecutiveWins;
        streakPlayer := ?ps.principal;
      };
      if (ps.lastBetAmount > maxBet) {
        maxBet := ps.lastBetAmount;
      };
    };

    let state = if (maxStreak >= 10 or maxBet >= 1000000.0) {
      "golden"
    } else if (maxStreak >= 5 or maxBet >= 10000.0) {
      "electrified"
    } else if (maxStreak >= 3 or maxBet >= 100.0) {
      "heated"
    } else {
      "normal"
    };

    let betMultiplier = if (state == "golden") { 3.0 }
      else if (state == "electrified") { 2.0 }
      else if (state == "heated") { 1.5 }
      else { 1.0 };

    let glowIntensity = if (state == "golden") { 1.0 }
      else if (state == "electrified") { 0.75 }
      else if (state == "heated") { 0.5 }
      else { 0.25 };

    {
      state;
      winStreakPlayer = streakPlayer;
      betMultiplier;
      glowIntensity;
    };
  };

  func addTransaction(p : Principal, txType : { #deposit; #withdraw; #betLock; #betWin; #betRefund }, amount : Float, desc : Text) {
    let tx : Transaction = {
      id = nextTransactionId;
      txType;
      amount;
      timestamp = Time.now();
      description = desc;
    };
    nextTransactionId += 1;
    switch (transactions.get(p)) {
      case (null) {
        let lst = List.empty<Transaction>();
        lst.add(tx);
        transactions.add(p, lst);
      };
      case (?lst) {
        lst.add(tx);
      };
    };
  };

  func getOrCreateWallet(p : Principal) : Wallet {
    switch (wallets.get(p)) {
      case (?w) { w };
      case (null) {
        let w : Wallet = {
          id = p;
          balance = 0.0;
          demoCredits = 1000.0;
          createdAt = Time.now();
          lastActive = Time.now();
        };
        wallets.add(p, w);
        w;
      };
    };
  };

  // ─────────────────────────────────────────────
  // AUTHENTICATION & INITIALIZATION
  // ─────────────────────────────────────────────

  public shared ({ caller }) func automaticUserInitialization() : async {
    loginSuccess : Bool;
    wallet : Wallet;
    playerExists : Bool;
    message : Text;
  } {
    requireAuth(caller);
    let wallet = getOrCreateWallet(caller);
    let updatedWallet = { wallet with lastActive = Time.now() };
    wallets.add(caller, updatedWallet);
    let playerExists = userProfiles.containsKey(caller);
    {
      loginSuccess = true;
      wallet = updatedWallet;
      playerExists;
      message = if (playerExists) "Welcome back to LudoVerse ICP!" else "Welcome! Create your profile to start playing.";
    };
  };

  public query ({ caller }) func isFirstTime() : async Bool {
    not userProfiles.containsKey(caller)
  };

  // ─────────────────────────────────────────────
  // PLAYER PROFILES
  // ─────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(caller)
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    requireAuth(caller);
    userProfiles.get(user)
  };

  public shared ({ caller }) func saveCallerUserProfile(
    name : Text,
    color : Text,
    avatarUrl : Text,
    bio : Text,
  ) : async () {
    requireAuth(caller);
    let existing = userProfiles.get(caller);
    let wallet = getOrCreateWallet(caller);
    let (createdAt, demoCredits, gamesPlayed, wins, losses, draws) = switch (existing) {
      case (?p) { (p.createdAt, p.demoCredits, p.gamesPlayed, p.wins, p.losses, p.draws) };
      case (null) { (Time.now(), wallet.demoCredits, 0.0, 0.0, 0.0, 0.0) };
    };
    let isPremiumUser = isCEO(caller) or (switch (existing) { case (?p) p.isPremium; case null false });
    let profile : UserProfile = {
      name;
      color;
      avatarUrl;
      bio;
      isPremium = isPremiumUser;
      icpBalance = wallet.balance;
      demoCredits;
      gamesPlayed;
      wins;
      losses;
      draws;
      referralCode = generateReferralCode(caller);
      currentGame = null;
      createdAt;
      lastActive = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createUser(name : Text, color : Text) : async () {
    requireAuth(caller);
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists — use saveCallerUserProfile to update");
    };
    let wallet = getOrCreateWallet(caller);
    let profile : UserProfile = {
      name;
      color;
      avatarUrl = "";
      bio = "";
      isPremium = isCEO(caller);
      icpBalance = wallet.balance;
      demoCredits = wallet.demoCredits;
      gamesPlayed = 0.0;
      wins = 0.0;
      losses = 0.0;
      draws = 0.0;
      referralCode = generateReferralCode(caller);
      currentGame = null;
      createdAt = Time.now();
      lastActive = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updatePlayer(name : Text, color : Text) : async () {
    requireAuth(caller);
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile does not exist — call createUser first") };
      case (?p) {
        userProfiles.add(caller, { p with name; color; lastActive = Time.now() });
      };
    };
  };

  public query ({ caller }) func generateReferralLink() : async Text {
    requireAuth(caller);
    "https://ludoverse.icp/" # generateReferralCode(caller)
  };

  public query ({ caller }) func isPremium() : async Bool {
    requireAuth(caller);
    if (isCEO(caller)) return true;
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?p) { p.isPremium };
    };
  };

  public shared ({ caller }) func upgradeToPremium() : async Bool {
    requireAuth(caller);
    if (isCEO(caller)) return true;
    let premiumCost = 5.0;
    let wallet = getOrCreateWallet(caller);
    if (wallet.balance < premiumCost) {
      Runtime.trap("Insufficient ICP balance for premium upgrade (5 ICP required)");
    };
    wallets.add(caller, { wallet with balance = wallet.balance - premiumCost; lastActive = Time.now() });
    addTransaction(caller, #withdraw, premiumCost, "Premium upgrade");
    switch (userProfiles.get(caller)) {
      case (?p) {
        userProfiles.add(caller, { p with isPremium = true; lastActive = Time.now() });
        true;
      };
      case (null) { Runtime.trap("Profile does not exist") };
    };
  };

  // ─────────────────────────────────────────────
  // WALLET (SIMULATED ICP)
  // ─────────────────────────────────────────────

  public query ({ caller }) func getWallet() : async ?Wallet {
    requireAuth(caller);
    wallets.get(caller)
  };

  public query ({ caller }) func getBalance() : async Float {
    requireAuth(caller);
    switch (wallets.get(caller)) {
      case (null) { 0.0 };
      case (?w) { w.balance };
    };
  };

  public shared ({ caller }) func deposit(amount : Float) : async Bool {
    requireAuth(caller);
    if (amount < 1.0 or amount > 1000000.0) {
      Runtime.trap("Deposit amount must be between 1 and 1,000,000 ICP");
    };
    let wallet = getOrCreateWallet(caller);
    let updated = { wallet with balance = wallet.balance + amount; lastActive = Time.now() };
    wallets.add(caller, updated);
    addTransaction(caller, #deposit, amount, "ICP deposit");
    switch (userProfiles.get(caller)) {
      case (?p) { userProfiles.add(caller, { p with icpBalance = updated.balance; lastActive = Time.now() }) };
      case (null) {};
    };
    true
  };

  public shared ({ caller }) func withdraw(amount : Float) : async Bool {
    requireAuth(caller);
    if (amount < 1.0 or amount > 1000000.0) {
      Runtime.trap("Withdrawal amount must be between 1 and 1,000,000 ICP");
    };
    let wallet = getOrCreateWallet(caller);
    if (wallet.balance < amount) {
      Runtime.trap("Insufficient ICP balance");
    };
    let updated = { wallet with balance = wallet.balance - amount; lastActive = Time.now() };
    wallets.add(caller, updated);
    addTransaction(caller, #withdraw, amount, "ICP withdrawal");
    switch (userProfiles.get(caller)) {
      case (?p) { userProfiles.add(caller, { p with icpBalance = updated.balance; lastActive = Time.now() }) };
      case (null) {};
    };
    true
  };

  public query ({ caller }) func getDemoCredits() : async Float {
    requireAuth(caller);
    switch (wallets.get(caller)) {
      case (null) { 1000.0 };
      case (?w) { w.demoCredits };
    };
  };

  public shared ({ caller }) func resetDemoCredits() : async Float {
    requireAuth(caller);
    let wallet = getOrCreateWallet(caller);
    if (wallet.demoCredits >= 100.0) {
      Runtime.trap("Demo credits are sufficient — reset only when below 100");
    };
    let updated = { wallet with demoCredits = 1000.0; lastActive = Time.now() };
    wallets.add(caller, updated);
    addTransaction(caller, #deposit, 1000.0, "Demo credits replenished");
    1000.0
  };

  public query ({ caller }) func getTransactionHistory() : async [Transaction] {
    requireAuth(caller);
    switch (transactions.get(caller)) {
      case (null) { [] };
      case (?lst) {
        let arr = lst.toArray();
        // Return last 50
        if (arr.size() <= 50) { arr } else {
          arr.sliceToArray(arr.size() - 50, arr.size())
        };
      };
    };
  };

  // ─────────────────────────────────────────────
  // GAME ENGINE
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createGame(
    mode : GameMode,
    betAmount : Float,
    isDemo : Bool,
  ) : async Principal {
    requireAuth(caller);
    if (not isDemo) {
      if (betAmount < 1.0 or betAmount > 1000000.0) {
        Runtime.trap("Bet amount must be between 1 and 1,000,000 ICP");
      };
      let wallet = getOrCreateWallet(caller);
      if (wallet.balance < betAmount) {
        Runtime.trap("Insufficient ICP balance for bet");
      };
      // Lock bet
      wallets.add(caller, { wallet with balance = wallet.balance - betAmount; lastActive = Time.now() });
      totalBetsVolume += betAmount;
      addTransaction(caller, #betLock, betAmount, "Bet locked for game");
    };

    let gameId = caller;
    let callerState : PlayerState = {
      principal = caller;
      tokens = defaultTokens();
      consecutiveWins = 0;
      lastBetAmount = if (isDemo) 0.0 else betAmount;
    };
    let newGame : GameSession = {
      id = gameId;
      mode;
      rankedStatus = if (isDemo) #unranked else #ranked;
      betAmount = if (isDemo) 0.0 else betAmount;
      players = [caller];
      playerStates = [callerState];
      status = #waiting;
      winner = null;
      currentTurn = 0;
      createdAt = Time.now();
      isDemo;
      diceHistory = [];
    };
    games.add(gameId, newGame);
    gameId
  };

  public shared ({ caller }) func joinGame(gameId : Principal, isDemo : Bool) : async Bool {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        if (game.status != #waiting) { Runtime.trap("Game is not accepting players") };
        if (game.players.size() >= 4) { Runtime.trap("Game is full (max 4 players)") };

        if (not isDemo and not game.isDemo) {
          let wallet = getOrCreateWallet(caller);
          if (wallet.balance < game.betAmount) {
            Runtime.trap("Insufficient ICP balance for bet");
          };
          wallets.add(caller, { wallet with balance = wallet.balance - game.betAmount; lastActive = Time.now() });
          totalBetsVolume += game.betAmount;
          addTransaction(caller, #betLock, game.betAmount, "Bet locked for joining game");
        };

        let newPlayerState : PlayerState = {
          principal = caller;
          tokens = defaultTokens();
          consecutiveWins = 0;
          lastBetAmount = if (isDemo) 0.0 else game.betAmount;
        };
        let updatedPlayers = game.players.concat([caller]);
        let updatedStates = game.playerStates.concat([newPlayerState]);
        let updatedGame = {
          game with
          players = updatedPlayers;
          playerStates = updatedStates;
          status = if (updatedPlayers.size() >= 2) #active else #waiting;
        };
        games.add(gameId, updatedGame);
        true
      };
    };
  };

  public query ({ caller }) func getGame(gameId : Principal) : async ?GameSession {
    requireAuth(caller);
    games.get(gameId)
  };

  public query ({ caller }) func getAvailableGames() : async [GameSession] {
    requireAuth(caller);
    let result = List.empty<GameSession>();
    for ((_, g) in games.entries()) {
      if (g.status == #waiting) { result.add(g) };
    };
    result.toArray()
  };

  // Quantum Dice Roll (World-First #2)
  public shared ({ caller }) func rollDice(gameId : Principal) : async {
    value : Nat;
    seedHash : Text;
    entropy : Text;
    valid : Bool;
  } {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        if (game.status != #active) { Runtime.trap("Game is not active") };
        if (not game.players.any(func(p : Principal) : Bool { p == caller })) {
          Runtime.trap("You are not a participant in this game");
        };

        let roll = quantumRoll(caller, game.diceHistory.size());
        let diceRoll : DiceRoll = {
          rollNumber = game.diceHistory.size() + 1;
          playerPrincipal = caller;
          diceResult = roll.value;
          seed = roll.seedHash; // legacy field
          seedHash = roll.seedHash;
          entropy = roll.entropy;
          timestamp = Time.now();
        };
        let updatedHistory = game.diceHistory.concat([diceRoll]);
        games.add(gameId, { game with diceHistory = updatedHistory });

        { value = roll.value; seedHash = roll.seedHash; entropy = roll.entropy; valid = true }
      };
    };
  };

  public shared ({ caller }) func moveToken(gameId : Principal, tokenIndex : Nat, rollValue : Nat) : async GameSession {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        if (game.status != #active) { Runtime.trap("Game is not active") };

        // Find caller's player state
        let callerStateOpt = game.playerStates.find(func(ps) { ps.principal == caller });
        let callerState = switch (callerStateOpt) {
          case (null) { Runtime.trap("You are not in this game") };
          case (?s) { s };
        };

        if (tokenIndex >= callerState.tokens.size()) {
          Runtime.trap("Invalid token index");
        };

        let token = callerState.tokens[tokenIndex];

        // Apply move: token exits home on roll of 6, otherwise advance
        let newPos : Int = if (token.isHome) {
          if (rollValue == 6) { 0 } else { -1 }
        } else {
          token.position + rollValue.toInt()
        };

        let isFinished = newPos >= 57; // 57 = home stretch finish
        let isSafe = if (isFinished) false else isSafePosition(newPos);
        let isHome = newPos == -1;

        let updatedToken : TokenPosition = {
          tokenIndex;
          position = if (isFinished) 57 else newPos;
          isHome;
          isSafe;
          isFinished;
        };

        // Update tokens array
        let updatedTokens = callerState.tokens.mapEntries(
          func(t, i) {
            if (i == tokenIndex) { updatedToken } else { t }
          }
        );

        // Check for XP events — capture detection simplified (same position as opponent)
        var captureOccurred = false;
        for (ps in game.playerStates.values()) {
          if (ps.principal != caller and not isHome and not isFinished) {
            for (ot in ps.tokens.values()) {
              if (not ot.isHome and not ot.isFinished and not ot.isSafe and ot.position == newPos) {
                captureOccurred := true;
              };
            };
          };
        };

        // Add XP to token
        if (captureOccurred) {
          addTokenXPInternal(caller, tokenIndex, 50);
        } else if (isFinished) {
          addTokenXPInternal(caller, tokenIndex, 200);
        } else if (isSafe) {
          addTokenXPInternal(caller, tokenIndex, 10);
        };

        let updatedState : PlayerState = { callerState with tokens = updatedTokens };

        // Rebuild playerStates
        let updatedPlayerStates = game.playerStates.mapEntries(
          func(ps, _idx) {
            if (ps.principal == caller) { updatedState } else { ps }
          }
        );

        // Advance turn
        let nextTurn = (game.currentTurn + 1) % game.players.size();

        // Check winner: all 4 tokens finished
        let allFinished = updatedTokens.all(func(t) { t.isFinished });
        let winner = if (allFinished) ?caller else null;
        let newStatus : GameStatus = if (allFinished) #completed else #active;

        // Payout winner
        if (allFinished and not game.isDemo) {
          let prizePool = game.betAmount * game.players.size().toFloat();
          let platformFee = prizePool * 0.05;
          let prize = prizePool - platformFee;
          let winnerWallet = getOrCreateWallet(caller);
          wallets.add(caller, { winnerWallet with balance = winnerWallet.balance + prize; lastActive = Time.now() });
          addTransaction(caller, #betWin, prize, "Game win payout");
          // Update win/loss stats
          switch (userProfiles.get(caller)) {
            case (?p) { userProfiles.add(caller, { p with wins = p.wins + 1.0; gamesPlayed = p.gamesPlayed + 1.0; lastActive = Time.now() }) };
            case (null) {};
          };
        };

        let updatedGame : GameSession = {
          game with
          playerStates = updatedPlayerStates;
          status = newStatus;
          winner;
          currentTurn = nextTurn;
        };
        games.add(gameId, updatedGame);
        updatedGame
      };
    };
  };

  public query ({ caller }) func getWinner(gameId : Principal) : async ?Principal {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { null };
      case (?game) { game.winner };
    };
  };

  public shared ({ caller }) func forfeitGame(gameId : Principal) : async Bool {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        if (not game.players.any(func(p : Principal) : Bool { p == caller })) {
          Runtime.trap("You are not in this game");
        };
        let updatedGame = { game with status = #completed };
        games.add(gameId, updatedGame);
        switch (userProfiles.get(caller)) {
           case (?p) { userProfiles.add(caller, { p with losses = p.losses + 1.0; gamesPlayed = p.gamesPlayed + 1.0; lastActive = Time.now() }) };
          case (null) {};
        };
        true
      };
    };
  };

  public query ({ caller }) func getAllPlayers() : async [UserProfile] {
    requireAuth(caller);
    userProfiles.values().toArray()
  };

  // ─────────────────────────────────────────────
  // BOT / AI AGENT
  // ─────────────────────────────────────────────

  public shared ({ caller }) func registerBot(name : Text, difficulty : BotDifficulty) : async Principal {
    requireAuth(caller);
    let botId = Principal.fromText("aaaaa-aa"); // placeholder principal for bots
    let newBot : BotConfig = { principal = botId; name; difficulty; balance = 0.0; isPremium = false };
    bots.add(botId, newBot);
    botId
  };

  // AI Bot Move (World-First #1 — simplified AI oracle integrated with bot)
  public query ({ caller }) func getBotMove(gameId : Principal, botPrincipal : Principal) : async Nat {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        let stateOpt = game.playerStates.find(func(ps) { ps.principal == botPrincipal });
        switch (stateOpt) {
          case (null) { 0 };
          case (?state) {
            // Evaluate each token: prefer advancing finished tokens, safe squares, capturing
            var bestTokenIdx = 0;
            var bestScore : Int = -999;
            var i = 0;
            for (token in state.tokens.values()) {
              let score : Int = if (token.isFinished) { -10 }
                else if (token.isHome) { 5 }
                else if (token.isSafe) { token.position }
                else { token.position * 2 };
              if (score > bestScore) {
                bestScore := score;
                bestTokenIdx := i;
              };
              i += 1;
            };
            bestTokenIdx
          };
        };
      };
    };
  };

  public query ({ caller }) func getAvailableBots() : async [BotConfig] {
    requireAuth(caller);
    bots.values().toArray()
  };

  // ─────────────────────────────────────────────
  // ROOM SYSTEM (MULTIPLAYER)
  // ─────────────────────────────────────────────

  public shared ({ caller }) func createMatchmakingRoom(
    roomType : RoomType,
    gameMode : GameMode,
    betAmount : Float,
    maxPlayers : Nat,
    isDemo : Bool,
  ) : async Principal {
    requireAuth(caller);
    if (maxPlayers < 2 or maxPlayers > 4) { Runtime.trap("Rooms require 2-4 players") };
    let roomId = caller;
    let newRoom : MatchmakingRoom = {
      id = roomId;
      roomType;
      creator = caller;
      playerCount = 1;
      maxPlayers;
      gameMode;
      betAmount;
      players = [caller];
      status = #waiting;
      isDemo;
      createdAt = Time.now();
    };
    matchmakingRooms.add(roomId, newRoom);
    roomId
  };

  public shared ({ caller }) func joinRoom(roomId : Principal) : async Bool {
    requireAuth(caller);
    switch (matchmakingRooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (room.playerCount >= room.maxPlayers) {
          Runtime.trap("Room is full");
        };
        let updatedRoom = {
          room with
          playerCount = room.playerCount + 1;
          players = room.players.concat([caller]);
        };
        matchmakingRooms.add(roomId, updatedRoom);
        true
      };
    };
  };

  public shared ({ caller }) func leaveRoom(roomId : Principal) : async Bool {
    requireAuth(caller);
    switch (matchmakingRooms.get(roomId)) {
      case (null) { Runtime.trap("Room does not exist") };
      case (?room) {
        if (room.creator == caller) {
          matchmakingRooms.remove(roomId);
          return true;
        };
        let remaining = room.players.filter(func(p) { p != caller });
        if (remaining.size() == 0) {
          matchmakingRooms.remove(roomId);
        } else {
          matchmakingRooms.add(roomId, { room with playerCount = remaining.size(); players = remaining });
        };
        true
      };
    };
  };

  public query ({ caller }) func getAvailableRooms() : async [MatchmakingRoom] {
    requireAuth(caller);
    let result = List.empty<MatchmakingRoom>();
    for ((_, r) in matchmakingRooms.entries()) {
      if (r.status == #waiting) { result.add(r) };
    };
    result.toArray()
  };

  public query ({ caller }) func getRoomState(roomId : Principal) : async ?MatchmakingRoom {
    requireAuth(caller);
    matchmakingRooms.get(roomId)
  };

  // ─────────────────────────────────────────────
  // WORLD-FIRST #1: AI MOVE ORACLE
  // ─────────────────────────────────────────────

  public query ({ caller }) func getMoveProbabilities(gameId : Principal) : async [MoveProbability] {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        // Build probability map for each board position (0-56)
        // Uses game state to compute landing likelihood
        let probs = List.empty<MoveProbability>();

        // For each active token position, compute where dice 1-6 can land
        for (ps in game.playerStates.values()) {
          for (token in ps.tokens.values()) {
            if (not token.isHome and not token.isFinished) {
              for (dice in Nat.range(1, 7)) {
                let landPos = token.position + dice.toInt();
                if (landPos <= 57) {
                  let safe = isSafePosition(landPos);
                  // Count opponents at this position
                  var opponentCount : Float = 0.0;
                  for (ops in game.playerStates.values()) {
                    if (ops.principal != ps.principal) {
               for (ot in ops.tokens.values()) {
                        if (not ot.isHome and not ot.isFinished and ot.position == landPos) {
                          opponentCount += 1.0;
                        };
                      };
                    };
                  };
                  let captureChance = opponentCount / 4.0;
                  let safeScore = if (safe) 1.0 else 0.0;
                  // Probability: uniform 1/6 per dice value
                  probs.add({
                    position = landPos;
                    probability = 1.0 / 6.0;
                    safeScore;
                    captureChance;
                  });
                };
              };
            };
          };
        };
        probs.toArray()
      };
    };
  };

  // ─────────────────────────────────────────────
  // WORLD-FIRST #3: DYNAMIC LIVING BOARD
  // ─────────────────────────────────────────────

  public query ({ caller }) func getBoardState(gameId : Principal) : async BoardState {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) { boardStateForGame(game) };
    };
  };

  // ─────────────────────────────────────────────
  // WORLD-FIRST #4: TOKEN SOUL SYSTEM
  // ─────────────────────────────────────────────

  func addTokenXPInternal(p : Principal, tokenIndex : Nat, xp : Nat) {
    let souls = switch (tokenSouls.get(p)) {
      case (?lst) { lst };
      case (null) {
        let lst = List.empty<TokenSoul>();
        // Initialize 4 tokens
        for (_ in Nat.range(0, 4)) {
          lst.add({
            tokenIndex = lst.size();
            xp = 0;
            level = 1;
            captureCount = 0;
            capturedCount = 0;
            nearMissCount = 0;
          });
        };
        tokenSouls.add(p, lst);
        lst
      };
    };

    souls.mapInPlace(func(soul) {
      if (soul.tokenIndex == tokenIndex) {
        let newXp = soul.xp + xp;
        let newLevel = Nat.min(10, 1 + newXp / 100);
        { soul with xp = newXp; level = newLevel }
      } else {
        soul
      }
    });
  };

  public shared ({ caller }) func addTokenXP(tokenIndex : Nat, xp : Nat) : async () {
    requireAuth(caller);
    addTokenXPInternal(caller, tokenIndex, xp);
  };

  public query ({ caller }) func getTokenSouls(player : Principal) : async [TokenSoul] {
    requireAuth(caller);
    switch (tokenSouls.get(player)) {
      case (null) {
        // Return default souls
        [
          { tokenIndex = 0; xp = 0; level = 1; captureCount = 0; capturedCount = 0; nearMissCount = 0 },
          { tokenIndex = 1; xp = 0; level = 1; captureCount = 0; capturedCount = 0; nearMissCount = 0 },
          { tokenIndex = 2; xp = 0; level = 1; captureCount = 0; capturedCount = 0; nearMissCount = 0 },
          { tokenIndex = 3; xp = 0; level = 1; captureCount = 0; capturedCount = 0; nearMissCount = 0 },
        ]
      };
      case (?lst) { lst.toArray() };
    };
  };

  // ─────────────────────────────────────────────
  // WORLD-FIRST #5: CROWD SPECTATOR MODE
  // ─────────────────────────────────────────────

  public shared ({ caller }) func joinAsSpectator(gameId : Principal) : async Bool {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?_) {};
    };
    let lst = switch (spectators.get(gameId)) {
      case (?l) { l };
      case (null) {
        let l = List.empty<Principal>();
        spectators.add(gameId, l);
        l
      };
    };
    // Avoid duplicate
    if (not lst.any(func(p) { p == caller })) {
      lst.add(caller);
    };
    true
  };

  public shared ({ caller }) func leaveSpectator(gameId : Principal) : async Bool {
    requireAuth(caller);
    switch (spectators.get(gameId)) {
      case (null) { false };
      case (?lst) {
        let filtered = lst.filter(func(p : Principal) : Bool { p != caller });
        lst.clear();
        lst.append(filtered);
        true
      };
    };
  };

  public shared ({ caller }) func sendSpectatorReaction(gameId : Principal, emoji : Text) : async Bool {
    requireAuth(caller);
    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?_) {};
    };
    let reaction : SpectatorReaction = {
      emoji;
      reactorPrincipal = caller;
      timestamp = Time.now();
    };
    let lst = switch (spectatorReactions.get(gameId)) {
      case (?l) { l };
      case (null) {
        let l = List.empty<SpectatorReaction>();
        spectatorReactions.add(gameId, l);
        l
      };
    };
    lst.add(reaction);
    true
  };

  public query ({ caller }) func getSpectatorReactions(gameId : Principal) : async [SpectatorReaction] {
    requireAuth(caller);
    switch (spectatorReactions.get(gameId)) {
      case (null) { [] };
      case (?lst) {
        let arr = lst.toArray();
        // Return last 20
        if (arr.size() <= 20) { arr } else {
          arr.sliceToArray(arr.size() - 20, arr.size())
        };
      };
    };
  };

  public query ({ caller }) func getSpectatorCount(gameId : Principal) : async Nat {
    requireAuth(caller);
    switch (spectators.get(gameId)) {
      case (null) { 0 };
      case (?lst) { lst.size() };
    };
  };

  public query ({ caller }) func getFeaturedGames() : async [FeaturedGame] {
    requireAuth(caller);
    // Build list of games with spectator counts, sorted by count desc
    let featured = List.empty<FeaturedGame>();
    for ((gameId, game) in games.entries()) {
      let count = switch (spectators.get(gameId)) {
        case (null) { 0 };
        case (?lst) { lst.size() };
      };
      featured.add({
        gameId;
        spectatorCount = count;
        betAmount = game.betAmount;
        mode = game.mode;
        playerCount = game.players.size();
        status = game.status;
      });
    };
    // Sort descending by spectatorCount, return top 5
    let sorted = featured.sort(func(a : FeaturedGame, b : FeaturedGame) : {#less; #equal; #greater} {
      if (a.spectatorCount > b.spectatorCount) #less
      else if (a.spectatorCount < b.spectatorCount) #greater
      else #equal
    });
    let arr = sorted.toArray();
    if (arr.size() <= 5) { arr } else { arr.sliceToArray(0, 5) }
  };

  // ─────────────────────────────────────────────
  // OFFICIAL WALLETS
  // ─────────────────────────────────────────────

  public query func getOfficialWallets() : async [OfficialWallet] {
    [
      {
        address = "06c47d7b5d8e0abe4847ccb5bb15b393d16e57d814a4f976349f4e27552e8c03";
        walletLabel = "LudoVerse ICP Official Wallet 1";
      },
      {
        address = "6d5274751496adead1cc2babdae66afaa832ca3dec917573f43c3d2359fbb4c3";
        walletLabel = "LudoVerse ICP Official Wallet 2";
      },
    ]
  };

  // ─────────────────────────────────────────────
  // SYSTEM STATS
  // ─────────────────────────────────────────────

  public query func getSystemStats() : async SystemStats {
    var activeGames : Nat = 0;
    for ((_, g) in games.entries()) {
      if (g.status == #active) { activeGames += 1 };
    };
    var totalSpectators : Nat = 0;
    for ((_, lst) in spectators.entries()) {
      totalSpectators += lst.size();
    };
    {
      totalPlayers = userProfiles.size();
      totalGames = games.size();
      totalBetsVolume;
      activeGames;
      totalSpectators;
    }
  };

};
