import { GameStatuses } from "../../GAME_STATUSES.js";
import { SamuraiNumberUtility } from "../../samurai-number-utility.js";
import { GameProxy } from "./game.js";

describe("game", () => {
  let numberUtil;
  let game;

  beforeEach(() => {
    jest.useFakeTimers();
    numberUtil = new SamuraiNumberUtility();
    game = new GameProxy();
  });

  it("should create the game and return the initial status", () => {
    expect(game.status).toBe(GameStatuses.PENDING);
  });

  it("should have InProgress status after start", async () => {
    game.start();
    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
  });

  it("should place Google within the Grid after start", async () => {
    game.start();
    expect(game.googlePosition).toBeDefined();
    expect(game.googlePosition.x).toBeGreaterThanOrEqual(0);
    expect(game.googlePosition.x).toBeLessThan(game.gridSize.columnsCount);
    expect(game.googlePosition.y).toBeGreaterThanOrEqual(0);
    expect(game.googlePosition.y).toBeLessThan(game.gridSize.rowsCount);
  });

  it("should move Google to a new position within the Grid after jump", async () => {
    game.googleJumpInterval = 1;
    game.start();

    for (let i = 0; i < 10; i++) {
      const prevGooglePosition = game.googlePosition;
      jest.advanceTimersByTime(1);
      await delay(1);
      const currentGooglePosition = game.googlePosition;
      expect(prevGooglePosition).not.toEqual(currentGooglePosition);
    }
  });

  it("should place both players within the Grid", async () => {
    game.start();
    expect(game.player1Position.x).toBeGreaterThanOrEqual(0);
    expect(game.player1Position.x).toBeLessThan(game.gridSize.columnsCount);
    expect(game.player1Position.y).toBeGreaterThanOrEqual(0);
    expect(game.player1Position.y).toBeLessThan(game.gridSize.rowsCount);

    expect(game.player2Position.x).toBeGreaterThanOrEqual(0);
    expect(game.player2Position.x).toBeLessThan(game.gridSize.columnsCount);
    expect(game.player2Position.y).toBeGreaterThanOrEqual(0);
    expect(game.player2Position.y).toBeLessThan(game.gridSize.rowsCount);
  });

  it("should ensure players and Google do not overlap", async () => {
    game.googleJumpInterval = 1;
    game.start();

    expect(game.player1Position).not.toEqual(game.player2Position);
    expect(game.player1Position).not.toEqual(game.googlePosition);
    expect(game.player2Position).not.toEqual(game.googlePosition);
  });

  it("should stop game", () => {
    game.googleJumpInterval = 1;
    game.start();
    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
    game.stop();
    expect(game.status).toBe(GameStatuses.COMPLETED);
  });

  it("player should be in the Grid after start", async () => {
    for (let i = 0; i < 100; i++) {
      const game = new Game();
      game.start();
      expect(game.player1Position.x).toBeLessThan(game.gridSize.columnsCount);
      expect(game.player1Position.x).toBeGreaterThanOrEqual(0);
      expect(game.player1Position.y).toBeLessThan(game.gridSize.rowsCount);
      expect(game.player1Position.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("player should move in correct directions", async () => {
    const fakeNumberUtility = {
      *numberGenerator() {
        yield 2; // initial x
        yield 2; // initial y
        yield 2; // move x
        yield 1; // move y
        yield 1; // move x
        yield 0; // move y
        yield 0; // move x
        yield 0; // move y
        while (true) {
          yield 0;
        }
      },
      iterator: null,
      getRandomInteger(from, to) {
        if (!this.iterator) {
          this.iterator = this.numberGenerator();
        }
        return this.iterator.next().value;
      },
    };

    const game = new Game(fakeNumberUtility);
    game.gridSize = { columnsCount: 3, rowsCount: 3 };
    game.start();

    expect(game.player1Position).toEqual({ x: 2, y: 2 });

    game.movePlayer(1, "RIGHT");
    expect(game.player1Position).toEqual({ x: 2, y: 2 });
    game.movePlayer(1, "DOWN");
    expect(game.player1Position).toEqual({ x: 2, y: 2 });

    game.movePlayer(1, "UP");
    expect(game.player1Position).toEqual({ x: 2, y: 1 });

    game.movePlayer(1, "UP");
    expect(game.player1Position).toEqual({ x: 2, y: 0 });

    game.movePlayer(1, "LEFT");
    expect(game.player1Position).toEqual({ x: 1, y: 0 });

    game.movePlayer(1, "UP");
    expect(game.player1Position).toEqual({ x: 1, y: 0 });

    game.movePlayer(1, "LEFT");
    expect(game.player1Position).toEqual({ x: 0, y: 0 });

    game.movePlayer(1, "DOWN");
    expect(game.player1Position).toEqual({ x: 0, y: 1 });

    game.movePlayer(1, "RIGHT");
    expect(game.player1Position).toEqual({ x: 1, y: 1 });
  });

  it("players should not be able to occupy the same position", async () => {
    const fakeNumberUtility = {
      *numberGenerator() {
        yield 1; // player1 x
        yield 1; // player1 y
        yield 1; // player2 x
        yield 2; // player2 y
        while (true) yield 0;
      },
      iterator: null,
      getRandomInteger(from, to) {
        if (!this.iterator) {
          this.iterator = this.numberGenerator();
        }
        return this.iterator.next().value;
      },
    };

    const game = new Game(fakeNumberUtility);
    game.gridSize = { columnsCount: 3, rowsCount: 3 };
    game.start();

    expect(game.player1Position).toEqual({ x: 1, y: 1 });
    expect(game.player2Position).toEqual({ x: 1, y: 2 });

    game.movePlayer(2, "UP");
    expect(game.player2Position).toEqual({ x: 1, y: 2 });
  });

  it("should not allow movement after game is completed", async () => {
    game.start();
    const initialPosition = { ...game.player1Position };

    game.stop();
    game.movePlayer(1, "UP");
    expect(game.player1Position).toEqual(initialPosition);
  });

  it("should ignore invalid move directions", async () => {
    game.start();
    const initialPosition = { ...game.player1Position };

    game.movePlayer(1, "INVALID");
    expect(game.player1Position).toEqual(initialPosition);
  });

  it("should allow valid diagonal movements between players", async () => {
    const fakeNumberUtility = {
      *numberGenerator() {
        yield 0; // player1 x
        yield 0; // player1 y
        yield 1; // player2 x
        yield 1; // player2 y
        while (true) yield 2;
      },
      iterator: null,
      getRandomInteger(from, to) {
        if (!this.iterator) {
          this.iterator = this.numberGenerator();
        }
        return this.iterator.next().value;
      },
    };

    const game = new Game(fakeNumberUtility);
    game.gridSize = { columnsCount: 3, rowsCount: 3 };
    game.start();
    expect(game.player1Position).toEqual({ x: 0, y: 0 });
    expect(game.player2Position).toEqual({ x: 1, y: 1 });
    game.movePlayer(1, "RIGHT");
    expect(game.player1Position).toEqual({ x: 1, y: 0 });
  });

  it("should prevent Google from overlapping with players after jump", async () => {
    game.googleJumpInterval = 1;
    game.start();

    for (let i = 0; i < 20; i++) {
      jest.advanceTimersByTime(1);
      await delay(1);
      expect(game.googlePosition).not.toEqual(game.player1Position);
      expect(game.googlePosition).not.toEqual(game.player2Position);
    }
  });

  it("should complete game when player catches Google", async () => {
    const fakeNumberUtility = {
      *numberGenerator() {
        yield 0; // player1 x
        yield 0; // player1 y
        yield 2; // player2 x
        yield 2; // player2 y
        yield 1; // google x
        yield 0; // google y
        while (true) yield 0;
      },
      iterator: null,
      getRandomInteger(from, to) {
        if (!this.iterator) {
          this.iterator = this.numberGenerator();
        }
        return this.iterator.next().value;
      },
    };

    const game = new Game(fakeNumberUtility);
    game.gridSize = { columnsCount: 3, rowsCount: 3 };
    game.start();

    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
    game.movePlayer(1, "RIGHT");
    expect(game.status).toBe(GameStatuses.COMPLETED);
  });

  it("should properly restart the game", async () => {
    game.start();
    const initialGooglePos = { ...game.googlePosition };
    const initialPlayer1Pos = { ...game.player1Position };
    const initialPlayer2Pos = { ...game.player2Position };

    game.stop();
    game.restart();

    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
    expect(game.googlePosition).not.toEqual(initialGooglePos);
    expect(game.player1Position).not.toEqual(initialPlayer1Pos);
    expect(game.player2Position).not.toEqual(initialPlayer2Pos);
  });

  it("should throw error for invalid google jump interval", () => {
    expect(() => {
      game.googleJumpInterval = 0;
    }).toThrow("Jump interval must be a positive integer");
    expect(() => {
      game.googleJumpInterval = -1;
    }).toThrow("Jump interval must be a positive integer");
    expect(() => {
      game.googleJumpInterval = 1.5;
    }).toThrow("Jump interval must be a positive integer");
  });

  it("player2 should block player1 movement", async () => {
    game.start();

    expect(game.player1Position).toEqual({ x: 0, y: 0 });
    expect(game.player2Position).toEqual({ x: 1, y: 1 });

    game.movePlayer(1, "RIGHT");
    game.movePlayer(1, "DOWN");
    expect(game.player1Position).toEqual({ x: 1, y: 0 });
  });

  it("should properly handle restart", () => {
    game.start();
    const initialPositions = {
      p1: { ...game.player1Position },
      p2: { ...game.player2Position },
      google: { ...game.googlePosition },
    };

    game.movePlayer(1, "RIGHT");
    game.restart();

    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
    expect(game.player1Position).not.toEqual(initialPositions.p1);
    expect(game.player2Position).not.toEqual(initialPositions.p2);
    expect(game.googlePosition).not.toEqual(initialPositions.google);
  });
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
