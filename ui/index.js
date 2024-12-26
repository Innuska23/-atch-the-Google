import { Game } from "../js/core/game.js";
import { Controller } from "./controller.js";
import { View } from "./view.js";

//composition root
const view = new View();

const numberUtil = new SamuraiNumberUtility();
const game = new Game(numberUtil);
const controller = new Controller(view, game);
controller.init();
