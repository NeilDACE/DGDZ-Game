class LevelScene extends Phaser.Scene {
  constructor() {
    super("GameScene"); // Szenen-Key
  }

  preload() {
    // Platzhalter-Grafiken (später durch eigene Assets ersetzen)
    this.load.image(
      "circle",
      "https://labs.phaser.io/assets/sprites/shinyball.png"
    );
    this.load.image(
      "square",
      "https://labs.phaser.io/assets/sprites/block.png"
    );
    this.load.image(
      "triangle",
      "https://labs.phaser.io/assets/sprites/arrow.png"
    );
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // --- Kategorien / Zonen ---
    this.categories = ["circle", "square", "triangle"];
    this.dropZones = {};
    const zoneWidth = w / 3;

    this.categories.forEach((cat, i) => {
      const zone = this.add
        .rectangle(
          zoneWidth * i + zoneWidth / 2,
          h - 100,
          zoneWidth - 20,
          150,
          0xffffff,
          0.1
        )
        .setStrokeStyle(2, 0xffffff, 0.3);

      this.dropZones[cat] = zone;
      zone.category = cat;

      this.add
        .text(zone.x, zone.y - 70, cat.toUpperCase(), {
          fontSize: "20px",
          color: "#fff",
        })
        .setOrigin(0.5);
    });

    // --- Chaos-Objekte ---
    this.objects = [];
    const types = ["circle", "square", "triangle"];

    for (let i = 0; i < 6; i++) {
      const type = Phaser.Utils.Array.GetRandom(types);
      const obj = this.add.sprite(
        Phaser.Math.Between(50, w - 50),
        Phaser.Math.Between(50, h / 2),
        type
      );

      obj.type = type;
      obj.setScale(0.7 + Math.random() * 0.4);

      this.enableDrag(obj);
      this.objects.push(obj);
    }

    // --- Status Text ---
    this.statusText = this.add.text(20, 20, "Bring Chaos in Ordnung!", {
      fontSize: "22px",
      color: "#fff",
    });
  }

  enableDrag(obj) {
    obj.setInteractive({ draggable: true });
    this.input.setDraggable(obj);

    obj.on("pointerover", () => obj.setTint(0xaaaaaa));
    obj.on("pointerout", () => obj.clearTint());

    obj.on("dragstart", () => {
      obj.setScale(obj.scale + 0.1);
      obj.setTint(0xffffaa);
    });

    obj.on("drag", (pointer, dragX, dragY) => {
      obj.x = dragX;
      obj.y = dragY;
    });

    obj.on("dragend", () => {
      obj.clearTint();
      obj.setScale(obj.scale - 0.1);

      const droppedZone = this.checkDropZone(obj);

      if (droppedZone) {
        if (droppedZone.category === obj.type) {
          // korrekt
          obj.setPosition(droppedZone.x, droppedZone.y);
          obj.disableInteractive();
          this.tweens.add({
            targets: obj,
            duration: 300,
            scale: obj.scale * 0.9,
            ease: "Cubic.easeOut",
          });
          this.updateStatus();
        } else {
          // falsch → wackeln
          this.tweens.add({
            targets: obj,
            x: obj.x + 10,
            y: obj.y,
            yoyo: true,
            repeat: 2,
            duration: 60,
          });
        }
      }
    });
  }

  checkDropZone(obj) {
    for (let c of this.categories) {
      const zone = this.dropZones[c];
      const bounds = zone.getBounds();

      if (bounds.contains(obj.x, obj.y)) {
        return zone;
      }
    }
    return null;
  }

  updateStatus() {
    const remaining = this.objects.filter(
      (o) => o.input && o.input.enabled
    ).length;

    if (remaining === 0) {
      this.statusText.setText("✨ Ordnung hergestellt! ✨");
      this.cameras.main.flash(400, 255, 255, 255);
      this.scene.start('level1scene'); // Nächste Szene starten
    } else {
      this.statusText.setText("Noch " + remaining + " Objekte...");
    }
  }
}
