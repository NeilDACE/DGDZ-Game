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
  /** @type {Phaser.GameObjects.Text} */
  progressText;
  /** @type {boolean} */
  completed = false;
  /** @type {number} */
  placedCount = 0;
  /** @type {number} */
  totalPieces = 0;
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
      "assets/level-two/backgroundCanvasfinish.png"
    );

    // Puzzle pieces
    this.load.image("piece_nose", "assets/level-two/nase.png");
    this.load.image("piece_door", "assets/level-two/saeule.png");
    this.load.image("piece_crown", "assets/level-two/pflanze.png");
    this.load.image("piece_stone", "assets/level-two/stone.png");
    this.load.image("piece_obelisk", "assets/level-two/obeliskSpitze.png");
    this.load.image("piece_symbol", "assets/level-two/symbol.png");
    this.load.image("piece_camel", "assets/level-two/camel.png");
    this.load.image("piece_human", "assets/level-two/mensch.png");

    // Hintergrundmusik Level 2
    this.load.audio(
      "bg_3_music",
      "assets/audio/level-two-background-sound.mp3"
    );

    // Success-Sound (z.B. Erzähler/Intro)
    this.load.audio("success_sound_two", "assets/audio/dialog2.mp3");

    // 🔊 Sound wenn ein Puzzleteil richtig eingesetzt wird
    this.load.audio("piece_place", "assets/audio/puzzle-sound.mp3");
  }

  /**
   * Creates the game objects, sets up drag events, and starts music.
   */
  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this._setupHTMLClasses();
    this._startBackgroundMusic();

    const { width, height } = this.scale;

    // === Background Setup ===
    const bg = this.add
      .image(width / 2, height / 2, "egypt_bg_puzzle")
      .setDepth(0);
    let scale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(scale);

    // === Target Positions ===
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
      },
    ];

    // === Puzzle Pieces ===
    this._createPiece("nose", "piece_nose", 150, 520, 0.5);
    this._createPiece("door", "piece_door", 400, 520, 0.5);
    this._createPiece("crown", "piece_crown", 200, 170, 0.5);
    this._createPiece("stone", "piece_stone", 650, 350, 0.5);
    this._createPiece("obelisk", "piece_obelisk", 900, 520, 0.5);
    this._createPiece("symbol", "piece_symbol", 600, 200, 0.5);
    this._createPiece("camel", "piece_camel", 500, 100, 0.1);
    this._createPiece("human", "piece_human", 900, 220, 0.05);

    // Gesamtanzahl für Fortschrittsanzeige
    this.totalPieces = this.pieces.length;
    this.placedCount = 0;

    // === Drag Events ===
    this.input.on("dragstart", (pointer, piece) => {
      if (piece.placed) return;
      piece.setDepth(10);
      piece.setScale(piece.baseScale * 1.1);
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

    // Info Text (Titel)
    this.infoText = this.add
      .text(width / 2, 40, "Level 2: Setze die fehlenden Teile ein", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Fortschrittsanzeige: unten mittig
    this.progressText = this.add
      .text(width / 2, height - 40, "", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(30);

    this._updateProgressText();
  }

  // ----------------------------------------------------------------------------------
  // PRIVATE HELFERMETHODEN
  // ----------------------------------------------------------------------------------

  /**
   * Toggles the necessary HTML classes for the scene.
   */
  _setupHTMLClasses() {
    document.getElementById("bodyId")?.classList.toggle("level2-background");
    document
      .getElementById("game-container")
      ?.classList.toggle("level2-game-container");
  }

  /**
   * Starts the scene's background music.
   * Plays the success sound 2 seconds after the background music starts.
   */
  _startBackgroundMusic() {
    if (this.music) return;

    this.music = this.sound.add("bg_3_music", {
      volume: 0.4,
      loop: true,
    });

    const playMusic = () => {
      if (this.music && !this.music.isPlaying) {
        this.music.play();
      }
    };

    // Browser-Autoplay-Handling (Sound-UNLOCK)
    if (this.sound.locked) {
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        playMusic();
      });
    } else {
      playMusic();
    }

    // Success-Sound 2 Sekunden nach Start der Hintergrundmusik
    this.time.delayedCall(2000, () => {
      this.startSuccessSound();
    });
  }

  /**
   * Plays the success / intro sound once.
   */
  startSuccessSound() {
    const successSound = this.sound.add("success_sound_two", {
      volume: 0.7,
      loop: false,
    });
    successSound.play();
  }

  /**
   * Creates a draggable puzzle piece with pixel-perfect interaction.
   */
  _createPiece(id, textureKey, startX, startY, scale = 1) {
    const sprite = this.add.sprite(startX, startY, textureKey).setDepth(5);
    if (!sprite) {
      console.warn("Sprite could not be created:", textureKey);
      return;
    }

    sprite.pieceId = id;
    sprite.startX = startX;
    sprite.startY = startY;
    sprite.placed = false;
    sprite.baseScale = scale;
    sprite.setScale(scale);

    // Pixelgenaues Greifen
    sprite.setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
    });

    this.input.setDraggable(sprite);
    this.pieces.push(sprite);
    return sprite;
  }

  /**
   * Attempts to place a puzzle piece into its target slot.
   */
  _tryPlacePiece(piece) {
    const target = this.targets.find((t) => t.id === piece.pieceId);
    if (!target) {
      console.warn("No target found for piece:", piece.pieceId);
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      piece.x,
      piece.y,
      target.x,
      target.y
    );

    if (dist <= target.radius) {
      const ox = target.offsetX || 0;
      const oy = target.offsetY || 0;

      piece.x = target.x + ox;
      piece.y = target.y + oy;

      piece.placed = true;
      piece.setDepth(2);
      piece.disableInteractive();

      const finalScale = target.targetScale || piece.baseScale;
      piece.baseScale = finalScale;
      piece.setScale(finalScale);

      // 🔊 Sound abspielen wenn korrekt gesetzt
      this.sound.play("piece_place", { volume: 0.6 });

      // Zähler erhöhen & Anzeige aktualisieren
      this.placedCount++;
      this._updateProgressText();

      this.tweens.add({
        targets: piece,
        scale: finalScale * 1.1,
        duration: 120,
        yoyo: true,
      });

      this._checkCompleted();
    } else {
      // Zurück zur Startposition
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
   * Updates the progress text showing how many pieces are placed.
   */
  _updateProgressText() {
    if (!this.progressText) return;
    this.progressText.setText(
      `Ordnung: ${this.placedCount}/${this.totalPieces}`
    );
  }

  /**
   * Checks if all pieces are placed.
   */
  _checkCompleted() {
    if (this.completed) return;

    const allPlaced = this.pieces.every((p) => p.placed);

    if (allPlaced) {
      this.completed = true;

      if (this.music) this.music.stop();

      this.cameras.main.flash(300, 255, 255, 255);

      this.time.delayedCall(800, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0); // 1000ms, R=0, G=0, B=0 (Schwarz)

        this.cameras.main.once(
          Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          (cam, effect) => {
            // Wenn der Fade-Out abgeschlossen ist, zur nächsten Szene wechseln
            this.scene.start("levelThreeScene");
          }
        );
      });
    }
  }
}
