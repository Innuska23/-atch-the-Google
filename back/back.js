import { Game } from "../js/core/game.js";
import { SamuraiNumberUtility } from "../samurai-number-utility.js";

const numberUtil = new SamuraiNumberUtility();
const game = new Game(numberUtil);

function createDTO() {
  const dto = {
    status: game.status,
    gridSize: game.gridSize,
    googlePosition: {
      x: game.googlePosition.x,
      y: game.googlePosition.y,
    },
    player1Position: {
      x: game.player1Position.x,
      y: game.player1Position.y,
    },
    player2Position: {
      x: game.player2Position.x,
      y: game.player2Position.y,
    },
    winner: game.winner,
  };
  return dto;
}

import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (channel) => {
  game.subscribe(() => {
    channel.send(JSON.stringify(createDTO()));
  });

  console.log("Client connected");

  const helloMessage = {
    message: "Hello, Client!",
    timestamp: new Date().toISOString(),
  };

  channel.send(JSON.stringify(helloMessage));
  channel.send(JSON.stringify(createDTO()));

  channel.on("message", (message) => {
    console.log("Initial state:", createDTO());
    const action = JSON.parse(message.toString());

    switch (action.type) {
      case "start":
        game.start();
        channel.send(JSON.stringify(createDTO()));
        break;
      case "move-player":
        game.movePlayer(
          action.payload.playerNumber,
          action.payload.moveDirection
        );
        channel.send(JSON.stringify(createDTO()));
      case "stop":
        game.stop();
        channel.send(JSON.stringify(createDTO()));
        break;
      case "restart":
        game.restart();
        channel.send(JSON.stringify(createDTO()));
        break;
      case "set-grid-size":
        game.gridSize = action.payload;
        game.restart();
        channel.send(JSON.stringify(createDTO()));
        break;
      default:
        break;
    }
    console.log("Received from client:", message.toString());
  });

  channel.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on channel://localhost:8080");
