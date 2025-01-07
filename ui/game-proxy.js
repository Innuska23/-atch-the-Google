export class GameProxy {
  #observers = [];
  #socket = null;
  #stateCache = null;

  constructor() {
    this.#socket = new WebSocket("ws://localhost:8080");

    this.#socket.onopen = () => {
      console.log("Connected to server");
    };

    this.#socket.onmessage = (event) => {
      console.log("Received state:", event.data);
      const receivedObject = JSON.parse(event.data);
      this.#stateCache = receivedObject;
      this.#notify();
    };
    this.#observers = [];
  }

  subscribe(observer) {
    return this.#observers.push(observer);
  }

  #notify() {
    return this.#observers.forEach((o) => o());
  }

  movePlayer(playerNumber, moveDirection) {
    const action = {
      type: "move-player",
      payload: {
        playerNumber,
        moveDirection,
      },
    };
    this.#socket.send(JSON.stringify(action));
  }

  start() {
    const action = { type: "start" };
    this.#socket.send(JSON.stringify(action));
  }

  stop() {
    const action = { type: "stop" };
    this.#socket.send(JSON.stringify(action));
  }

  restart() {
    const action = { type: "restart" };
    this.#socket.send(JSON.stringify(action));
  }

  get status() {
    return this.#stateCache.status;
  }

  get winner() {
    return this.#stateCache.winner;
  }

  get googlePosition() {
    return this.#stateCache.googlePosition;
  }

  get player1Position() {
    return this.#stateCache.player1Position;
  }

  get player2Position() {
    return this.#stateCache.player2Position;
  }

  get gridSize() {
    return this.#stateCache.gridSize;
  }

  get initialized() {
    return this.#stateCache !== null;
  }

  set gridSize(value) {
    const action = {
      type: "set-grid-size",
      payload: value,
    };
    this.#socket.send(JSON.stringify(action));
  }

  set gridSize(value) {
    const action = {
      type: "set-grid-size",
      payload: {
        columnsCount: value.columnsCount,
        rowsCount: value.rowsCount,
      },
    };
    this.#socket.send(JSON.stringify(action));
  }

  set googleJumpInterval(value) {}
}
