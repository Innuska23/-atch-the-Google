export class Controller {
  #view;
  #model;
  constructor(view, game) {
    this.#view = view;
    this.#model = game;
  }
  init() {
    this.#view.render();
    this.#model.render();
  }
}
