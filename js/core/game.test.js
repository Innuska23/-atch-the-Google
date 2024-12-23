import { Game } from "./game.js";
import { GameStatuses } from "../../GAME_STATUSES.js";
import { SamuraiNumberUtility } from "../../samurai-number-utility.js";

describe("game", () => {
  let numberUtil;
  let game;

  beforeEach(() => {
    numberUtil = new SamuraiNumberUtility();
    game = new Game(numberUtil);
  });

  it("should create the game and return the initial status", () => {
    expect(game.status).toBe(GameStatuses.PENDING);
  });

  it("should have InProgress status after start", async () => {
    await game.start();
    expect(game.status).toBe(GameStatuses.IN_PROGRESS);
  });

  it("should place Google within the Grid after start", async () => {
    // expect(game.googlePosition).toBeNull();
    await game.start();
    expect(game.googlePosition).toBeDefined();
    expect(game.googlePosition.x).toBeGreaterThanOrEqual(0);
    expect(game.googlePosition.x).toBeLessThan(game.gridSize.columnsCount);
    expect(game.googlePosition.y).toBeGreaterThanOrEqual(0);
    expect(game.googlePosition.y).toBeLessThan(game.gridSize.rowsCount);
  });

  it("should move Google to a new position within the Grid after jump", async () => {
    game.googleJumpInterval = 1;
    await game.start();

    for (let i = 0; i < 10; i++) {
      const prevGooglePosition = game.googlePosition;
      jest.advanceTimersByTime(1);
      await delay(1);
      const currentGooglePosition = game.googlePosition;
      expect(prevGooglePosition).not.toEqual(currentGooglePosition);
    }
  });

  it("should place both players within the Grid", async () => {
    await game.start();
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
    await game.start();

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
      const game = new Game(numberUtil);
      await game.start();
      expect(game.player1Position.x).toBeLessThan(game.gridSize.columnsCount);
      expect(game.player1Position.x).toBeGreaterThanOrEqual(0);
      expect(game.player1Position.y).toBeLessThan(game.gridSize.rowsCount);
      expect(game.player1Position.y).toBeGreaterThanOrEqual(0);
    }
  });

  it("player should be move in correct directions", async () => {
    //const numberUtil = new ShogunNumberUtility()

    const fakeNumberUtility = {
      *numberGenerator() {
        yield 2;
        yield 2;
        yield 1;
        yield 1;
        yield 0;
        yield 0;
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

    // [  ][  ][  ]
    // [  ][  ][  ]
    // [  ][  ][p1]
    expect(game.player1Position).toEqual({ x: 2, y: 2 });

    game.movePlayer(1, "RIGHT");
    expect(game.player1Position).toEqual({ x: 2, y: 2 });
    game.movePlayer(1, "DOWN");
    expect(game.player1Position).toEqual({ x: 2, y: 2 });

    game.movePlayer(1, "UP");
    // [  ][  ][  ]
    // [  ][  ][p1]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 2, y: 1 });

    game.movePlayer(1, "UP");
    // [  ][  ][p1]
    // [  ][  ][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 2, y: 0 });

    game.movePlayer(1, "LEFT");
    // [  ][p1][  ]
    // [  ][  ][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 1, y: 0 });

    game.movePlayer(1, "UP");
    // [  ][p1][  ]
    // [  ][  ][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 1, y: 0 });

    game.movePlayer(1, "LEFT");
    // [p1][  ][  ]
    // [  ][  ][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 0, y: 0 });

    game.movePlayer(1, "DOWN");
    // [  ][  ][  ]
    // [p1][  ][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 0, y: 1 });

    game.movePlayer(1, "RIGHT");
    // [  ][  ][  ]
    // [  ][p1][  ]
    // [  ][  ][  ]
    expect(game.player1Position).toEqual({ x: 1, y: 1 });
  });
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
