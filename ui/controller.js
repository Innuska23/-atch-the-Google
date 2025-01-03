export class Controller {
  #view;
  #model;
  constructor(view, game) {
    this.#view = view;
    this.#model = game;

    this.#model.subscribe(() => {
      this.#render();
    });

    this.#model.subscribe(() => {
      console.log("STATE OF GAME CHANGE");
    });

    this.#view.onplayermove = (playerNumber, direction) => {
      this.#model.movePlayer(playerNumber, direction);
    };

    this.#view.onstart = () => {
      this.#model.start();
    };
  }
  init() {
    this.#render();
  }
  #render() {
    const dto = {
      status: this.#model.status,
      gridSize: this.#model.gridSize,
      googlePosition: this.#model.googlePosition,
      player1Position: this.#model.player1Position,
      player2Position: this.#model.player2Position,
    };
    this.#view.render(dto);
  }
}
