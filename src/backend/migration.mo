import Map "mo:core/Map";
import List "mo:core/List";

module {

  // ── Old types (inline, copied from .old/src/backend/main.mo) ──────────────

  type OldBotDifficulty = { #easy; #medium; #hard };

  type OldBotConfig = {
    principal : Principal;
    difficulty : OldBotDifficulty;
    isPremium : Bool;
    balance : Float;
  };

  type OldGameMode = {
    #classic; #quick; #master; #advanced; #team; #challenge; #demo;
    #superLudo; #bonus; #timed; #twoVsTwo; #practice; #experimental;
    #custom; #tournament; #copyFast; #copyClassic;
  };

  type OldGameStatus = { #waiting; #active; #completed };
  type OldRankedStatus = { #ranked; #unranked };

  type OldDiceRoll = {
    rollNumber : Nat;
    playerPrincipal : Principal;
    diceResult : Nat;
    seed : Text;
    timestamp : Int;
  };

  type OldGameSession = {
    id : Principal;
    mode : OldGameMode;
    rankedStatus : OldRankedStatus;
    betAmount : Float;
    players : [Principal];
    status : OldGameStatus;
    winner : ?Principal;
    createdAt : Int;
    isDemo : Bool;
    diceHistory : [OldDiceRoll];
  };

  type OldRoomType = { #privateRoom; #isPublic };

  type OldMatchmakingRoom = {
    id : Principal;
    roomType : OldRoomType;
    creator : Principal;
    playerCount : Nat;
    maxPlayers : Nat;
    gameMode : OldGameMode;
    players : [Principal];
    status : { #waiting; #active; #completed };
    isDemo : Bool;
  };

  type OldUserProfile = {
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

  type OldWallet = {
    id : Principal;
    balance : Float;
    createdAt : Int;
    lastActive : Int;
  };

  type OldPlayer = {
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

  type OldUserRole = { #admin; #guest; #user };

  type OldAccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, OldUserRole>;
  };

  // ── New types (matching new main.mo definitions) ───────────────────────────

  type NewBotDifficulty = { #easy; #medium; #hard };

  type NewBotConfig = {
    principal : Principal;
    name : Text;
    difficulty : NewBotDifficulty;
    balance : Float;
    isPremium : Bool;
  };

  type NewGameMode = {
    #classic; #quick; #master; #magic; #demo; #tournament; #custom;
    #advanced; #bonus; #challenge; #copyClassic; #copyFast;
    #experimental; #practice; #superLudo; #team; #timed; #twoVsTwo;
  };

  type NewGameStatus = { #waiting; #active; #completed };
  type NewRankedStatus = { #ranked; #unranked };

  type NewTokenPosition = {
    tokenIndex : Nat;
    position : Int;
    isHome : Bool;
    isSafe : Bool;
    isFinished : Bool;
  };

  type NewPlayerState = {
    principal : Principal;
    tokens : [NewTokenPosition];
    consecutiveWins : Nat;
    lastBetAmount : Float;
  };

  type NewDiceRoll = {
    rollNumber : Nat;
    playerPrincipal : Principal;
    diceResult : Nat;
    seed : Text;
    seedHash : Text;
    entropy : Text;
    timestamp : Int;
  };

  type NewGameSession = {
    id : Principal;
    mode : NewGameMode;
    rankedStatus : NewRankedStatus;
    betAmount : Float;
    players : [Principal];
    playerStates : [NewPlayerState];
    status : NewGameStatus;
    winner : ?Principal;
    currentTurn : Nat;
    createdAt : Int;
    isDemo : Bool;
    diceHistory : [NewDiceRoll];
  };

  type NewRoomType = { #privateRoom; #isPublic };

  type NewMatchmakingRoom = {
    id : Principal;
    roomType : NewRoomType;
    creator : Principal;
    playerCount : Nat;
    maxPlayers : Nat;
    gameMode : NewGameMode;
    betAmount : Float;
    players : [Principal];
    status : { #waiting; #active; #completed };
    isDemo : Bool;
    createdAt : Int;
  };

  type NewUserProfile = {
    name : Text;
    color : Text;
    avatarUrl : Text;
    bio : Text;
    isPremium : Bool;
    icpBalance : Float;
    demoCredits : Float;
    gamesPlayed : Float;
    wins : Float;
    losses : Float;
    draws : Float;
    referralCode : Text;
    currentGame : ?Principal;
    createdAt : Int;
    lastActive : Int;
  };

  type NewWallet = {
    id : Principal;
    balance : Float;
    demoCredits : Float;
    createdAt : Int;
    lastActive : Int;
  };

  // ── Migration input and output ─────────────────────────────────────────────

  type OldActor = {
    accessControlState : OldAccessControlState;
    players : Map.Map<Principal, OldPlayer>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    wallets : Map.Map<Principal, OldWallet>;
    games : Map.Map<Principal, OldGameSession>;
    bots : Map.Map<Principal, OldBotConfig>;
    matchmakingRooms : Map.Map<Principal, OldMatchmakingRoom>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    wallets : Map.Map<Principal, NewWallet>;
    games : Map.Map<Principal, NewGameSession>;
    bots : Map.Map<Principal, NewBotConfig>;
    matchmakingRooms : Map.Map<Principal, NewMatchmakingRoom>;
  };

  // ── Helper: default token positions ────────────────────────────────────────

  func defaultTokens() : [NewTokenPosition] {
    [
      { tokenIndex = 0; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 1; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 2; position = -1; isHome = true; isSafe = false; isFinished = false },
      { tokenIndex = 3; position = -1; isHome = true; isSafe = false; isFinished = false },
    ]
  };

  func migrateGameMode(m : OldGameMode) : NewGameMode {
    switch (m) {
      case (#classic) { #classic };
      case (#quick) { #quick };
      case (#master) { #master };
      case (#advanced) { #advanced };
      case (#team) { #team };
      case (#challenge) { #challenge };
      case (#demo) { #demo };
      case (#superLudo) { #superLudo };
      case (#bonus) { #bonus };
      case (#timed) { #timed };
      case (#twoVsTwo) { #twoVsTwo };
      case (#practice) { #practice };
      case (#experimental) { #experimental };
      case (#custom) { #custom };
      case (#tournament) { #tournament };
      case (#copyFast) { #copyFast };
      case (#copyClassic) { #copyClassic };
    }
  };

  func migrateGameStatus(s : OldGameStatus) : NewGameStatus {
    switch (s) {
      case (#waiting) { #waiting };
      case (#active) { #active };
      case (#completed) { #completed };
    }
  };

  func migrateRankedStatus(r : OldRankedStatus) : NewRankedStatus {
    switch (r) {
      case (#ranked) { #ranked };
      case (#unranked) { #unranked };
    }
  };

  func migrateDiceRoll(d : OldDiceRoll) : NewDiceRoll {
    {
      rollNumber = d.rollNumber;
      playerPrincipal = d.playerPrincipal;
      diceResult = d.diceResult;
      seed = d.seed;
      seedHash = d.seed;
      entropy = d.seed;
      timestamp = d.timestamp;
    }
  };

  func migrateGame(g : OldGameSession) : NewGameSession {
    let migratedDice = g.diceHistory.map(migrateDiceRoll);
    // Build default player states from the players list
    let playerStates = g.players.map(
      func(p) {
        {
          principal = p;
          tokens = defaultTokens();
          consecutiveWins = 0;
          lastBetAmount = g.betAmount;
        }
      }
    );
    {
      id = g.id;
      mode = migrateGameMode(g.mode);
      rankedStatus = migrateRankedStatus(g.rankedStatus);
      betAmount = g.betAmount;
      players = g.players;
      playerStates;
      status = migrateGameStatus(g.status);
      winner = g.winner;
      currentTurn = 0;
      createdAt = g.createdAt;
      isDemo = g.isDemo;
      diceHistory = migratedDice;
    }
  };

  func migrateRoom(r : OldMatchmakingRoom) : NewMatchmakingRoom {
    let roomType : NewRoomType = switch (r.roomType) {
      case (#privateRoom) { #privateRoom };
      case (#isPublic) { #isPublic };
    };
    let gameMode = migrateGameMode(r.gameMode);
    let status : { #waiting; #active; #completed } = switch (r.status) {
      case (#waiting) { #waiting };
      case (#active) { #active };
      case (#completed) { #completed };
    };
    {
      id = r.id;
      roomType;
      creator = r.creator;
      playerCount = r.playerCount;
      maxPlayers = r.maxPlayers;
      gameMode;
      betAmount = 0.0;
      players = r.players;
      status;
      isDemo = r.isDemo;
      createdAt = 0;
    }
  };

  func migrateUserProfile(p : Principal, u : OldUserProfile) : NewUserProfile {
    let size = p.toText().size();
    let referralCode = "LV-" # size.toText() # "-" # (size * 7 % 9999).toText();
    {
      name = u.name;
      color = u.color;
      avatarUrl = "";
      bio = "";
      isPremium = u.isPremium;
      icpBalance = u.icpBalance;
      demoCredits = 1000.0;
      gamesPlayed = u.gamesPlayed;
      wins = u.wins;
      losses = u.losses;
      draws = u.draws;
      referralCode;
      currentGame = u.currentGame;
      createdAt = u.createdAt;
      lastActive = u.lastActive;
    }
  };

  func migrateWallet(w : OldWallet) : NewWallet {
    { w with demoCredits = 1000.0 }
  };

  func migrateBotConfig(b : OldBotConfig) : NewBotConfig {
    let botDifficulty : NewBotDifficulty = switch (b.difficulty) {
      case (#easy) { #easy };
      case (#medium) { #medium };
      case (#hard) { #hard };
    };
    {
      principal = b.principal;
      name = "LudoBot";
      difficulty = botDifficulty;
      balance = b.balance;
      isPremium = b.isPremium;
    }
  };

  // ── Public migration entry point ───────────────────────────────────────────

  public func run(old : OldActor) : NewActor {
    let userProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(p, u) { migrateUserProfile(p, u) }
    );

    // Merge old players into userProfiles if not already present
    for ((p, player) in old.players.entries()) {
      if (userProfiles.get(p) == null) {
        let size = p.toText().size();
        let referralCode = "LV-" # size.toText() # "-" # (size * 7 % 9999).toText();
        let newProfile : NewUserProfile = {
          name = player.name;
          color = player.color;
          avatarUrl = "";
          bio = "";
          isPremium = player.isPremium;
          icpBalance = player.icpBalance;
          demoCredits = 1000.0;
          gamesPlayed = player.gamesPlayed;
          wins = player.wins;
          losses = player.losses;
          draws = player.draws;
          referralCode;
          currentGame = player.currentGame;
          createdAt = player.createdAt;
          lastActive = player.lastActive;
        };
        userProfiles.add(p, newProfile);
      };
    };

    let wallets = old.wallets.map<Principal, OldWallet, NewWallet>(
      func(_p, w) { migrateWallet(w) }
    );

    let games = old.games.map<Principal, OldGameSession, NewGameSession>(
      func(_id, g) { migrateGame(g) }
    );

    let bots = old.bots.map<Principal, OldBotConfig, NewBotConfig>(
      func(_p, b) { migrateBotConfig(b) }
    );

    let matchmakingRooms = old.matchmakingRooms.map<Principal, OldMatchmakingRoom, NewMatchmakingRoom>(
      func(_id, r) { migrateRoom(r) }
    );

    { userProfiles; wallets; games; bots; matchmakingRooms }
  };

};
