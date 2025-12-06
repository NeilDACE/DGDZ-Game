/**
 * Main scene for Level 1: Ordering the planets.
 * The planets must be dragged into the correct sequence and position.
 */
class LevelOneScene extends Phaser.Scene {
  /**
   * @type {Phaser.GameObjects.Text}
   */
  feedbackText;

  /**
   * @type {Phaser.Sound.BaseSound | null}
   */
  music = null;

  // --- CONFIGURATION CONSTANTS ---

  /** @type {number} */
  PLANET_SCALE = 0.08;
  /** @type {number} */
  TARGET_Y = 300; // Fixed Y-coordinate for the target line.
  /** @type {number} */
  TARGET_X_START = 300; // Starting X-coordinate for the targets. (wird gleich noch für targetX benutzt)
  /** @type {number} */
  TARGET_X_SPACING = 85; // Horizontal spacing between targets.
  /** @type {number} */
  POS_TOLERANCE = 35; // Tolerance radius for dropping an item.

  /**
   * List of planets in the correct target order (left to right) using asset keys.
   */
  planetKeys = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  // --- GAME STATE VARIABLES ---

  /** @type {number} */
  totalChaos = 8; // Total number of planets.
  /** @type {number} */
  orderAchieved = 0; // Counter for correctly placed planets.

  constructor() {
    super({ key: "levelOneScene" });
  }

  /**
   * Loads all necessary assets (images, audio, etc.).
   */
  preload() {
    this.load.image("desk_bg", "assets/level-one/background.png");

    // Load planet assets (using standard English keys for variables, but original file names for path)
    this.load.image("mercury", "assets/level-one/planets/merkur.png");
    this.load.image("venus", "assets/level-one/planets/venus.png");
    this.load.image("earth", "assets/level-one/planets/earth.png");
    this.load.image("mars", "assets/level-one/planets/mars.png");
    this.load.image("jupiter", "assets/level-one/planets/jupiter.png");
    this.load.image("saturn", "assets/level-one/planets/saturn.png");
    this.load.image("uranus", "assets/level-one/planets/uranus.png");
    this.load.image("neptune", "assets/level-one/planets/neptun.png");

    // Load Background Music
    this.load.audio(
      "bg_2_music",
      "assets/audio/level-one-background-sound.mp3"
    );
    this.load.audio("success_sound_one", "/assets/audio/dialog1ver2.mp3");
  }

  /**
   * Creates the game objects and sets up the level.
   */
  create() {
    this._setupHTMLClasses();
    const { width } = this.sys.game.config;

    this.setFullScreenBackground("desk_bg");
    this._startBackgroundMusic();

    this.add
      .text(width / 2, 20, "Level 1: Ordne die Planeten", {
        fontSize: "28px",
        fill: "#FFD700",
      })
      .setOrigin(0.5);

    this._addTargetsAndPlanets();
    this._addFeedbackText();

    this._showMessage(
      "Bringe die Planeten in ihre korrekte\nReihenfolge und ziehe sie auf die Ziellinie!",
      4000
    );

    // Optional: Drag-Schwelle einmal global setzen
    this.input.dragDistanceThreshold = 10;
  }

  // ----------------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ----------------------------------------------------------------------------------

  /**
   * Toggles the necessary HTML classes for the scene.
   */
  _setupHTMLClasses() {
    document.getElementById("bodyId").classList.toggle("level1-background");
    document
      .getElementById("game-container")
      .classList.toggle("level1-game-container");
  }

  /**
   * Starts the scene's background music.
   * Plays the success sound 2 seconds after the background music starts.
   */
  _startBackgroundMusic() {
    this.music = this.sound.add("bg_2_music", {
      volume: 0.4,
      loop: true,
    });
    this.music.play();

    // Success-Sound 2 Sekunden nach Start der Hintergrundmusik abspielen
    this.time.delayedCall(2000, () => {
      this.startSuccessSound();
    });
  }

  /**
   * Plays the success sound once.
   */
  startSuccessSound() {
    const successSound = this.sound.add("success_sound_one", {
      volume: 0.7,
      loop: false,
    });
    successSound.play();
  }

  /**
   * Creates the target markers and the chaotic, draggable planet objects.
   */
  _addTargetsAndPlanets() {
    const { width } = this.sys.game.config;
    const chaoticAreaY = 150;
    const chaoticAreaHeight = 250;

    for (let i = 0; i < this.planetKeys.length; i++) {
      const planetKey = this.planetKeys[i];

      // Calculate target position
      const targetX = this.TARGET_X_START + i * this.TARGET_X_SPACING;
      const targetY = this.TARGET_Y;

      this._addTarget(targetX, targetY, this.PLANET_SCALE);

      // Calculate random starting position in the chaotic area
      const startX = Phaser.Math.Between(50, width - 50);
      const startY = Phaser.Math.Between(
        chaoticAreaY,
        chaoticAreaY + chaoticAreaHeight
      );

      this._createChaosDraggable(
        planetKey,
        startX,
        startY,
        this.PLANET_SCALE,
        targetX,
        targetY
      );
    }
  }

