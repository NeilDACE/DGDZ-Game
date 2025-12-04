/**
 * Main menu scene: Displays logo and provides a button to start the game.
 */
class GameMenuScene extends Phaser.Scene {
  constructor() {
    super("gameMenuScene");
  }

  /**
   * Loads necessary assets for the menu.
   */
  preload() {
    this.load.image("logo", "assets/game-menu/game-menu-logo.png");
  }

  /**
   * Creates the menu layout.
   */
  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    const logo = this.add.image(width / 2, height / 2 - 100, "logo");
    logo.setOrigin(0.5).setScale(0.5);

    // Calculate text position relative to the logo
    const textY = logo.y + logo.displayHeight / 2 + 40;

    const startText = this.add
      .text(width / 2, textY, "Start Game", {
        fontSize: "40px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    startText
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => startText.setStyle({ color: "#1E354C" }))
      .on("pointerout", () => startText.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => {
        this.scene.start("storyTellingScene");
      });
  }
}
