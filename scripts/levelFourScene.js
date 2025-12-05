// **ZENTRALE DEFINITION DER DROP ZONEN KOORDINATEN**
const ZONE_COORDINATES = [
  { offX: 215, inX: 215, offY: 240, inY: 445 }, // Zone 1: Holz
  { offX: 475, inX: 475, offY: 240, inY: 445 }, // Zone 2: Schraube
  { offX: 742, inX: 742, offY: 240, inY: 445 }, // Zone 3: Metall
];

// Konstanten für die Spielmechanik
const ITEM_MOVE_DURATION = 5000;
const TOTAL_ITEMS_REQUIRED = 15;
const ITEM_KEYS = ["item_red", "item_green", "item_blue"];

// --- HAUPT-SCENE KLASSE ---

class LevelFourScene extends Phaser.Scene {
  // Globale Variablen (als Klasseneigenschaften deklariert)
  backgroundSprite;
  leverSprite;
  engineImage;
  isLeverOn = false;

  // Spielmechanik-Variablen
  dropOffZones = [];
  dropInZones = [];
  itemGroup;
  itemsDroppedCount = 0;
  itemSpawnTimer;

  constructor() {
    super("LevelFourScene");
  }

  preload() {
    // --- 1. Assets laden (Ihre Pfade) ---
    this.load.spritesheet(
      "background_sheet",
      "assets/level-four/engine-on-off-work-spritesheet.png",
      { frameWidth: 1536, frameHeight: 1024 }
    );

    this.load.spritesheet(
      "lever_sheet",
      "assets/level-four/lever-on-off-spritesheet.png",
      {
        frameWidth: 1280,
        frameHeight: 1024,
      }
    );

    this.load.image("engine", "assets/level-four/engine.png");

    // Item-Bilder (Ihre Pfade)
    this.load.image("item_red", "assets/level-four/items/holz.png"); // Index 0
    this.load.image("item_green", "assets/level-four/items/schraube.png"); // Index 1
    this.load.image("item_blue", "assets/level-four/items/metal.png"); // Index 2
  }