  /**
   * Adds the level status feedback text to the bottom of the screen.
   */
  _addFeedbackText() {
    const { width, height } = this.sys.game.config;
    this.feedbackText = this.add
      .text(
        width / 2,
        height - 30,
        `Ordnung: ${this.orderAchieved}/${this.totalChaos}`,
        {
          fontSize: "24px",
          fill: "#FFD700",
        }
      )
      .setOrigin(0.5)
      .setDepth(10);
  }

  /**
   * Draws the target marker as a faint white circle.
   * @param {number} x - X-coordinate of the circle center.
   * @param {number} y - Y-coordinate of the circle center.
   * @param {number} scale - Scaling factor to calculate the radius.
   * @returns {Phaser.GameObjects.Graphics} The created graphics object.
   */
  _addTarget(x, y, scale) {
    const baseRadius = 150;
    const radius = baseRadius * scale;
    const graphics = this.add.graphics({ x: x, y: y });

    graphics.fillStyle(0xffffff, 0.15);
    graphics.fillCircle(0, 0, radius);

    return graphics;
  }

  /**
   * Creates a draggable planet object and sets up drag events.
   * @param {string} key - Asset key for the planet.
   * @param {number} startX - Initial X-position.
   * @param {number} startY - Initial Y-position.
   * @param {number} scale - Scale of the object.
   * @param {number} targetX - Target X-position.
   * @param {number} targetY - Target Y-position.
   */
  _createChaosDraggable(key, startX, startY, scale, targetX, targetY) {
    const item = this.add
      .image(startX, startY, key)
      .setInteractive({ draggable: true })
      .setScale(scale)
      .setDepth(1);

    item.setData({
      targetX: targetX,
      targetY: targetY,
      isOrdered: false,
    });

    item.on("drag", (pointer, dragX, dragY) => {
      item.x = dragX;
      item.y = dragY;
    });

    item.on("dragend", () => {
      this._checkOrder(item);
    });
  }

  /**
   * Checks if an object was dropped on the correct target position.
   * @param {Phaser.GameObjects.Image} item - The dropped planet object.
   */
  _checkOrder(item) {
    if (item.getData("isOrdered")) return;

    const tx = item.getData("targetX");
    const ty = item.getData("targetY");

    const posMatch =
      Math.abs(item.x - tx) < this.POS_TOLERANCE &&
      Math.abs(item.y - ty) < this.POS_TOLERANCE;

    if (posMatch) {
      this._achieveOrder(item);
    }
  }

  /**
   * Sets an object to the ordered state (snapped into place).
   * @param {Phaser.GameObjects.Image} item - The planet object.
   */
  _achieveOrder(item) {
    item.setData("isOrdered", true);
    item.disableInteractive();

    item.x = item.getData("targetX");
    item.y = item.getData("targetY");

    this.tweens.add({
      targets: item,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      onComplete: () => item.setAlpha(1),
    });

    this.orderAchieved++;
    this.feedbackText.setText(
      `Ordnung: ${this.orderAchieved}/${this.totalChaos}`
    );

    if (this.orderAchieved === this.totalChaos) {
      this._levelComplete();
    }
  }

  /**
   * Called when all planets have been correctly placed.
   */
  _levelComplete() {
    this._showMessage(
      "Das Chaos ist gebannt!\nDu hast die Planeten erfolgreich in\ndie richtige Umlaufbahn gebracht.",
      5000
    );

    // Nach 6 Sekunden Musik stoppen und nächstes Level starten
    this.time.delayedCall(6000, () => {
      if (this.music) {
        this.music.stop();
      }
      this.scene.start("levelTwoScene");
    });
  }

  // ----------------------------------------------------------------------------------
  // PUBLIC UTILITY FUNCTIONS (Kept public for potential external use)
  // ----------------------------------------------------------------------------------

  /**
   * Scales an image to fill the entire screen (background).
   * @param {string} key - The asset key of the background image.
   */
  setFullScreenBackground(key) {
    const { width: gameWidth, height: gameHeight } = this.sys.game.config;
    const background = this.add.image(gameWidth / 2, gameHeight / 2, key);
    background.setOrigin(0.5);

    const scaleX = gameWidth / background.width;
    const scaleY = gameHeight / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);
  }

  /**
   * Displays a temporary message on the screen.
   * @param {string} text - The message to display.
   * @param {number} [duration=2000] - Duration before the fade-out starts.
   */
  _showMessage(text, duration = 2000) {
    console.log("FEEDBACK: " + text);

    const { width, height } = this.sys.game.config;
    const message = this.add
      .text(width / 2, height / 4, text, {
        fontSize: "24px",
        fill: "#FFD700",
        align: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.tweens.add({
      targets: message,
      alpha: 0,
      ease: "Power1",
      duration: 500,
      delay: duration,
      onComplete: () => {
        message.destroy();
      },
    });
  }
}
