export class Controller {
  #view;
  #model;
  constructor(view, game) {
    this.#view = view;
    this.#model = game;
  }
  init() {
    const dto = {
      status: this.#model.status,
    };
    this.#view.render(dto);
  }
}
