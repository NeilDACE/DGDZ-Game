class level2scene extends Phaser.Scene {
  constructor() {
    super("level2scene");
  }

  preload() {
    // Background mit schwarzen Löchern
    this.load.image(
      "egypt_bg_puzzle",
      "assets/leveltwo/backgroundCanvasfinish.png"
    );

    // WICHTIG: diese Keys müssen exakt zu deinen Dateien passen!
    this.load.image("piece_nose", "assets/leveltwo/nase.png");
    this.load.image("piece_door", "assets/leveltwo/saeule.png");
    this.load.image("piece_crown", "assets/leveltwo/pflanze.png");
    this.load.image("piece_stone", "assets/leveltwo/stone.png");
    this.load.image("piece_obelisk", "assets/leveltwo/obeliskSpitze.png");
    this.load.image("piece_symbol", "assets/leveltwo/symbol.png");
    this.load.image("piece_camel", "assets/leveltwo/camel.png");
    this.load.image("piece_mensch", "assets/leveltwo/mensch.png");
    // optional: Sand-Overlay
    this.load.image("sand_overlay", "assets/sand_overlay.png");
  }

  create() {
    document.getElementById("bodyId").classList.toggle("level2-background");
    document
      .getElementById("game-container")
      .classList.toggle("level2-game-container");
    // === Hintergrund ===
    const bg = this.add.image(500, 300, "egypt_bg_puzzle").setDepth(0);

    let scale = Math.max(
      this.cameras.main.width / bg.width,
      this.cameras.main.height / bg.height
    );
    bg.setScale(scale);

    // === Sandsturm-Overlay (optional) ===
    this.sandOverlay = this.add
      .image(500, 300, "sand_overlay")
      .setDepth(20)
      .setAlpha(0);

    // === Zielpositionen der Teile (x/y musst du ggf. anpassen) ===
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
        id: "mensch",
        x: 380,
        y: 360,
        radius: 50,
        offsetX: 0,
        offsetY: 0,
        targetScale: 0.05,
      },
    ];

    // === Puzzle-Teile ===
    this.pieces = [];

    // z.B. alle auf 0.5 verkleinern
    this.createPiece("nose", "piece_nose", 150, 520, 0.5);
    this.createPiece("door", "piece_door", 400, 520, 0.5);
    this.createPiece("crown", "piece_crown", 750, 400, 0.5);
    this.createPiece("stone", "piece_stone", 650, 350, 0.5);
    this.createPiece("obelisk", "piece_obelisk", 900, 520, 0.5);
    this.createPiece("symbol", "piece_symbol", 600, 200, 0.5);
    this.createPiece("camel", "piece_camel", 500, 100, 0.1);
    this.createPiece("mensch", "piece_mensch", 600, 100, 0.05);

    // WICHTIG: KEIN this.input.setDraggable(this.pieces); hier!
    // Das machen wir direkt in createPiece() für jedes Sprite.

    // Drag-Events
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
      this.tryPlacePiece(piece);
    });

    this.infoText = this.add
      .text(500, 40, "Level 2: Setze die fehlenden Teile ein", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.completed = false;
  }

  // --------- EIN TEIL ERSTELLEN ---------
  createPiece(id, textureKey, startX, startY, scale = 1) {
    const sprite = this.add.sprite(startX, startY, textureKey).setDepth(5);

    if (!sprite) {
      console.warn("Sprite konnte nicht erstellt werden für", textureKey);
      return;
    }

    sprite.pieceId = id;
    sprite.startX = startX;
    sprite.startY = startY;
    sprite.placed = false;

    sprite.baseScale = scale;
    sprite.setScale(scale); // <<< Größe setzen

    sprite.setInteractive({ cursor: "pointer" });
    this.input.setDraggable(sprite);

    this.pieces.push(sprite);
    return sprite;
  }

  // --------- PLATZIER-LOGIK ---------
  tryPlacePiece(piece) {
    const target = this.targets.find((t) => t.id === piece.pieceId);
    if (!target) return;

    const dist = Phaser.Math.Distance.Between(
      piece.x,
      piece.y,
      target.x,
      target.y
    );

    const snapTolerance = target.radius; // oder * 1.2, wenn es leichter sein soll

    if (dist <= snapTolerance) {
      // Feinkorrektur beim Einrasten
      const ox = target.offsetX || 0;
      const oy = target.offsetY || 0;

      piece.x = target.x + ox;
      piece.y = target.y + oy;
      piece.placed = true;
      piece.setDepth(2);

      const finalScale = target.targetScale || piece.baseScale;
      piece.baseScale = finalScale; // für spätere Tweens
      piece.setScale(finalScale);

      this.tweens.add({
        targets: piece,
        scale: finalScale * 1.1,
        duration: 120,
        yoyo: true,
      });

      this.checkCompleted();
    } else {
      // zurück
      this.tweens.add({
        targets: piece,
        x: piece.startX,
        y: piece.startY,
        scale: piece.baseScale,
        duration: 200,
        onComplete: () => piece.setDepth(5),
      });
    }
    this.scene.start("level3scene");
  }
}
