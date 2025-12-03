// EgyptLevelScene.js (ohne Katze)
class EgyptLevelScene extends Phaser.Scene {
  constructor() {
    super("level2scene");
  }

  preload() {
    // Hintergrund / Wüste / Pyramiden
    this.load.image("egypt_bg", "assets/leveltwo/backgroundCanvas.png");

    // Bau-Zonen (Steinblöcke)
    this.load.image("zone_base", "assets/zone_base.png");
    this.load.image("zone_mid", "assets/zone_mid.png");
    this.load.image("zone_top", "assets/zone_top.png");

    // Wand-Zonen für Hieroglyphen
    this.load.image("zone_wall_left", "assets/zone_wall_left.png");
    this.load.image("zone_wall_right", "assets/zone_wall_right.png");

    // Steinblöcke
    this.load.image("block_base", "assets/block_base.png");
    this.load.image("block_mid", "assets/block_mid.png");
    this.load.image("block_top", "assets/block_top.png");

    // Hieroglyphen-Tafeln
    this.load.image("glyph_sun", "assets/glyph_sun.png");
    this.load.image("glyph_bird", "assets/glyph_bird.png");
    this.load.image("glyph_ankh", "assets/glyph_ankh.png");

    // Sandsturm (Overlay)
    this.load.image("sand_overlay", "assets/sand_overlay.png");
  }

  create() {
    // Hintergrund
    this.add.image(400, 300, "egypt_bg").setDepth(0);

    // Sandsturm-Overlay
    this.sandOverlay = this.add
      .image(400, 300, "sand_overlay")
      .setDepth(10)
      .setAlpha(0);

    // Bau-Zonen für Pyramide
    this.zones = [];
    this.zones.push(
      this.createZone(250, 420, "zone_base", "block_base", "Fundament")
    );
    this.zones.push(
      this.createZone(400, 330, "zone_mid", "block_mid", "Mitte")
    );
    this.zones.push(
      this.createZone(550, 250, "zone_top", "block_top", "Spitze")
    );

    // Wand-Zonen
    this.zones.push(
      this.createZone(100, 220, "zone_wall_left", "wall_left", "Grabwand L")
    );
    this.zones.push(
      this.createZone(700, 220, "zone_wall_right", "wall_right", "Grabwand R")
    );

    // Items erstellen
    this.items = [];
    this.createBlocks();
    this.createGlyphs();

    // Drag & Drop
    this.input.setDraggable(this.items);

    this.input.on("dragstart", (pointer, item) => {
      if (!item.placed) item.setDepth(5);
    });

    this.input.on("drag", (p, item, dragX, dragY) => {
      if (!item.placed) {
        item.x = dragX;
        item.y = dragY;
      }
    });

    this.input.on("dragend", (p, item) => {
      if (!item.placed) this.handleDrop(item);
    });

    // Sandsturm-Event
    this.time.addEvent({
      delay: 7000,
      callback: this.sandStorm,
      callbackScope: this,
      loop: true,
    });

    // Fortschritt
    this.correctCount = 0;
    this.correctText = this.add
      .text(400, 20, "Korrekt platziert: 0", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(20);
  }

  // Zonen erstellen
  createZone(x, y, textureKey, expectedType, label) {
    const zone = this.add.sprite(x, y, textureKey).setDepth(1);
    zone.expectedType = expectedType;

    this.add
      .text(x, y + zone.height / 2 + 12, label, {
        fontSize: "14px",
        color: "#ffffcc",
      })
      .setOrigin(0.5)
      .setDepth(2);

    return zone;
  }

  // Steinblöcke erstellen
  createBlocks() {
    const blockDefinitions = [
      { key: "block_base", type: "block_base" },
      { key: "block_mid", type: "block_mid" },
      { key: "block_top", type: "block_top" },
    ];

    blockDefinitions.forEach((def) => {
      const x = Phaser.Math.Between(250, 550);
      const y = Phaser.Math.Between(480, 560);
      const sprite = this.add.sprite(x, y, def.key).setDepth(3);

      sprite.itemType = def.type;
      sprite.startX = x;
      sprite.startY = y;
      sprite.placed = false;

      this.items.push(sprite);
    });
  }

  // Hieroglyphen erstellen
  createGlyphs() {
    const glyphDefinitions = [
      { key: "glyph_sun", type: "wall_left" },
      { key: "glyph_bird", type: "wall_left" },
      { key: "glyph_ankh", type: "wall_right" },
    ];

    glyphDefinitions.forEach((def) => {
      const x = Phaser.Math.Between(250, 550);
      const y = Phaser.Math.Between(120, 220);
      const sprite = this.add.sprite(x, y, def.key).setDepth(3);

      sprite.itemType = def.type;
      sprite.startX = x;
      sprite.startY = y;
      sprite.placed = false;

      this.items.push(sprite);
    });
  }

  // Drop-Logik
  handleDrop(item) {
    const itemBounds = item.getBounds();
    let placedCorrect = false;

    for (let zone of this.zones) {
      const zoneBounds = zone.getBounds();

      if (Phaser.Geom.Intersects.RectangleToRectangle(itemBounds, zoneBounds)) {
        if (zone.expectedType === item.itemType) {
          placedCorrect = true;
          item.placed = true;

          this.snapToZone(item, zone);

          this.tweens.add({
            targets: item,
            scale: 1.1,
            duration: 120,
            yoyo: true,
          });

          this.correctCount++;
          this.correctText.setText("Korrekt platziert: " + this.correctCount);
        }
      }
    }

    if (!placedCorrect) {
      this.tweens.add({
        targets: item,
        x: item.startX,
        y: item.startY,
        duration: 200,
        onComplete: () => item.setDepth(3),
      });
    } else {
      item.setDepth(2);
    }
  }

  snapToZone(item, zone) {
    const areaWidth = zone.width * 0.5;
    const areaHeight = zone.height * 0.5;

    const offsetX = Phaser.Math.Between(-areaWidth / 2, areaWidth / 2);
    const offsetY = Phaser.Math.Between(-areaHeight / 2, areaHeight / 2);

    item.x = zone.x + offsetX;
    item.y = zone.y + offsetY;
  }

  // Sandsturm
  sandStorm() {
    // Overlay
    this.tweens.add({
      targets: this.sandOverlay,
      alpha: 0.7,
      duration: 200,
      yoyo: true,
      hold: 400,
    });

    // leichtes Verschieben
    this.items.forEach((item) => {
      if (!item.placed) {
        this.tweens.add({
          targets: item,
          x: item.x + Phaser.Math.Between(-10, 10),
          y: item.y + Phaser.Math.Between(-5, 5),
          duration: 300,
        });
      }
    });
  }
}
