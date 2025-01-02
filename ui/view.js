export class View {
  render(dto) {
    const rootElement = document.getElementById("root");
    rootElement.append("status: " + dto.status);

    const button = document.createElement("button");
    button.append("START GAME");
    button.addEventListener("click", () => {
    
    });
  }
}
