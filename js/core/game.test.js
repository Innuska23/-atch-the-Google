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
    await await game.start();

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
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
