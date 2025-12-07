// CENTRAL DEFINITION OF DROP ZONE COORDINATES
const ZONE_COORDINATES = [
  { offX: 215, inX: 215, offY: 240, inY: 445 }, // Zone 1: Wood
  { offX: 475, inX: 475, offY: 240, inY: 445 }, // Zone 2: Screw
  { offX: 742, inX: 742, offY: 240, inY: 445 }, // Zone 3: Metal
];

// Game mechanics constants
const ITEM_FALL_SPEED_MS = 1500;
const ITEM_MOVE_DURATION = ITEM_FALL_SPEED_MS;
const TOTAL_ITEMS_REQUIRED = 20;
const ITEM_KEYS = ["item_red", "item_green", "item_blue"];
const SNAP_LINE_TOLERANCE = 50;
const ZONE_SIZE = 150;
const MAX_MISTAKES_ALLOWED = 1;

// MAIN SCENE CLASS
class LevelFourScene extends Phaser.Scene {
  backgroundSprite;
  leverSprite;
  engineImage;
  isLeverOn = false;

  dropOffZones = [];
  dropInZones = [];
  itemGroup;
  itemsDroppedCount = 0;
  mistakesCount = 0;
  itemSpawnTimer;
  scoreText;
  completionText;
  failText;

  /** @type {Phaser.Sound.BaseSound | null} */
  music = null;

  constructor() {
    super("LevelFourScene");
  }

  preload() {
    // Background spritesheet
    this.load.spritesheet(
      "background_sheet",
      "assets/level-four/engine-on-off-work-spritesheet.png",
      { frameWidth: 1536, frameHeight: 1024 }
    );

    // Lever spritesheet
    this.load.spritesheet(
      "lever_sheet",
      "assets/level-four/lever-on-off-spritesheet.png",
      {
        frameWidth: 1280,
        frameHeight: 1024,
      }
    );

    // Images
    this.load.image("engine", "assets/level-four/engine.png");
    this.load.image("item_red", "assets/level-four/items/holz.png");
    this.load.image("item_green", "assets/level-four/items/schraube.png");
    this.load.image("item_blue", "assets/level-four/items/metal.png");

    // Audio
    this.load.audio(
      "bg_5_music",
      "assets/audio/level-four-background-sound.mp3"
    );

    this.load.audio("engine-sound", "assets/audio/engine-on-sound.mp3");

    this.load.audio("success_sound_four", "assets/audio/dialog4.mp3");
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.setupHtmlClasses();
    this.createBackground();
    this.createAnimations();
    this.createForegroundElements();
    this._startBackgroundMusic();

    this.itemGroup = this.add.group();
    this.setupDropZones();
    this.createScoreText();
    this.setupDragEvents();

    this.completionText = this.createCenteredText(
      "Ordnung hergestellt!",
      "#f5f103ff, Macondo"
    );
    this.failText = this.createCenteredText("Versuche es erneut", "#ff0000ff");
  }

