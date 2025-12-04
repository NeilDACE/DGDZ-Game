/**
 * Main scene for Level 2: The Egyptian Puzzle.
 * Players must drag puzzle pieces into their correct target slots on the background image.
 */
class LevelTwoScene extends Phaser.Scene {
  /** @type {Phaser.Sound.BaseSound | null} */
  music = null;
  /** @type {Phaser.GameObjects.Image} */
  sandOverlay;
  /** @type {Phaser.GameObjects.Sprite[]} */
  pieces = [];
  /** @type {Phaser.GameObjects.Text} */
  infoText;
  /** @type {boolean} */
  completed = false;
  /** @type {{id: string, x: number, y: number, radius: number, offsetX: number, offsetY: number, targetScale: number}[]} */
  targets;

  constructor() {
    super("levelTwoScene");
  }

  /**
   * Loads all necessary assets (images and audio).
   */
  preload() {
    // Background with puzzle slots
    this.load.image(
      "egypt_bg_puzzle",
      "assets/leveltwo/backgroundCanvasfinish.png"
    );

    // Puzzle pieces (Asset Keys -> Original Filenames)
    this.load.image("piece_nose", "assets/leveltwo/nase.png");
    this.load.image("piece_door", "assets/leveltwo/saeule.png");
    this.load.image("piece_crown", "assets/leveltwo/pflanze.png");
    this.load.image("piece_stone", "assets/leveltwo/stone.png");
    this.load.image("piece_obelisk", "assets/leveltwo/obeliskSpitze.png");
    this.load.image("piece_symbol", "assets/leveltwo/symbol.png");
    this.load.image("piece_camel", "assets/leveltwo/camel.png");
    this.load.image("piece_human", "assets/leveltwo/mensch.png"); // Changed key to 'piece_human'

    // Optional overlays/audio
    this.load.image("sand_overlay", "assets/sand_overlay.png");
    this.load.audio("bg_3_music", "assets/audio/level-two-background-sound.mp3");
  }

  /**
   * Creates the game objects, sets up drag events, and starts music.
   */
  create() {
    this._setupHTMLClasses();
    this._startBackgroundMusic();

    const { width, height } = this.scale;

    // === Background Setup ===
    const bg = this.add
      .image(width / 2, height / 2, "egypt_bg_puzzle")
      .setDepth(0);
    let scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);

    // === Sand Overlay ===
    this.sandOverlay = this.add
      .image(width / 2, height / 2, "sand_overlay")
      .setDepth(20)
      .setAlpha(0);

    // === Target Positions (ID muss mit pieceId übereinstimmen) ===
    this.targets = [
      {
        id: "nose",
        x: 720,
        y: 170,
        radius: 50,
        offsetX: 30,
        offsetY: 9,
        targetScale: 0.65,
      },
      {
        id: "door",
        x: 615,
        y: 410,
        radius: 50,
        offsetX: 9,
        offsetY: 24,
        targetScale: 0.65,
      },
      {
        id: "crown",
        x: 450,
        y: 490,
        radius: 50,
        offsetX: -12,
        offsetY: 32,
        targetScale: 0.7,
      },
      {
        id: "stone",
        x: 240,
        y: 520,
        radius: 50,
        offsetX: -22,
        offsetY: 40,
        targetScale: 0.63,
      },
      {
        id: "obelisk",
        x: 125,
        y: 100,
        radius: 50,
        offsetX: -11,
        offsetY: -23,
        targetScale: 0.69,
      },
      {
        id: "symbol",
        x: 145,
        y: 200,
        radius: 50,
        offsetX: -21,
        offsetY: 18,
        targetScale: 0.55,
      },
      {
        id: "camel",
        x: 450,
        y: 350,
        radius: 50,
        offsetX: 0,
        offsetY: 5,
        targetScale: 0.1,
      },
      {
        id: "human",
        x: 380,
        y: 360,
        radius: 50,
        offsetX: 0,
        offsetY: 0,
        targetScale: 0.05,
      }, // Changed ID to 'human'
    ];

    // === Puzzle Pieces ===
    this._createPiece("nose", "piece_nose", 150, 520, 0.5);
    this._createPiece("door", "piece_door", 400, 520, 0.5);
    this._createPiece("crown", "piece_crown", 750, 400, 0.5);
    this._createPiece("stone", "piece_stone", 650, 350, 0.5);
    this._createPiece("obelisk", "piece_obelisk", 900, 520, 0.5);
    this._createPiece("symbol", "piece_symbol", 600, 200, 0.5);
    this._createPiece("camel", "piece_camel", 500, 100, 0.1);
    this._createPiece("human", "piece_human", 600, 100, 0.05); // Changed ID to 'human'

