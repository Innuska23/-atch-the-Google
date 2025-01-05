import { GameStatuses } from "../constanst/GAME_STATUSES.js";
import { MoveDirection } from "../constanst/MOVE_DIRECTIONS.js";
import { SamuraiNumberUtility } from "../../samurai-number-utility.js";

class Position {
  #x;
  #y;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
  }

  get x() {
    return this.#x;
  }
  get y() {
    return this.#y;
  }

  static equals(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}

class GridSettings {
  #columnsCount;
  #rowsCount;
  #samuraiNumberUtility;

  constructor(columnsCount = 4, rowsCount = 4, samuraiNumberUtility) {
    this.validate(columnsCount, rowsCount);
    this.#columnsCount = columnsCount;
    this.#rowsCount = rowsCount;
    this.#samuraiNumberUtility = samuraiNumberUtility;
  }

  validate(columns, rows) {
    if (!Number.isInteger(columns) || columns <= 0)
      throw new Error("Columns must be positive integer");
    if (!Number.isInteger(rows) || rows <= 0)
      throw new Error("Rows must be positive integer");
  }

  getRandomPosition() {
    return new Position(
      this.#samuraiNumberUtility.getRandomInteger(0, this.#columnsCount),
      this.#samuraiNumberUtility.getRandomInteger(0, this.#rowsCount)
    );
  }

  get columnsCount() {
    return this.#columnsCount;
  }
  get rowsCount() {
    return this.#rowsCount;
  }
}

class GoogleSettings {
  #jumpInterval;

  constructor(jumpInterval = 1000) {
    this.validate(jumpInterval);
    this.#jumpInterval = jumpInterval;
  }

  validate(interval) {
    if (!Number.isInteger(interval) || interval <= 0) {
      throw new Error("Jump interval must be positive integer");
    }
  }

  get jumpInterval() {
    return this.#jumpInterval;
  }
}

class Player {
  #id;
  #position;

  constructor(id, position) {
    this.#id = id;
    this.#position = position;
  }

  get id() {
    return this.#id;
  }
  get position() {
    return this.#position;
  }
  set position(value) {
    this.#position = value;
  }
}

class Google {
  #position;

  constructor(position) {
    this.#position = position;
  }

  get position() {
    return this.#position;
  }
  set position(value) {
    this.#position = value;
  }
}

class GridManager {
  #settings;
  #samuraiNumberUtility;

  constructor(settings, samuraiNumberUtility) {
    this.#settings = settings;
    this.#samuraiNumberUtility = samuraiNumberUtility;
  }

  isInRange(position) {
    return (
      position.x >= 0 &&
      position.x < this.#settings.columnsCount &&
      position.y >= 0 &&
      position.y < this.#settings.rowsCount
    );
  }

  isCellFree(position, units) {
    return !units.some((unit) => Position.equals(unit.position, position));
  }

  getRandomFreePosition(occupiedPositions) {
    let position;
    do {
      position = this.#settings.getRandomPosition();
    } while (
      !this.isCellFree(
        position,
        occupiedPositions.map((p) => ({ position: p }))
      )
    );
    return position;
  }
}

export class Game {
  #gridManager;
  #settings;
  #status = GameStatuses.PENDING;
  #google;
  #player1;
  #player2;
  #googleJumpInterval = null;
  #winner = null;
  #samuraiNumberUtility;
  #observers = [];

  constructor() {
    this.#samuraiNumberUtility = new SamuraiNumberUtility();
    this.#settings = {
      grid: new GridSettings(4, 4, this.#samuraiNumberUtility),
      google: new GoogleSettings(),
    };
    this.#gridManager = new GridManager(
      this.#settings.grid,
      this.#samuraiNumberUtility
    );
    this.#createUnits();
  }

  subscribe(observer) {
    this.#observers.push(observer);
  }

  #notify() {
    this.#observers.forEach((o) => o());
  }

  #createUnits() {
    const player1Position = this.#gridManager.getRandomFreePosition([]);
    const player2Position = this.#gridManager.getRandomFreePosition([
      player1Position,
    ]);
    const googlePosition = this.#gridManager.getRandomFreePosition([
      player1Position,
      player2Position,
    ]);

    this.#player1 = new Player(1, player1Position);
    this.#player2 = new Player(2, player2Position);
    this.#google = new Google(googlePosition);
  }

  movePlayer(playerNumber, moveDirection) {
    if (this.#status !== GameStatuses.IN_PROGRESS) return;

    const player = playerNumber === 1 ? this.#player1 : this.#player2;
    const otherPlayer = playerNumber === 1 ? this.#player2 : this.#player1;
    let newPosition;

    switch (moveDirection) {
      case MoveDirection.UP:
        newPosition = new Position(player.position.x, player.position.y - 1);
        break;
      case MoveDirection.DOWN:
        newPosition = new Position(player.position.x, player.position.y + 1);
        break;
      case MoveDirection.LEFT:
        newPosition = new Position(player.position.x - 1, player.position.y);
        break;
      case MoveDirection.RIGHT:
        newPosition = new Position(player.position.x + 1, player.position.y);
        break;
      default:
        return;
    }

    if (
      !this.#gridManager.isInRange(newPosition) ||
      Position.equals(newPosition, otherPlayer.position)
    ) {
      return;
    }

    if (Position.equals(newPosition, this.#google.position)) {
      this.#winner = player.id;
      this.stop();
      return;
    }

    player.position = newPosition;
    this.#notify();
  }

  start() {
    this.#status = GameStatuses.IN_PROGRESS;
    this.#winner = null;
    this.#makeGoogleJump();
    this.#googleJumpInterval = setInterval(
      () => this.#makeGoogleJump(),
      this.#settings.google.jumpInterval
    );
    this.#notify();
  }

  #makeGoogleJump() {
    const newPosition = this.#gridManager.getRandomFreePosition([
      this.#player1.position,
      this.#player2.position,
    ]);
    this.#google.position = newPosition;
    this.#notify();
  }

  stop() {
    clearInterval(this.#googleJumpInterval);
    this.#status = GameStatuses.COMPLETED;
    this.#notify();
  }

  restart() {
    this.stop();
    this.#createUnits();
    this.start();
  }

  get status() {
    return this.#status;
  }
  get winner() {
    return this.#winner;
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
    return {
      rowsCount: this.#settings.grid.rowsCount,
      columnsCount: this.#settings.grid.columnsCount,
    };
  }

  set gridSize(value) {
    this.#settings.grid = new GridSettings(
      value.columnsCount,
      value.rowsCount,
      this.#samuraiNumberUtility
    );
    this.#gridManager = new GridManager(
      this.#settings.grid,
      this.#samuraiNumberUtility
    );
    this.#notify();
  }

  set googleJumpInterval(value) {
    this.#settings.google = new GoogleSettings(value);
  }
}