  create() {
    // --- 1. Hintergrund-Sprite ---
    this.backgroundSprite = this.add
      .sprite(0, 0, "background_sheet")
      .setOrigin(0, 0)
      .setDisplaySize(this.game.config.width, this.game.config.height);
    this.backgroundSprite.setFrame(0);

    // --- 2. Animation erstellen ---
    this.anims.create({
      key: "bg_loop",
      frames: this.anims.generateFrameNumbers("background_sheet", {
        start: 1,
        end: 2,
      }),
      frameRate: 1,
      repeat: -1,
    });

    // --- 3. Vordergrund-Elemente (Engine und Hebel) ---
    this.engineImage = this.add.image(908, 415, "engine").setScale(0.32);

    this.leverSprite = this.add
      .sprite(900, 326, "lever_sheet", 0)
      .setInteractive()
      .setScale(0.1);
    this.leverSprite.on("pointerdown", this.handleLeverClick, this);

    // --- 4. Spielmechanik initialisieren ---
    this.itemGroup = this.add.group();
    this.setupDropZones();

    // Punktestand-Text
    this.add.text(10, 10, `Sortiere Items: 0/${TOTAL_ITEMS_REQUIRED}`, {
      font: "20px Arial",
      fill: "#ffffff",
    });

    // --- 5. Drag-and-Drop Events ---
    this.input.on("dragstart", (pointer, gameObject) => {
      gameObject.setDepth(10);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", this.handleItemDrop, this);
  }

  // --- METHODEN FÜR DIE SPIELMECHANIK ---

  setupDropZones() {
    const zoneColor = [0xff0000, 0x00ff00, 0x0000ff];
    const zoneSize = 150;

    this.dropOffZones = [];
    this.dropInZones = [];

    for (let i = 0; i < ZONE_COORDINATES.length; i++) {
      const coords = ZONE_COORDINATES[i];

      // Drop-Off: Startposition
      this.dropOffZones.push({ x: coords.offX, y: coords.offY });

      // Drop-In: Zielzone erstellen

      // Visuelle Darstellung der Zielzonen
      const graphics = this.add.graphics({
        fillStyle: { color: zoneColor[i], alpha: 0.2 },
      });
      graphics.fillRect(
        coords.inX - zoneSize / 2,
        coords.inY,
        zoneSize,
        zoneSize / 2
      );

      // Unsichtbares DropZone-Objekt
      const dropZone = this.add
        .zone(coords.inX, coords.inY + zoneSize / 4, zoneSize, zoneSize / 2)
        .setRectangleDropZone(zoneSize, zoneSize / 2);

      dropZone.setData("key", ITEM_KEYS[i]);
      this.dropInZones.push(dropZone);
    }
  }

  spawnRandomItem() {
    // Wählt ein zufälliges Item (Key und Index)
    const itemIndex = Phaser.Math.Between(0, 2);
    const itemKey = ITEM_KEYS[itemIndex];

    // Wählt eine zufällige Start-Zone (X-Koordinate)
    const zoneIndex = Phaser.Math.Between(0, 2);
    const startX = this.dropOffZones[zoneIndex].x;
    const startY = this.dropOffZones[zoneIndex].y;

    const item = this.add.image(startX, startY, itemKey).setScale(0.1);
    item.setDepth(1);
    item.setInteractive();
    this.input.setDraggable(item);
    item.setData("key", itemKey);

    this.itemGroup.add(item);

    // Bewegung zur festen IN-Y-Koordinate
    this.tweens.add({
      targets: item,
      y: ZONE_COORDINATES[0].inY,
      duration: ITEM_MOVE_DURATION,
      ease: "Linear",
      onComplete: (tween, targets) => {
        if (targets[0].active) {
          targets[0].destroy();
        }
      },
    });
  }

  handleItemDrop(pointer, gameObject, dropZone) {
    // --- NEUE LOGIK FÜR FEHLERANALYSE UND ZÄHLER-RESET ---

    if (!dropZone) {
      console.warn(
        "DROP FEHLER: Item wurde nicht auf eine Drop-Zone fallen gelassen."
      );
      gameObject.destroy();
      return;
    }

    const itemKey = gameObject.getData("key");
    const dropZoneKey = dropZone.getData("key");

    console.log(`--- Drop Versuch ---`);
    console.log(`Item Key: ${itemKey}`);
    console.log(`Zone Key: ${dropZoneKey}`);

    if (itemKey === dropZoneKey) {
      console.log("ERFOLG: Keys stimmen überein. Zähler wird erhöht.");

      // ✅ RICHTIG: Zähler hoch, Spiel geht weiter
      this.itemsDroppedCount++;
      this.updateScoreText();
      gameObject.destroy();

      if (this.itemsDroppedCount >= TOTAL_ITEMS_REQUIRED) {
        alert("Game Over! Alle Items korrekt sortiert!");
        this.setLeverState(false);
      }
    } else {
      // ❌ FALSCH: Zähler zurücksetzen und Level stoppen
      console.log(
        "FEHLER: Keys stimmen NICHT überein. Zähler wird auf 0 zurückgesetzt und Level gestoppt."
      );

      this.itemsDroppedCount = 0; // Zähler zurücksetzen
      this.updateScoreText();
      gameObject.destroy();

      alert("Falsche Sortierung! Level wird neugestartet.");
      this.stopLevel();
    }
  }

  updateScoreText() {
    const textObject = this.children.list.find(
      (c) => c instanceof Phaser.GameObjects.Text
    );
    if (textObject) {
      textObject.setText(
        `Sortiere Items: ${this.itemsDroppedCount}/${TOTAL_ITEMS_REQUIRED}`
      );
    }
  }

  stopLevel() {
    if (this.itemSpawnTimer) {
      this.itemSpawnTimer.remove(false);
      this.itemSpawnTimer = null;
    }
    this.itemGroup.clear(true, true); // Items verschwinden
    this.itemsDroppedCount = 0;
    this.updateScoreText();
    this.backgroundSprite.stop();
    this.backgroundSprite.setFrame(0);
  }

  startLevel() {
    this.backgroundSprite.play("bg_loop");

    this.itemSpawnTimer = this.time.addEvent({
      delay: 1500, // Alle 1.5 Sekunden
      callback: this.spawnRandomItem,
      callbackScope: this,
      loop: true,
    });
  }

  // --- HEBEL STEUERUNG ---

  handleLeverClick() {
    this.setLeverState(!this.isLeverOn);
  }

  setLeverState(state) {
    this.isLeverOn = state;

    if (state) {
      this.leverSprite.setFrame(1);
      this.startLevel();
    } else {
      this.leverSprite.setFrame(0);
      this.stopLevel();
    }
  }

  update(time, delta) {
    // ...
  }
}