    // === Drag Events ===
    this.input.on("dragstart", (pointer, piece) => {
      if (piece.placed) return;
      piece.setDepth(10);
      piece.setScale(piece.baseScale * 1.0);
    });

    this.input.on("drag", (pointer, piece, dragX, dragY) => {
      if (piece.placed) return;
      piece.x = dragX;
      piece.y = dragY;
    });

    this.input.on("dragend", (pointer, piece) => {
      if (piece.placed) return;
      this._tryPlacePiece(piece);
    });

    // Info Text
    this.infoText = this.add
      .text(width / 2, 40, "Level 2: Setze die fehlenden Teile ein", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(30);
  }

  // ----------------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ----------------------------------------------------------------------------------

  /**
   * Toggles the necessary HTML classes for the scene.
   */
  _setupHTMLClasses() {
    document.getElementById("bodyId").classList.toggle("level2-background");
    document
      .getElementById("game-container")
      .classList.toggle("level2-game-container");
  }

  /**
   * Starts the scene's background music.
   */
  _startBackgroundMusic() {
    this.music = this.sound.add("bg_3_music", {
      volume: 0.4,
      loop: true,
    });
    this.music.play();
  }

  /**
   * Creates a draggable puzzle piece sprite.
   * @param {string} id - Unique identifier for the piece (must match target ID).
   * @param {string} textureKey - Key of the loaded texture.
   * @param {number} startX - Initial X position.
   * @param {number} startY - Initial Y position.
   * @param {number} scale - Initial scale.
   * @returns {Phaser.GameObjects.Sprite} The created sprite object.
   */
  _createPiece(id, textureKey, startX, startY, scale = 1) {
    const sprite = this.add.sprite(startX, startY, textureKey).setDepth(5);
    if (!sprite) {
      console.warn("Sprite could not be created:", textureKey);
      return;
    }

    // Store custom properties on the sprite
    sprite.pieceId = id;
    sprite.startX = startX;
    sprite.startY = startY;
    sprite.placed = false;

    sprite.baseScale = scale;
    sprite.setScale(scale);

    sprite.setInteractive({ cursor: "pointer" });
    this.input.setDraggable(sprite);

    this.pieces.push(sprite);
    return sprite;
  }

  /**
   * Attempts to place a puzzle piece into its correct target slot.
   * If the distance is within the target radius, it snaps the piece into place.
   * @param {Phaser.GameObjects.Sprite} piece - The dragged puzzle piece.
   */
  _tryPlacePiece(piece) {
    const target = this.targets.find((t) => t.id === piece.pieceId);
    if (!target) return;

    const dist = Phaser.Math.Distance.Between(
      piece.x,
      piece.y,
      target.x,
      target.y
    );

    if (dist <= target.radius) {
      const ox = target.offsetX || 0;
      const oy = target.offsetY || 0;

      // Snap to the target position (with offset)
      piece.x = target.x + ox;
      piece.y = target.y + oy;

      piece.placed = true;
      piece.setDepth(2);
      piece.disableInteractive(); // Disable further dragging

      const finalScale = target.targetScale || piece.baseScale;
      piece.baseScale = finalScale;
      piece.setScale(finalScale);

      // Placement effect
      this.tweens.add({
        targets: piece,
        scale: finalScale * 1.1,
        duration: 120,
        yoyo: true,
      });

      this._checkCompleted();
    } else {
      // Return to start position
      this.tweens.add({
        targets: piece,
        x: piece.startX,
        y: piece.startY,
        scale: piece.baseScale,
        duration: 200,
        onComplete: () => piece.setDepth(5),
      });
    }
  }

  /**
   * Checks if all puzzle pieces have been placed and initiates level transition if complete.
   */
  _checkCompleted() {
    if (this.completed) return;

    const allPlaced = this.pieces.every((p) => p.placed);

    if (allPlaced) {
      this.completed = true;

      // Stop music before transition
      if (this.music) {
        this.music.stop();
      }

      // Optional effect
      this.cameras.main.flash(300, 255, 255, 255);

      // Transition to Level 3
      this.time.delayedCall(800, () => {
        this.scene.start("levelThreeScene");
      });
    }
  }
}
