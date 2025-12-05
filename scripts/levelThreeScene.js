/**
 * Main scene for Level 3: The Alchemy Potion.
 * Ingredients must be dragged into the cauldron in a specific sequence.
 */
class LevelThreeScene extends Phaser.Scene {
  // --- CONSTANTS AND PROPERTIES ---
  /** @type {Phaser.Sound.BaseSound | null} */
  music = null;
  /** @type {number} */
  FRAME_WIDTH = 1536;
  /** @type {number} */
  FRAME_HEIGHT = 1024;
  /** @type {number} */
  START_FRAMERATE = 20;
  /** @type {number} */
  MIN_FRAMERATE = 1;
  /** @type {number} */
  FRAMERATE_DECREMENT = 2;
  /** @type {string[]} */
  correctSequence = [
    "mushroom",
    "sheet",
    "stick",
    "eye",
    "bone",
    "bottle",
    "crawl",
    "feather",
    "berry",
    "crystal",
  ];
  /** @type {number} */
  TOTAL_INGREDIENTS;
  /** @type {number} */
  currentSequenceIndex = 0;
  /** @type {{x: number, y: number}[]} */
  INGREDIENT_POSITIONS = [
    { x: 820, y: 560 },
    { x: 350, y: 520 },
    { x: 230, y: 330 },
    { x: 85, y: 200 },
    { x: 300, y: 488 },
    { x: 910, y: 232 },
    { x: 896, y: 562 },
    { x: 180, y: 570 },
    { x: 250, y: 208 },
    { x: 955, y: 420 },
  ];

  /** @type {number} */
  ingredientsCollected = 0;
  /** @type {Phaser.GameObjects.Group | null} */
  ingredientsGroup = null;
  /** @type {{x: number, y: number, radius: number}} */
  CAULDRON_TARGET = { x: 0, y: 0, radius: 100 };
  /** @type {Phaser.GameObjects.Sprite} */
  background;
  /** @type {Phaser.GameObjects.Text} */
  feedbackText;
  /** @type {number} */
  positionScaleX;
  /** @type {number} */
  positionScaleY;

  constructor() {
    super({ key: "levelThreeScene" });
    this.TOTAL_INGREDIENTS = this.correctSequence.length;
  }

  /**
   * Loads all necessary assets including the animated background, ingredients, and music.
   */
  preload() {
    this.load.spritesheet(
      "backgroundAnimation",
      "assets/level-three/background-canvas-spritesheet.png",
      {
        frameWidth: this.FRAME_WIDTH,
        frameHeight: this.FRAME_HEIGHT,
      }
    );

    for (const key of this.correctSequence) {
      this.load.image(key, `assets/level-three/ingredients/${key}.png`);
    }

    // Load Background Music
    this.load.audio(
      "bg_4_music",
      "assets/audio/level-three-background-sound.mp3"
    );
  }

