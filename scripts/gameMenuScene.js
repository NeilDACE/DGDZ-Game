/**
 * Main menu scene: Displays logo and provides a button to start the game.
 */
class GameMenuScene extends Phaser.Scene {
  /** @type {Phaser.Sound.BaseSound | null} */
  music = null;

  constructor() {
    super("GameMenuScene");
  }

  /**
   * Loads necessary assets for the menu, including the background music.
   */
  preload() {
    this.load.image("logo", "assets/game-menu/game-menu-logo.png");

    // Load Background Music
    this.load.audio(
      "bg_0_music",
      "assets/audio/game-menu-background-sound.mp3"
    );
  }

  /**
   * Creates the menu layout and starts the music.
   */
  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");
    this._startBackgroundMusic(); // Start music

    const logo = this.add.image(width / 2, height / 2 - 100, "logo");
    logo.setOrigin(0.5).setScale(0.5);

    // Calculate text position relative to the logo
    const textY = logo.y + logo.displayHeight / 2 + 40;

    const startText = this.add
      .text(width / 2, textY, "Spiel starten", {
        // Text auf Deutsch belassen
        fontSize: "40px",
        fontFamily: "Macondo",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    startText
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this._handlePointerOver(startText))
      .on("pointerout", () => this._handlePointerOut(startText))
      .on("pointerdown", () => {
        this._startGame();
      });
  }

  // ----------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ----------------------------------------------------------------------

  /**
   * Starts the scene's background music.
   */
  _startBackgroundMusic() {
    this.music = this.sound.add("bg_0_music", {
      volume: 0.5,
      loop: true,
    });
    // Important: This might require user interaction (click/touch) in some browsers.
    this.music.play();
  }

  /**
   * Handles the pointer over event for the start button.
   * @param {Phaser.GameObjects.Text} textObject - The text object to style.
   */
  _handlePointerOver(textObject) {
    textObject.setStyle({ color: "#1E354C" });
  }

  /**
   * Handles the pointer out event for the start button.
   * @param {Phaser.GameObjects.Text} textObject - The text object to style.
   */
  _handlePointerOut(textObject) {
    textObject.setStyle({ color: "#ffffff" });
  }

  /**
   * Stops the music and starts the main game scene.
   */
  _startGame() {
    if (this.music) {
      this.music.stop();
    }
    this.scene.start("storyTellingScene");
  }
}
