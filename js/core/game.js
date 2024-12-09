import { GameStatuses } from "../../GAME_STATUSES.js";
import { SamuraiNumberUtility } from "../../samurai-number-utility.js";

export class Game {
  #settings = {
    gridSize: {
      columnsCount: 4,
      rowsCount: 4,
    },
    googleJumpInterval: 1000,
    playersJumpInterval: 1,
  };
  #status = GameStatuses.PENDING;

  #googlePosition = null;
  #players1 = null;
  #players2 = null;

  #isCellFree(x, y) {
    return (
      (x !== this.#googlePosition?.x || y !== this.#googlePosition?.y) &&
      (x !== this.#players1.x || y !== this.#players1.y) &&
      (x !== this.#players2.x || y !== this.#players2.y)
    );
  }
  /**
   * @type SamuraiNumberUtility // JSDoc
   */
  #numberUtility;

  constructor() {
    this.#numberUtility = new SamuraiNumberUtility();
    let player1Position, player2Position;
    do {
      player1Position = this.#getRandomPosition();
      player2Position = this.#getRandomPosition();
    } while (
      (player1Position.x === this.#googlePosition?.x &&
        player1Position.y === this.#googlePosition?.y) ||
      (player2Position.x === this.#googlePosition?.x &&
        player2Position.y === this.#googlePosition?.y) ||
      (player1Position.x === player2Position.x &&
        player1Position.y === player2Position.y)
    );
    this.#players1 = player1Position;
    this.#players2 = player2Position;
  }

  set googleJumpInterval(value) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Google jump interval must be a positive integer");
    }
    this.#settings.googleJumpInterval = value;
  }

  get status() {
    return this.#status;
  }

  get googlePosition() {
    return this.#googlePosition;
  }

  get player1Position() {
    return this.#players1;
  }
  get player2Position() {
    return this.#players2;
  }

  get gridSize() {
    return this.#settings.gridSize;
  }

  start() {
    this.#status = GameStatuses.IN_PROGRESS;
    this.#makeGoogleJump();
    setInterval(() => {
      this.#makeGoogleJump();
    }, this.#settings.googleJumpInterval);
  }
  #makeGoogleJump() {
    const newPosition = {
      x: this.#numberUtility.getRandomInteger(
        0,
        this.#settings.gridSize.columnsCount
      ),
      y: this.#numberUtility.getRandomInteger(
        0,
        this.#settings.gridSize.rowsCount
      ),
    };
    while (!this.#isCellFree(newPosition.x, newPosition.y));
    
    this.#googlePosition = newPosition;
  }
  #getRandomPosition() {
    return {
      x: this.#numberUtility.getRandomInteger(
        0,
        this.#settings.gridSize.columnsCount
      ),
      y: this.#numberUtility.getRandomInteger(
        0,
        this.#settings.gridSize.rowsCount
      ),
    };
  }
}
