import { GameStatuses } from "../GAME_STATUSES.js";
import { MoveDirection } from "../MOVE_DIRECTIONS.js";

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

  render(dto) {
    const rootElement = document.getElementById("root");
    rootElement.innerHTML = "";

    rootElement.append("status: " + dto.status);

    if (dto.status === GameStatuses.PENDING) {
      this.#gridComponent.destroy();
      const settingsElement = this.#settingsComponent.render(dto);
      rootElement.append(settingsElement);
    } else if (dto.status === GameStatuses.IN_PROGRESS) {
      const gridElement = this.#gridComponent.render(dto);
      rootElement.append(gridElement);
    } else if (dto.status === GameStatuses.COMPLETED) {
      this.#gridComponent.destroy();
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

  #handleKeyUp = null;

  constructor(props) {
    this.#props = props;
    this.#handleKeyUp = (e) => {
      const move = this.#keyMap[e.code];
      if (move) {
        console.log("Key pressed:", e.code, "Move:", move);
        this.#props.onplayermove?.(move[0], move[1]);
      }
    };

    document.addEventListener("keyup", this.#handleKeyUp);
  }

  destroy() {
    document.removeEventListener("keyup", this.#handleKeyUp);
  }

  render(dto) {
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
        } else if (this.#positionsEqual(currentPosition, dto.player1Position)) {
          td.textContent = "1";
        } else if (this.#positionsEqual(currentPosition, dto.player2Position)) {
          td.textContent = "2";
        } else {
          td.textContent = "";
        }

        tr.append(td);
      }
      table.append(tr);
    }

    return table;
  }

  #positionsEqual(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
  }
}
