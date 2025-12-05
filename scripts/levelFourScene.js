// **ZENTRALE DEFINITION DER DROP ZONEN KOORDINATEN**
const ZONE_COORDINATES = [
  { offX: 215, inX: 215, offY: 240, inY: 445 }, // Zone 1: Holz
  { offX: 475, inX: 475, offY: 240, inY: 445 }, // Zone 2: Schraube
  { offX: 742, inX: 742, offY: 240, inY: 445 }, // Zone 3: Metall
];

// Konstanten für die Spielmechanik
const ITEM_MOVE_DURATION = 5000;
const TOTAL_ITEMS_REQUIRED = 20; // Es müssen 20 Items korrekt sortiert werden
const ITEM_KEYS = ["item_red", "item_green", "item_blue"];
const SNAP_LINE_TOLERANCE = 50; // Max. Abstand zur Drop-Off X-Koordinate, um als 'auf der Linie' zu gelten
const MAX_MISTAKES_ALLOWED = 3; // Maximal 3 Fehler erlaubt
const ZONE_SIZE = 150; // Einheitliche Größe der Kisten

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
  itemsDroppedCount = 0; // korrekt einsortierte Items
  mistakesCount = 0; // Fehlerzähler
  itemSpawnTimer;

  // Textobjekte für Anzeige
  scoreText;
  mistakeText;

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
    this.load.image("item_red", "assets/level-four/items/holz.png");
    this.load.image("item_green", "assets/level-four/items/schraube.png");
    this.load.image("item_blue", "assets/level-four/items/metal.png");
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
    this.scoreText = this.add.text(
      10,
      10,
      `Sortierte Items: 0/${TOTAL_ITEMS_REQUIRED}`,
      {
        font: "20px Arial",
        fill: "#ffffff",
      }
    );

    // Fehler-Text
    this.mistakeText = this.add.text(
      10,
      40,
      `Fehler: 0/${MAX_MISTAKES_ALLOWED}`,
      {
        font: "20px Arial",
        fill: "#ffaaaa",
      }
    );

    // --- 5. Drag-and-Drop Events ---
    this.input.on("dragstart", (pointer, gameObject) => {
      // Stoppe das spezifische, in den Daten gespeicherte Tween
      const activeTween = gameObject.getData("fallTween");
      if (activeTween) {
        activeTween.stop();
      }

      gameObject.setDepth(10);
    });

    this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on("drop", this.handleItemDrop, this);
    this.input.on("dragend", this.handleDragEnd, this);
  }

  // --- METHODEN FÜR DIE SPIELMECHANIK ---

  setupDropZones() {
    const zoneColor = [0xff0000, 0x00ff00, 0x0000ff];

    this.dropOffZones = [];
    this.dropInZones = [];

    for (let i = 0; i < ZONE_COORDINATES.length; i++) {
      const coords = ZONE_COORDINATES[i];

      // Drop-Off (Startlinie oben)
      this.dropOffZones.push({ x: coords.offX, y: coords.offY });

      // Sichtbare Drop-In-Zonen (unten)
      const graphics = this.add.graphics({
        fillStyle: { color: zoneColor[i], alpha: 0.2 },
      });
      graphics.fillRect(
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
    }
  }

  spawnRandomItem() {
    const itemIndex = Phaser.Math.Between(0, 2);
    const itemKey = ITEM_KEYS[itemIndex];

    const zoneIndex = Phaser.Math.Between(0, 2);
    const startX = this.dropOffZones[zoneIndex].x;
    const startY = this.dropOffZones[zoneIndex].y;

    const item = this.add.image(startX, startY, itemKey).setScale(0.1);
    item.setDepth(1);
    item.setInteractive();
    this.input.setDraggable(item);
    item.setData("key", itemKey);

    this.itemGroup.add(item);

    // Startet den Fall und speichert das Tween
    this.resumeItemFall(item, ZONE_COORDINATES[0].inY, true); // initialer Fall ist ziehbar
  }

  resumeItemFall(item, targetY, isDraggable = false) {
    // Deaktiviert das Ziehen nur, wenn es kein initialer Spawn ist
    if (!isDraggable) {
      this.input.setDraggable(item, false);
    }

    // Item fällt weiter nach unten
    const fallTween = this.tweens.add({
      targets: item,
      y: targetY,
      duration: ITEM_MOVE_DURATION,
      ease: "Linear",
      onComplete: (tween, targets) => {
        const obj = targets[0];

        // Wenn das Item schon zerstört wurde (z.B. durch Drop), nichts tun
        if (!obj || !obj.active) return;

        const itemKey = obj.getData("key");
        let isCorrect = false;

        // Prüfen, ob das Item in seiner richtigen Zielzone gelandet ist
        for (let i = 0; i < ZONE_COORDINATES.length; i++) {
          if (ITEM_KEYS[i] !== itemKey) continue;

          const coords = ZONE_COORDINATES[i];
          const zoneTop = coords.inY;
          const zoneBottom = coords.inY + ZONE_SIZE / 2;
          const zoneLeft = coords.inX - ZONE_SIZE / 2;
          const zoneRight = coords.inX + ZONE_SIZE / 2;

          if (
            obj.x >= zoneLeft &&
            obj.x <= zoneRight &&
            obj.y >= zoneTop &&
            obj.y <= zoneBottom
          ) {
            isCorrect = true;
            break;
          }
        }

        if (isCorrect) {
          // ✅ automatisch richtig in die eigene Kiste gefallen
          this.itemsDroppedCount++;
          this.updateScoreText();
          obj.setData("fallTween", null);
          obj.destroy();

          if (this.itemsDroppedCount >= TOTAL_ITEMS_REQUIRED) {
            alert("Spiel geschafft! Du hast 20 Items korrekt sortiert!");
            this.setLeverState(false);
          }
        } else {
          // ❌ ist unten angekommen, ohne richtig in der eigenen Kiste zu landen
          obj.setData("fallTween", null);
          obj.destroy();
          this.registerMistake();
        }
      },
    });

    // Speichert das Tween im Item für den Zugriff durch dragstart
    item.setData("fallTween", fallTween);
  }

  // Zentrale Fehlerbehandlung: erhöht Fehlerzähler, checkt auf Neustart
  registerMistake() {
    this.mistakesCount++;
    this.updateMistakeText();

    if (this.mistakesCount >= MAX_MISTAKES_ALLOWED) {
      alert(
        "Du hast 3 Fehler gemacht. Der Zähler wird zurückgesetzt und das Level startet neu."
      );
      this.setLeverState(false); // Hebel & Level komplett zurücksetzen
    }
  }

  handleItemDrop(pointer, gameObject, dropZone) {
    // Wenn das Item nicht auf einer Drop Zone gelandet ist, abbrechen
    if (!dropZone) return;

    const itemKey = gameObject.getData("key");
    const dropZoneKey = dropZone.getData("key");

    if (itemKey === dropZoneKey) {
      // ✅ Richtig sortiert per Drag & Drop
      this.itemsDroppedCount++;
      this.updateScoreText();
      gameObject.destroy();

      if (this.itemsDroppedCount >= TOTAL_ITEMS_REQUIRED) {
        alert("Spiel geschafft! Du hast 20 Items korrekt sortiert!");
        this.setLeverState(false); // Level sauber stoppen
      }
    } else {
      // ❌ Falsch in eine Kiste gelegt -> Fehler
      gameObject.destroy();
      this.registerMistake();
    }
  }

  handleDragEnd(pointer, gameObject, dropped) {
    // Wird aufgerufen, wenn das Item NICHT auf eine Drop-Zone gefallen ist
    if (dropped) return;

    // Prüfen, ob das Item nah genug an einer der drei Drop-Off-Linien liegt (Snap-Bereich)
    let snapped = false;

    for (const dropOff of this.dropOffZones) {
      if (Math.abs(gameObject.x - dropOff.x) < SNAP_LINE_TOLERANCE) {
        // Snap zur X-Koordinate der Drop-Off-Zone
        gameObject.x = dropOff.x;

        // Setze die Y-Koordinate auf die Start-Y zurück bzw. darunter
        gameObject.y = Math.max(gameObject.y, dropOff.y);

        // Starte den Fall neu (Item wird hier auf nicht-ziehbar gesetzt)
        this.resumeItemFall(gameObject, ZONE_COORDINATES[0].inY, false);

        snapped = true;
        break;
      }
    }

    if (!snapped) {
      // ❌ Spieler hat das Item irgendwo losgelassen -> Item verloren -> Fehler
      gameObject.destroy();
      this.registerMistake();
    }
  }

  updateScoreText() {
    if (this.scoreText) {
      this.scoreText.setText(
        `Sortierte Items: ${this.itemsDroppedCount}/${TOTAL_ITEMS_REQUIRED}`
      );
    }
  }

  updateMistakeText() {
    if (this.mistakeText) {
      this.mistakeText.setText(
        `Fehler: ${this.mistakesCount}/${MAX_MISTAKES_ALLOWED}`
      );
    }
  }

  stopLevel() {
    if (this.itemSpawnTimer) {
      this.itemSpawnTimer.remove(false);
      this.itemSpawnTimer = null;
    }

    // Stoppt alle Tweens der Items
    this.itemGroup.getChildren().forEach((item) => {
      this.tweens.killTweensOf(item);
    });

    this.itemGroup.clear(true, true);

    // Zähler zurücksetzen
    this.itemsDroppedCount = 0;
    this.mistakesCount = 0;
    this.updateScoreText();
    this.updateMistakeText();

    this.backgroundSprite.stop();
    this.backgroundSprite.setFrame(0);
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
