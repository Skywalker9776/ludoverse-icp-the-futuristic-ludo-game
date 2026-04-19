import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";



actor {
  include MixinStorage();

  public type BotDifficulty = { #easy; #medium; #hard };
  public type BotConfig = {
    principal : Principal;
    difficulty : BotDifficulty;
    isPremium : Bool;
    balance : Float;
  };

  public type GameMode = {
    #classic;
    #quick;
    #master;
    #advanced;
    #team;
    #challenge;
    #demo;
    #superLudo;
    #bonus;
    #timed;
    #twoVsTwo;
    #practice;
    #experimental;
    #custom;
    #tournament;
    #copyFast;
    #copyClassic;
  };

  public type GameStatus = { #waiting; #active; #completed };
  public type RankedStatus = { #ranked; #unranked };
  public type Player = {
    principal : Principal;
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  public type UserProfile = {
    name : Text;
    color : Text;
    isPremium : Bool;
    icpBalance : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  public type Wallet = {
    id : Principal;
    balance : Float;
    createdAt : Int;
    lastActive : Int;
  };

  public type OfficialWallet = {
    address : Text;
    balance : Float;
  };

  public type RoomType = { #privateRoom; #isPublic };
  public type MatchmakingRoom = {
    id : Principal;
    roomType : RoomType;
    creator : Principal;
    playerCount : Nat;
    maxPlayers : Nat;
    gameMode : GameMode;
    players : [Principal];
    status : { #waiting; #active; #completed };
    isDemo : Bool;
  };

  public type DiceRoll = {
    rollNumber : Nat;
    playerPrincipal : Principal;
    diceResult : Nat;
    seed : Text;
    timestamp : Int;
  };

  public type GameSession = {
    id : Principal;
    mode : GameMode;
    rankedStatus : RankedStatus;
    betAmount : Float;
    players : [Principal];
    status : GameStatus;
    winner : ?Principal;
    createdAt : Int;
    isDemo : Bool;
    diceHistory : [DiceRoll];
  };

  let accessControlState = AccessControl.initState();
  let players = Map.empty<Principal, Player>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let wallets = Map.empty<Principal, Wallet>();
  let games = Map.empty<Principal, GameSession>();
  let bots = Map.empty<Principal, BotConfig>();
  let matchmakingRooms = Map.empty<Principal, MatchmakingRoom>();
  let ceoPrincipal = Principal.fromText("aaaaa-aa");

  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func automaticUserInitialization() : async {
    loginSuccess : Bool;
    wallet : Wallet;
    playerExists : Bool;
    message : Text;
  } {
    AccessControl.initialize(accessControlState, caller);
    switch (wallets.get(caller)) {
      case (null) {
        let newWallet : Wallet = {
          id = caller;
          balance = 0.0;
          createdAt = Time.now();
          lastActive = Time.now();
        };
        wallets.add(caller, newWallet);
        {
          loginSuccess = true;
          wallet = newWallet;
          playerExists = players.containsKey(caller);
          message = "New wallet created and user initialized";
        };
      };
      case (?existingWallet) {
        let updatedWallet = { existingWallet with lastActive = Time.now() };
        wallets.add(caller, updatedWallet);
        {
          loginSuccess = true;
          wallet = updatedWallet;
          playerExists = players.containsKey(caller);
          message = if (players.containsKey(caller)) {
            "Returning user authenticated successfully";
          } else {
            "User authenticated, ready to create player profile";
          };
        };
      };
    };
  };

  public query ({ caller }) func isFirstTime() : async Bool {
    switch (wallets.get(caller)) {
      case (null) { return true };
      case (?_) { return not players.containsKey(caller) };
    };
  };

  public query ({ caller }) func getOfficialWallets() : async [OfficialWallet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view official wallets");
    };
    [
      {
        address = "06c47d7b5d8e0abe4847ccb5bb15b393d16e57d814a4f976349f4e27552e8c03";
        balance = 100000.0;
      },
      {
        address = "6d5274751496adead1cc2babdae66afaa832ca3dec917573f43c3d2359fbb4c3";
        balance = 50000.0;
      },
    ];
  };

  public query ({ caller }) func getOfficialAccount(isFirst : Bool) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can access official account information");
    };
    if (isFirst) {
      "06c47d7b5d8e0abe4847ccb5bb15b393d16e57d814a4f976349f4e27552e8c03";
    } else {
      "6d5274751496adead1cc2babdae66afaa832ca3dec917573f43c3d2359fbb4c3";
    };
  };

  public shared ({ caller }) func createUser(name : Text, color : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create profiles");
    };

    switch (players.get(caller)) {
      case (?_) { Runtime.trap("Player already exists") };
      case (null) {
        let isCEO = caller == ceoPrincipal;
        let newPlayer : Player = {
          principal = caller;
          name;
          color;
          isPremium = isCEO;
          icpBalance = 0.0;
          gamesPlayed = 0.0;
          wins = 0.0;
          losses = 0.0;
          draws = 0.0;
          currentGame = null;
          createdAt = Time.now();
          lastActive = Time.now();
        };
        players.add(caller, newPlayer);

        let newProfile : UserProfile = {
          name;
          color;
          isPremium = isCEO;
          icpBalance = 0.0;
          gamesPlayed = 0.0;
          wins = 0.0;
          losses = 0.0;
          draws = 0.0;
          currentGame = null;
          createdAt = Time.now();
          lastActive = Time.now();
        };
        userProfiles.add(caller, newProfile);

        switch (wallets.get(caller)) {
          case (null) {
            let newWallet : Wallet = {
              id = caller;
              balance = 0.0;
              createdAt = Time.now();
              lastActive = Time.now();
            };
            wallets.add(caller, newWallet);
          };
          case (?_) {};
        };
      };
    };
  };

  public query ({ caller }) func getPlayer(principal : Principal) : async ?Player {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view player information");
    };
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own player information");
    };
    players.get(principal);
  };

  public shared ({ caller }) func updatePlayer(name : Text, color : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update profiles");
    };
    switch (players.get(caller)) {
      case (null) { Runtime.trap("Player does not exist") };
      case (?existingPlayer) {
        let updatedPlayer : Player = {
          existingPlayer with
          name = name;
          color = color;
          lastActive = Time.now();
        };
        players.add(caller, updatedPlayer);

        switch (userProfiles.get(caller)) {
          case (?existingProfile) {
            let updatedProfile : UserProfile = {
              existingProfile with
              name = name;
              color = color;
              lastActive = Time.now();
            };
            userProfiles.add(caller, updatedProfile);
          };
          case (null) {};
        };
      };
    };
  };

  public query ({ caller }) func getWallet() : async ?Wallet {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view wallet information");
    };
    wallets.get(caller);
  };

  public query ({ caller }) func getBalance() : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view balance");
    };
    switch (wallets.get(caller)) {
      case (null) { 0.0 };
      case (?wallet) { wallet.balance };
    };
  };

  public shared ({ caller }) func deposit(amount : Float) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can deposit");
    };

    if (amount < 1.0 or amount > 1000000.0) {
      Runtime.trap("Invalid deposit amount: must be between 1 and 1,000,000 ICP");
    };

    switch (wallets.get(caller)) {
      case (null) {
        let newWallet : Wallet = {
          id = caller;
          balance = amount;
          createdAt = Time.now();
          lastActive = Time.now();
        };
        wallets.add(caller, newWallet);
        true;
      };
      case (?existingWallet) {
        let updatedWallet : Wallet = {
          existingWallet with
          balance = existingWallet.balance + amount;
          lastActive = Time.now();
        };
        wallets.add(caller, updatedWallet);
        switch (players.get(caller)) {
          case (?player) {
            let updatedPlayer = {
              player with
              icpBalance = player.icpBalance + amount;
              lastActive = Time.now();
            };
            players.add(caller, updatedPlayer);
          };
          case (null) {};
        };
        true;
      };
    };
  };

  public shared ({ caller }) func withdraw(amount : Float) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can withdraw");
    };

    if (amount < 1.0 or amount > 1000000.0) {
      Runtime.trap("Invalid withdrawal amount: must be between 1 and 1,000,000 ICP");
    };

    switch (wallets.get(caller)) {
      case (null) { Runtime.trap("Wallet does not exist") };
      case (?existingWallet) {
        if (existingWallet.balance < amount) {
          Runtime.trap("Insufficient balance");
        };
        let updatedWallet : Wallet = {
          existingWallet with
          balance = existingWallet.balance - amount;
          lastActive = Time.now();
        };
        wallets.add(caller, updatedWallet);
        switch (players.get(caller)) {
          case (?player) {
            let updatedPlayer = {
              player with
              icpBalance = player.icpBalance - amount;
              lastActive = Time.now();
            };
            players.add(caller, updatedPlayer);
          };
          case (null) {};
        };
        true;
      };
    };
  };

  public shared ({ caller }) func upgradeToPremium() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can upgrade to premium");
    };

    if (caller == ceoPrincipal) {
      switch (players.get(caller)) {
        case (?player) {
          let updatedPlayer = {
            player with
            isPremium = true;
            lastActive = Time.now();
          };
          players.add(caller, updatedPlayer);
          return true;
        };
        case (null) { Runtime.trap("Player does not exist") };
      };
    };

    let premiumCost = 5.0;

    switch (wallets.get(caller)) {
      case (null) { Runtime.trap("Wallet does not exist") };
      case (?wallet) {
        if (wallet.balance < premiumCost) {
          Runtime.trap("Insufficient balance for premium upgrade");
        };

        let updatedWallet = {
          wallet with
          balance = wallet.balance - premiumCost;
          lastActive = Time.now();
        };
        wallets.add(caller, updatedWallet);

        switch (players.get(caller)) {
          case (?player) {
            let updatedPlayer = {
              player with
              isPremium = true;
              icpBalance = player.icpBalance - premiumCost;
              lastActive = Time.now();
            };
            players.add(caller, updatedPlayer);
            true;
          };
          case (null) { Runtime.trap("Player does not exist") };
        };
      };
    };
  };

  public query ({ caller }) func isPremium() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can check premium status");
    };
    if (caller == ceoPrincipal) {
      return true;
    };

    switch (players.get(caller)) {
      case (null) { false };
      case (?player) { player.isPremium };
    };
  };

  public shared ({ caller }) func createGame(mode : GameMode, rankedStatus : RankedStatus, betAmount : Float, isDemo : Bool) : async Principal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create games");
    };

    if (betAmount < 1.0 or betAmount > 1000000.0) {
      Runtime.trap("Invalid bet amount: must be between 1 and 1,000,000 ICP");
    };

    if (not isDemo) {
      switch (wallets.get(caller)) {
        case (null) { Runtime.trap("Wallet does not exist") };
        case (?wallet) {
          if (wallet.balance < betAmount) {
            Runtime.trap("Insufficient balance for bet");
          };
        };
      };
    };

    let gameId = caller;
    let newGame : GameSession = {
      id = gameId;
      mode = mode;
      rankedStatus = if (isDemo) { #unranked } else { rankedStatus };
      betAmount = if (isDemo) { 0.0 } else { betAmount };
      players = [caller];
      status = #waiting;
      winner = null;
      createdAt = Time.now();
      isDemo = isDemo;
      diceHistory = [];
    };
    games.add(gameId, newGame);
    gameId;
  };

  public shared ({ caller }) func joinGame(gameId : Principal, isDemo : Bool) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can join games");
    };

    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        if (game.status != #waiting) {
          Runtime.trap("Game is not accepting players");
        };

        if (not isDemo and not game.isDemo) {
          switch (wallets.get(caller)) {
            case (null) { Runtime.trap("Wallet does not exist") };
            case (?wallet) {
              if (wallet.balance < game.betAmount) {
                Runtime.trap("Insufficient balance for bet");
              };
            };
          };
        };

        let updatedPlayers = game.players.concat([caller]);
        let updatedGame = {
          game with
          players = updatedPlayers;
          status = #active;
        };
        games.add(gameId, updatedGame);
        true;
      };
    };
  };

  public query ({ caller }) func getAvailableGames() : async [GameSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view available games");
    };

    let availableGames = Map.empty<Principal, GameSession>();
    for ((id, game) in games.entries()) {
      if (game.status == #waiting) {
        availableGames.add(id, game);
      };
    };
    availableGames.values().toArray();
  };

  func isGameParticipant(caller : Principal, game : GameSession) : Bool {
    let players = game.players;
    for (player in players.vals()) {
      if (player == caller) {
        return true;
      };
    };
    false;
  };

  public query ({ caller }) func getGame(gameId : Principal) : async ?GameSession {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view game details");
    };

    switch (games.get(gameId)) {
      case (null) { null };
      case (?game) {
        if (not isGameParticipant(caller, game) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view games you are participating in");
        };
        ?game;
      };
    };
  };

  public query ({ caller }) func getAllPlayers() : async [Player] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all players");
    };
    players.values().toArray();
  };

  public query ({ caller }) func getAllWallets() : async [Wallet] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all wallets");
    };
    wallets.values().toArray();
  };

  public query ({ caller }) func getAllGames() : async [GameSession] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all games");
    };
    games.values().toArray();
  };

  public query ({ caller }) func getSystemStats() : async {
    totalPlayers : Int;
    totalGames : Int;
    totalWallets : Int;
    totalBalance : Float;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view system stats");
    };

    var totalBalance : Float = 0.0;
    for ((_, wallet) in wallets.entries()) {
      totalBalance += wallet.balance;
    };

    {
      totalPlayers = players.size();
      totalGames = games.size();
      totalWallets = wallets.size();
      totalBalance = totalBalance;
    };
  };

  public shared ({ caller }) func registerBot(difficulty : BotDifficulty) : async Principal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register bots");
    };

    let botId = createBotPrincipal();
    let newBot : BotConfig = {
      principal = botId;
      difficulty;
      isPremium = false;
      balance = 0.0;
    };
    bots.add(botId, newBot);
    botId;
  };

  public shared ({ caller }) func activatePremiumBot(botId : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can activate premium bots");
    };

    switch (bots.get(botId)) {
      case (null) { Runtime.trap("Bot does not exist") };
      case (?bot) {
        let updatedBot : BotConfig = {
          bot with isPremium = true;
        };
        bots.add(botId, updatedBot);
      };
    };
  };

  public query ({ caller }) func getAvailableBots() : async [BotConfig] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view available bots");
    };
    bots.values().toArray();
  };

  public query ({ caller }) func getAllBots() : async [BotConfig] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all bots");
    };
    bots.values().toArray();
  };

  func createBotPrincipal() : Principal {
    let newId = bots.size() + 1;
    Principal.fromText("bot-" # newId.toText());
  };

  public shared ({ caller }) func createMatchmakingRoom(roomType : RoomType, gameMode : GameMode, maxPlayers : Nat, isDemo : Bool) : async Principal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create rooms");
    };
    if (maxPlayers > 6) { Runtime.trap("Maximum 6 players for this game."); };
    let roomId = caller;
    let newRoom : MatchmakingRoom = {
      id = roomId;
      roomType;
      creator = caller;
      playerCount = 1;
      maxPlayers = maxPlayers;
      gameMode;
      players = [caller];
      status = #waiting;
      isDemo;
    };
    matchmakingRooms.add(roomId, newRoom);
    roomId;
  };

  public shared ({ caller }) func joinRoom(roomId : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can join rooms");
    };
    switch (matchmakingRooms.get(roomId)) {
      case (null) { Runtime.trap("Matchmaking room does not exist") };
      case (?room) {
        if (room.playerCount >= room.maxPlayers) {
          Runtime.trap("Room reached max players: " # room.maxPlayers.toText() # ".");
        };
        let updatedPlayers = room.players.concat([caller]);
        let updatedRoom = {
          room with
          playerCount = room.playerCount + 1;
          players = updatedPlayers;
        };
        matchmakingRooms.add(roomId, updatedRoom);
        true;
      };
    };
  };

  public shared ({ caller }) func leaveRoom(roomId : Principal) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can leave rooms");
    };
    switch (matchmakingRooms.get(roomId)) {
      case (null) { Runtime.trap("Matchmaking room does not exist") };
      case (?room) {
        var isInRoom = false;
        for (p in room.players.vals()) {
          if (p == caller) { isInRoom := true };
        };
        if (not isInRoom) {
          Runtime.trap("Unauthorized: You are not in this room");
        };

        if (room.creator == caller) {
          // Room creator is leaving, so the room will be deleted.
          matchmakingRooms.remove(roomId);
          return true;
        };
        let updatedPlayers = room.players.filter(func(player) { player != caller });
        if (updatedPlayers.size() == 0) {
          // No players remaining, so the room will be deleted.
          matchmakingRooms.remove(roomId);
        } else {
          let updatedRoom = {
            room with
            playerCount = room.playerCount - 1;
            players = updatedPlayers;
          };
          matchmakingRooms.add(roomId, updatedRoom);
        };
        true;
      };
    };
  };

  public query ({ caller }) func getAvailableRooms() : async [MatchmakingRoom] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view available rooms");
    };
    let availableRooms = Map.empty<Principal, MatchmakingRoom>();
    for ((id, room) in matchmakingRooms.entries()) {
      if (room.status == #waiting) {
        availableRooms.add(id, room);
      };
    };
    availableRooms.values().toArray();
  };

  public shared ({ caller }) func rollDice(gameId : Principal, player : Principal) : async {
    result : Nat;
    seed : Text;
    valid : Bool;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can roll dice");
    };

    // Verify caller is rolling for themselves
    if (caller != player) {
      Runtime.trap("Unauthorized: You can only roll dice for yourself");
    };

    switch (games.get(gameId)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?game) {
        // Verify caller is a participant in the game
        if (not isGameParticipant(caller, game)) {
          Runtime.trap("Unauthorized: You are not a participant in this game");
        };

        if (game.status != #active) {
          Runtime.trap("Game is not in progress");
        };

        // Insecure random number generation, pending integration with a secure randomness provider
        let timestamp = Time.now();
        let seed = timestamp.toText();
        let result = ((timestamp % 6) + 1).toNat();

        let newDiceRoll : DiceRoll = {
          rollNumber = game.diceHistory.size() + 1;
          playerPrincipal = player;
          diceResult = result;
          seed;
          timestamp;
        };

        let updatedDiceHistory = game.diceHistory.concat([newDiceRoll]);
        let updatedGame = {
          game with
          diceHistory = updatedDiceHistory;
        };
        games.add(gameId, updatedGame);
        {
          result;
          seed;
          valid = true;
        };
      };
    };
  };

  public query ({ caller }) func getDiceHistory(gameId : Principal) : async ?[DiceRoll] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view dice history");
    };

    switch (games.get(gameId)) {
      case (null) { null };
      case (?game) {
        // Verify caller is a participant in the game or an admin
        if (not isGameParticipant(caller, game) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view dice history for games you are participating in");
        };
        ?game.diceHistory;
      };
    };
  };
};
