import { SamuraiNumberUtility } from "../samurai-number-utility.js";
import { Controller } from "./controller.js";
import { GameProxy } from "./game-proxy.js";
import { View } from "./view.js";

//composition root
const view = new View();

const game = new GameProxy();
const controller = new Controller(view, game);

const intervalId = setInterval(() => {
  if (game.initialized) {
    controller.init();
    clearInterval(intervalId);
  }
}, 100);