  // HILFSFUNKTION für zentrierten Text
  createCenteredText(text, fillColor) {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    return this.add
      .text(centerX, centerY, text, {
        font: "50px Macondo",
        fill: fillColor,
        backgroundColor: "#00000080",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(100)
      .setVisible(false);
  }

  // --- SCENE INITIALIZATION METHODS ---

  setupHtmlClasses() {
    document.getElementById("bodyId").classList.toggle("level4-background");
    document
      .getElementById("game-container")
      .classList.toggle("level4-game-container");
  }

  _startBackgroundMusic() {
    this.music = this.sound.add("bg_5_music", {
      volume: 0.4,
      loop: true,
    });
    this.music.play();

    // Success/Intro Sound direkt beim Levelstart
    this.sound.play("success_sound_four", {
      volume: 0.7,
      loop: false,
    });
  }

  _startEngineSound() {
    this.engineSound = this.sound.add("engine-sound", {
      volume: 0.1,
      loop: true,
    });
    this.engineSound.play();
  }

  createBackground() {
    this.backgroundSprite = this.add
      .sprite(0, 0, "background_sheet")
      .setOrigin(0, 0)
      .setDisplaySize(this.game.config.width, this.game.config.height);
    this.backgroundSprite.setFrame(0);
  }

  createAnimations() {
    this.anims.create({
      key: "bg_loop",
      frames: this.anims.generateFrameNumbers("background_sheet", {
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });
  }

  createForegroundElements() {
    this.engineImage = this.add.image(908, 415, "engine").setScale(0.32);

    this.leverSprite = this.add
      .sprite(900, 326, "lever_sheet", 0)
      .setInteractive()
      .setScale(0.1);
    this.leverSprite.on("pointerdown", this.handleLeverClick, this);
  }

  createScoreText() {
    this.scoreText = this.add
      .text(
        410,
        10,
        `Ordnung: ${this.itemsDroppedCount}/${TOTAL_ITEMS_REQUIRED}`,
        {
          font: "20px Macondo",
          fill: "#ffffff",
        }
      )
      .setDepth(10);
  }

  setupDragEvents() {
    this.input.on("dragstart", this.handleDragStart, this);
    this.input.on("drag", this.handleDrag, this);
    this.input.on("drop", this.handleItemDrop, this);
    this.input.on("dragend", this.handleDragEnd, this);
  }

  // --- DRAG EVENT HANDLERS ---

  handleDragStart(pointer, gameObject) {
    const activeTween = gameObject.getData("fallTween");
    if (activeTween) {
      activeTween.stop();
    }
    gameObject.setDepth(10);
  }

  handleDrag(pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
  }

  handleItemDrop(pointer, gameObject, dropZone) {
    if (!dropZone) return;

    const itemKey = gameObject.getData("key");
    const dropZoneKey = dropZone.getData("key");

    if (itemKey === dropZoneKey) {
      this.processCorrectDrop(gameObject);
    } else {
      gameObject.destroy();
      this.registerMistake();
    }
  }

  handleDragEnd(pointer, gameObject, dropped) {
    if (dropped) return;

    if (this.trySnapToDropOffLine(gameObject)) {
      this.resumeItemFall(gameObject, ZONE_COORDINATES[0].inY, false);
    } else {
      gameObject.destroy();
      this.registerMistake();
    }
  }

  // --- ITEM SPAWN AND FALL MECHANICS ---

  setupDropZones() {
    this.dropOffZones = [];
    this.dropInZones = [];

    ZONE_COORDINATES.forEach((coords, i) => {
      this.dropOffZones.push({ x: coords.offX, y: coords.offY });

      // Debug-Rect (falls zu sichtbar: .setVisible(false) einbauen)
      this.add
        .graphics({})
        .fillRect(
          coords.inX - ZONE_SIZE / 2,
          coords.inY,
          ZONE_SIZE,
          ZONE_SIZE / 2
        );

      const dropZone = this.add
        .zone(coords.inX, coords.inY + ZONE_SIZE / 4, ZONE_SIZE, ZONE_SIZE / 2)
        .setRectangleDropZone(ZONE_SIZE, ZONE_SIZE / 2);

      dropZone.setData("key", ITEM_KEYS[i]);
      this.dropInZones.push(dropZone);
    });
  }

  spawnRandomItem() {
    const itemKey = Phaser.Utils.Array.GetRandom(ITEM_KEYS);
    const startZone = Phaser.Utils.Array.GetRandom(this.dropOffZones);
    const startX = startZone.x;
    const startY = startZone.y;

    const item = this.add.image(startX, startY, itemKey).setScale(0.1);
    item.setDepth(1).setInteractive();
    this.input.setDraggable(item);
    item.setData("key", itemKey);

    this.itemGroup.add(item);

    this.resumeItemFall(item, ZONE_COORDINATES[0].inY, true);
  }

  resumeItemFall(item, targetY, isDraggable = false) {
    if (!isDraggable) {
      this.input.setDraggable(item, false);
    }

    const fallTween = this.createFallTween(item, targetY);
    item.setData("fallTween", fallTween);
  }

  createFallTween(item, targetY) {
    return this.tweens.add({
      targets: item,
      y: targetY,
      duration: ITEM_MOVE_DURATION,
      ease: "Linear",
      onComplete: (tween, targets) => {
        const obj = targets[0];
        if (!obj || !obj.active) return;

        this.checkItemLanding(obj);
      },
    });
  }

  checkItemLanding(item) {
    const itemKey = item.getData("key");
    const isCorrect = ZONE_COORDINATES.some((coords, i) => {
      if (ITEM_KEYS[i] !== itemKey) return false;

      const zoneTop = coords.inY;
      const zoneBottom = coords.inY + ZONE_SIZE / 2;
      const zoneLeft = coords.inX - ZONE_SIZE / 2;
      const zoneRight = coords.inX + ZONE_SIZE / 2;

      return (
        item.x >= zoneLeft &&
        item.x <= zoneRight &&
        item.y >= zoneTop &&
        item.y <= zoneBottom
      );
    });

    item.setData("fallTween", null);
    item.destroy();

    if (isCorrect) {
      this.processCorrectDrop();
    } else {
      this.registerMistake();
    }
  }

  trySnapToDropOffLine(gameObject) {
    let snapped = false;

    for (const dropOff of this.dropOffZones) {
      if (Math.abs(gameObject.x - dropOff.x) < SNAP_LINE_TOLERANCE) {
        gameObject.x = dropOff.x;
        gameObject.y = Math.max(gameObject.y, dropOff.y);
        snapped = true;
        break;
      }
    }
    return snapped;
  }

  processCorrectDrop(gameObject = null) {
    this.itemsDroppedCount++;
    this.updateScoreText();
    if (gameObject) gameObject.destroy();

    if (this.itemsDroppedCount >= TOTAL_ITEMS_REQUIRED) {
      this.setLeverState(false);
      this.completionText.setVisible(true);
      this.triggerSceneChange();
    }
  }

  registerMistake() {
    this.mistakesCount++;
    if (this.mistakesCount >= MAX_MISTAKES_ALLOWED) {
      this.setLeverState(false);
      this.failText.setVisible(true);

      this.time.delayedCall(
        3000,
        () => this.failText.setVisible(false),
        [],
        this
      );
    }
  }

  updateScoreText() {
    if (this.scoreText) {
      this.scoreText.setText(
        `Ordnung: ${this.itemsDroppedCount}/${TOTAL_ITEMS_REQUIRED}`
      );
    }
  }

  // --- LEVEL STATE CONTROL ---

  handleLeverClick() {
    this.setLeverState(!this.isLeverOn);
  }

  setLeverState(state) {
    this.isLeverOn = state;

    if (state) {
      this.leverSprite.setFrame(1);
      this.startLevel();
      this._startEngineSound();
    } else {
      this.leverSprite.setFrame(0);
      this.stopLevel();
      if (this.engineSound) {
        this.engineSound.stop();
      }
    }
  }

  startLevel() {
    this.backgroundSprite.play("bg_loop");

    this.itemSpawnTimer = this.time.addEvent({
      delay: 1500,
      callback: this.spawnRandomItem,
      callbackScope: this,
      loop: true,
    });
  }

  stopLevel() {
    if (this.itemSpawnTimer) {
      this.itemSpawnTimer.remove(false);
      this.itemSpawnTimer = null;
    }

    this.itemGroup.getChildren().forEach((item) => {
      this.tweens.killTweensOf(item);
    });

    this.itemGroup.clear(true, true);

    this.itemsDroppedCount = 0;
    this.mistakesCount = 0;
    this.updateScoreText();

    this.backgroundSprite.stop();
    this.backgroundSprite.setFrame(0);

    if (this.completionText) {
      this.completionText.setVisible(false);
    }
    if (this.failText) {
      this.failText.setVisible(false);
    }
  }

  // --- SCENE CHANGE ---

  triggerSceneChange() {
    this.time.delayedCall(
      3000,
      () => {
        if (this.music) {
          this.music.stop();
        } // Change to the next scene (e.g., 'NextScene')
        this.cameras.main.fadeOut(1000, 0, 0, 0); // 1000ms, R=0, G=0, B=0 (Schwarz)
        this.cameras.main.once(
          Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          (cam, effect) => {
            // Wenn der Fade-Out abgeschlossen ist, zur nächsten Szene wechseln
            this.scene.start("LevelFiveScene");
          }
        );
      },
      [],
      this
    );
  }
}
