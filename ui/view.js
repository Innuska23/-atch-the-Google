import { GameStatuses } from "../js/constanst/GAME_STATUSES.js";
import { MoveDirection } from "../js/constanst/MOVE_DIRECTIONS.js";

export class View {
  onstart = null;
  onplayermove = null;
  #settingsComponent = new SettingComponent({
    onstart: () => this.onstart?.(),
  });
  #gridComponent = new GridComponent({
    onplayermove: (playerNumber, direction) =>
      this.onplayermove?.(playerNumber, direction),
  });

  constructor() {
    const header = document.createElement("div");
    header.classList.add("header");

    const headerLeft = document.createElement("div");
    headerLeft.classList.add("header-left");

    const gridWrapper = document.createElement("div");
    gridWrapper.classList.add("header-select-wrapper");
    const gridSelect = document.createElement("select");
    gridSelect.classList.add("header-select");
    ["4x4", "5x5", "6x6", "7x7", "8x8"].forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      gridSelect.appendChild(option);
    });
    gridWrapper.appendChild(gridSelect);

    const pointsWrapper = document.createElement("div");
    pointsWrapper.classList.add("header-select-wrapper");
    const pointsSelect = document.createElement("select");
    pointsSelect.classList.add("header-select");
    ["20 pts", "30 pts", "40 pts", "50 pts", "60 pts"].forEach((points) => {
      const option = document.createElement("option");
      option.value = points;
      option.textContent = points;
      pointsSelect.appendChild(option);
    });
    pointsWrapper.appendChild(pointsSelect);

    const losePointsWrapper = document.createElement("div");
    losePointsWrapper.classList.add("header-select-wrapper");
    const losePointsSelect = document.createElement("select");
    losePointsSelect.classList.add("header-select");
    ["5 pts", "10 pts", "15 pts", "20 pts", "25 pts"].forEach((points) => {
      const option = document.createElement("option");
      option.value = points;
      option.textContent = points;
      losePointsSelect.appendChild(option);
    });
    losePointsWrapper.appendChild(losePointsSelect);

    headerLeft.append(gridWrapper, pointsWrapper, losePointsWrapper);

    const headerCenter = document.createElement("div");
    headerCenter.classList.add("header-center");
    headerCenter.innerHTML = `
        <div class="header-item">Catch the Google</div>
    `;

    const headerRight = document.createElement("div");
    headerRight.classList.add("header-right");
    headerRight.innerHTML = `
        <div class="header-item">
            <span class="status-dot"></span>
            <span>Connected</span>
        </div>
    `;

    header.append(headerLeft, headerCenter, headerRight);
    document.body.prepend(header);

    const mainContent = document.createElement("div");
    mainContent.classList.add("main-content");
    mainContent.id = "root";
    document.body.append(mainContent);
  }

  render(dto) {
    const rootElement = document.getElementById("root");
    rootElement.innerHTML = "";

    if (dto.status === GameStatuses.PENDING) {
      this.#gridComponent.destroy();
      const settingsElement = this.#settingsComponent.render(dto);
      rootElement.append(settingsElement);
    } else if (dto.status === GameStatuses.IN_PROGRESS) {
      const gridElement = this.#gridComponent.render(dto);
      rootElement.append(gridElement);
    } else if (dto.status === GameStatuses.COMPLETED) {
      this.#gridComponent.destroy();

      const container = document.createElement("div");
      container.classList.add("container");

      const status = document.createElement("div");
      status.textContent = `Winner: Player ${dto.winner}`;

      const restartButton = document.createElement("button");
      restartButton.textContent = "Restart Game";
      restartButton.onclick = () => this.onstart?.();

      container.append(status, restartButton);
      rootElement.append(container);
    }
  }
}

class SettingComponent {
  #props;
  constructor(props) {
    this.#props = props;
  }
  render(dto) {
    const container = document.createElement("div");
    container.classList.add("container");

    const instructions = document.createElement("div");
    instructions.innerHTML = `
      <h3>Instructions:</h3>
      <p>Player 1: Use Arrow Keys (↑←↓→)</p>
      <p>Player 2: Use WASD Keys</p>
      <p>Try to catch Google (G) before the other player!</p>
    `;
    container.append(instructions);

    const button = document.createElement("button");
    button.classList.add("btn");
    button.append("Start Game");
    button.onclick = () => {
      this.#props?.onstart?.();
    };

    container.append(button);
    return container;
  }
}

class GridComponent {
  #props;
  #pressedKeys = new Set();
  #moveInterval = null;
  #handleKeyDown;
  #handleKeyUp;

  #keyMap = {
    ArrowUp: [1, MoveDirection.UP],
    ArrowDown: [1, MoveDirection.DOWN],
    ArrowLeft: [1, MoveDirection.LEFT],
    ArrowRight: [1, MoveDirection.RIGHT],
    KeyW: [2, MoveDirection.UP],
    KeyS: [2, MoveDirection.DOWN],
    KeyA: [2, MoveDirection.LEFT],
    KeyD: [2, MoveDirection.RIGHT],
  };

  constructor(props) {
    this.#props = props;

    this.#handleKeyDown = (e) => {
      if (this.#keyMap[e.code]) {
        e.preventDefault();
        this.#pressedKeys.add(e.code);
        const [playerNumber, direction] = this.#keyMap[e.code];
        this.#props.onplayermove?.(playerNumber, direction);
      }
    };

    this.#handleKeyUp = (e) => {
      if (this.#keyMap[e.code]) {
        e.preventDefault();
        this.#pressedKeys.delete(e.code);
      }
    };

    document.addEventListener("keydown", this.#handleKeyDown);
    document.addEventListener("keyup", this.#handleKeyUp);

    this.#moveInterval = setInterval(() => {
      this.#processKeys();
    }, 150);
  }

  #processKeys() {
    this.#pressedKeys.forEach((keyCode) => {
      const [playerNumber, direction] = this.#keyMap[keyCode];
      this.#props.onplayermove?.(playerNumber, direction);
    });
  }

  destroy() {
    //document.removeEventListener("keydown", this.#handleKeyDown);
    //document.removeEventListener("keyup", this.#handleKeyUp);
    if (this.#moveInterval) {
      clearInterval(this.#moveInterval);
    }
    this.#pressedKeys.clear();
  }

  render(dto) {
    const container = document.createElement("div");
    container.classList.add("container");

    const controls = document.createElement("div");
    controls.innerHTML = `
      <p>Player 1: Arrow Keys | Player 2: WASD</p>
    `;
    container.append(controls);

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";

    for (let row = 0; row < dto.gridSize.rowsCount; row++) {
      const tr = document.createElement("tr");

      for (let col = 0; col < dto.gridSize.columnsCount; col++) {
        const td = document.createElement("td");
        td.style.border = "1px solid black";
        td.style.width = "50px";
        td.style.height = "50px";
        td.style.textAlign = "center";

        const currentPosition = { x: col, y: row };

        if (this.#positionsEqual(currentPosition, dto.googlePosition)) {
          td.textContent = "G";
          td.style.backgroundColor = "#ffeb3b";
        } else if (this.#positionsEqual(currentPosition, dto.player1Position)) {
          td.textContent = "1";
          td.style.backgroundColor = "#2196f3";
        } else if (this.#positionsEqual(currentPosition, dto.player2Position)) {
          td.textContent = "2";
          td.style.backgroundColor = "#4caf50";
        }

        tr.append(td);
      }
      table.append(tr);
    }

    container.append(table);
    return container;
  }

  #positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}
