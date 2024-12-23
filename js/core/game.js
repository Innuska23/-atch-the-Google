import { GameStatuses } from "../../GAME_STATUSES.js";
import { SamuraiNumberUtility } from "../../samurai-number-utility.js";

class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(other) {
    return this.x === other.x && this.y === other.y;
  }

  static equals(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}

class Player {
  constructor(id, position) {
    this.id = id;
    this.position = position;
  }
}

class Google {
  constructor(position) {
    this.position = position;
  }
}

class GridSettings {
  constructor(columnsCount, rowsCount) {
    this.columnsCount = columnsCount;
    this.rowsCount = rowsCount;
  }
}

class GoogleSettings {
  constructor(jumpInterval) {
    this.jumpInterval = jumpInterval;
  }
}

class Settings {
  constructor(gridSettings, googleSettings) {
    this.gridSettings = gridSettings;
    this.googleSettings = googleSettings;
  }
}

export class Game {
  #settings;
  #status = GameStatuses.PENDING;
  #google;
  #player1;
  #player2;
  #googleJumpInterval = null;
  #numberUtility;

  constructor(numberUtility) {
    this.#numberUtility = numberUtility || new SamuraiNumberUtility();

    const gridSettings = new GridSettings(4, 4);
    const googleSettings = new GoogleSettings(1000);
    this.#settings = new Settings(gridSettings, googleSettings);

    this.#createUnits();
  }

  #createUnits() {
    const player1Position = this.#getRandomPosition([]);
    this.#player1 = new Player(1, player1Position);

    const player2Position = this.#getRandomPosition([player1Position]);
    this.#player2 = new Player(2, player2Position);

    const googlePosition = this.#getRandomPosition([
      player1Position,
      player2Position,
    ]);
    this.#google = new Google(googlePosition);
  }

  #getRandomPosition(occupiedPositions) {
    let position;
    do {
      position = new Position(
        this.#numberUtility.getRandomInteger(
          0,
          this.#settings.gridSettings.columnsCount - 1
        ),
        this.#numberUtility.getRandomInteger(
          0,
          this.#settings.gridSettings.rowsCount - 1
        )
      );
    } while (
      occupiedPositions.some((occupied) => Position.equals(occupied, position))
    );
    return position;
  }

  #isCellFree(x, y) {
    return !(
      Position.equals(this.#google.position, new Position(x, y)) ||
      Position.equals(this.#player1.position, new Position(x, y)) ||
      Position.equals(this.#player2.position, new Position(x, y))
    );
  }

  set googleJumpInterval(value) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Google jump interval must be a positive integer");
    }
    this.#settings.googleSettings.jumpInterval = value;
  }

  get status() {
    return this.#status;
  }

  get googlePosition() {
    return this.#google.position;
  }

  get player1Position() {
    return this.#player1.position;
  }

  get player2Position() {
    return this.#player2.position;
  }

  get gridSize() {
    return this.#settings.gridSettings;
  }

  set gridSize(value) {
    this.#settings.gridSettings = value;
  }

  start() {
    this.#status = GameStatuses.IN_PROGRESS;
    this.#makeGoogleJump();

    this.#googleJumpInterval = setInterval(() => {
      this.#makeGoogleJump();
    }, this.#settings.googleSettings.jumpInterval);
  }

  #makeGoogleJump() {
    let newPosition;
    do {
      newPosition = new Position(
        this.#numberUtility.getRandomInteger(
          0,
          this.#settings.gridSettings.columnsCount - 1
        ),
        this.#numberUtility.getRandomInteger(
          0,
          this.#settings.gridSettings.rowsCount - 1
        )
      );
    } while (!this.#isCellFree(newPosition.x, newPosition.y));

    this.#google.position = newPosition;
  }

  stop() {
    clearInterval(this.#googleJumpInterval);
    this.#status = GameStatuses.COMPLETED;
  }
}