  /**
   * Creates the game objects and sets up the level environment.
   */
  create() {
    this._setupHTMLClasses();
    const { width, height } = this.sys.game.config;

    // Calculate scaling factors for fixed ingredient positions
    const defaultWidth = 1000;
    const defaultHeight = 600;
    this.positionScaleX = width / defaultWidth;
    this.positionScaleY = height / defaultHeight;

    // Set cauldron target position
    this.CAULDRON_TARGET.x = width / 2 - 15;
    this.CAULDRON_TARGET.y = height / 2 + 50;

    this._setupAnimatedBackground(width, height);
    this._startBackgroundMusic(); // Start music

    this.ingredientsGroup = this.add.group();

    this.feedbackText = this.add
      .text(width / 2, height - 30, `Wird geladen...`, {
        fontSize: "24px",
        fill: "#FFFF00",
        backgroundColor: "#1e1e1e75",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.resetLevel();
  }

  // ----------------------------------------------------------------------
  // --- UTILITY AND GAME LOGIC METHODS ---
  // ----------------------------------------------------------------------

  /**
   * Toggles the necessary HTML classes for the scene.
   */
  _setupHTMLClasses() {
    document.getElementById("bodyId").classList.toggle("level3-background");
    document
      .getElementById("game-container")
      .classList.toggle("level3-game-container");
  }

  /**
   * Starts the scene's background music.
   */
  _startBackgroundMusic() {
    this.music = this.sound.add("bg_4_music", {
      volume: 0.4,
      loop: true,
    });
    this.music.play();
  }

  /**
   * Resets the entire game state, clears ingredients, and restarts the sequence.
   */
  resetLevel() {
    this.ingredientsGroup.clear(true, true);

    this.ingredientsCollected = 0;
    this.currentSequenceIndex = 0;

    this._placeIngredients(this.correctSequence);

    this._updateBackgroundFramerate();

    this.feedbackText.setText(
      `Zutaten: 0/${this.TOTAL_INGREDIENTS}`
    );
  }

  /**
   * Places the ingredients defined in the list at fixed positions.
   * @param {string[]} keysToPlace - Array of keys to place as sprites.
   */
  _placeIngredients(keysToPlace) {
    const uniqueKeysToPlace = [...new Set(keysToPlace)];
    const count = Math.min(
      uniqueKeysToPlace.length,
      this.INGREDIENT_POSITIONS.length
    );

    for (let i = 0; i < count; i++) {
      const key = uniqueKeysToPlace[i];
      const pos = this.INGREDIENT_POSITIONS[i];

      const startX = pos.x * this.positionScaleX;
      const startY = pos.y * this.positionScaleY;

      const item = this._createDraggableIngredient(key, startX, startY);
      this.ingredientsGroup.add(item);
    }
  }

  /**
   * Creates a draggable ingredient object.
   * @param {string} key - Asset key.
   * @param {number} startX - Initial X position.
   * @param {number} startY - Initial Y position.
   * @returns {Phaser.GameObjects.Image} The created ingredient sprite.
   */
  _createDraggableIngredient(key, startX, startY) {
    const item = this.add
      .image(startX, startY, key)
      .setInteractive({ draggable: true })
      .setScale(0.2)
      .setDepth(1)
      .setName(key);

    item.on("drag", (pointer, dragX, dragY) => {
      item.x = dragX;
      item.y = dragY;
    });

    item.on("dragend", () => {
      this._checkCauldronDrop(item);
    });

    return item;
  }

  /**
   * Checks if the ingredient was dropped into the cauldron target area.
   * @param {Phaser.GameObjects.Image} item - The dropped ingredient.
   */
  _checkCauldronDrop(item) {
    const dist = Phaser.Math.Distance.Between(
      item.x,
      item.y,
      this.CAULDRON_TARGET.x,
      this.CAULDRON_TARGET.y
    );

    if (dist < this.CAULDRON_TARGET.radius) {
      this._processDrop(item);
    }
  }

  /**
   * Processes the drop: Checks the sequence order and handles Correct/Incorrect (with reset).
   * @param {Phaser.GameObjects.Image} item - The ingredient dropped into the cauldron.
   */
  _processDrop(item) {
    if (this.ingredientsCollected === this.TOTAL_INGREDIENTS) return;

    const requiredKey = this.correctSequence[this.currentSequenceIndex];

    if (item.name === requiredKey) {
      // --- CORRECT INGREDIENT DROPPED ---
      item.destroy();
      this.ingredientsCollected++;
      this.currentSequenceIndex++;

      this._updateBackgroundFramerate();

      if (this.ingredientsCollected === this.TOTAL_INGREDIENTS) {
        this._levelComplete(); // Call internal method for completion
      } else {
        this.feedbackText.setText(
          `Zutaten: ${this.ingredientsCollected}/${
            this.TOTAL_INGREDIENTS
          }`
        );
      }
    } else {
      // --- WRONG INGREDIENT DROPPED: LEVEL RESET ---
      this.feedbackText.setText(
        `Falsche Zutat! Alle Zutaten zurückgesetzt!`
      );

      this.time.delayedCall(1500, this.resetLevel, [], this);
    }
  }

  /**
   * Adjusts the framerate of the background animation based on progress (slowing down the boil).
   */
  _updateBackgroundFramerate() {
    let newFramerate =
      this.START_FRAMERATE -
      this.ingredientsCollected * this.FRAMERATE_DECREMENT;
    newFramerate = Math.max(newFramerate, this.MIN_FRAMERATE);

    this.background.anims.play({
      key: "backgroundAnimation",
      frameRate: newFramerate,
      repeat: -1,
    });
  }

  /**
   * Initializes the background animation spritesheet and scaling.
   * @param {number} width - Game width.
   * @param {number} height - Game height.
   */
  _setupAnimatedBackground(width, height) {
    this.anims.create({
      key: "backgroundAnimation",
      frames: this.anims.generateFrameNumbers("backgroundAnimation", {
        start: 0,
        end: 2,
      }),
      frameRate: this.START_FRAMERATE,
      repeat: -1,
    });

    this.background = this.add.sprite(
      width / 2,
      height / 2,
      "backgroundAnimation"
    );
    const scaleX = width / this.FRAME_WIDTH;
    const scaleY = height / this.FRAME_HEIGHT;
    const scale = Math.max(scaleX, scaleY);

    this.background.setScale(scale);
    this.background.setDepth(-10);
    this.background.play("backgroundAnimation");
  }

  /**
   * Called when all ingredients have been collected. Stops the animation and transitions scene.
   */
  _levelComplete() {
    this.feedbackText.setText("Brau abgeschlossen! Das Gebräu ist fertig!");

    this.background.anims.stop();
    this.background.setFrame(3);

    // Stop music before transition
    if (this.music) {
      this.music.stop();
    }

    // Transition to the final scene (assuming it's 'finalScene') after a delay
    this.time.delayedCall(3000, () => {
      this.scene.start("LevelFourScene"); // Passe dies bei Bedarf an den Key deiner End-Szene an
    });
  }
}
