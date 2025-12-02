class level1scene extends Phaser.Scene {
  constructor() {
    super({ key: "level1scene" });
    this.chaosCount = 4; // Anzahl der zu ordnenden Objekte
    this.orderAchieved = 0; // Zähler für bereits geordnete Objekte
  }

  preload() {
    // Lade alle Assets für das Level
    this.load.image("desk_bg", "assets/desk_bg.png");
    this.load.image("book", "assets/book.png");
    this.load.image("pencil", "assets/pencil.png");
    this.load.image("paper_stack", "assets/paper_stack.png");
    this.load.image("mug", "assets/mug.png");
    this.load.image("kosmos_symbol", "assets/kosmos_symbol.png");

    // Füge Platzhalter für die transparenten Zielmarkierungen hinzu (optional)
    // Wenn du keine separaten Bilder für die Ziele hast, kannst du die Originale als Alpha-Layer verwenden.
    this.load.image("book_target", "assets/book.png");
    this.load.image("pencil_target", "assets/pencil.png");
    this.load.image("paper_target", "assets/paper_stack.png");
    this.load.image("mug_target", "assets/mug.png");
  }

  create() {
    document.getElementById("side-left").style.display = "block";
    document.getElementById("side-right").style.display = "block";

    const { width, height } = this.sys.game.config;

    // 1. Hintergrund setzen
    this.setFullScreenBackground("desk_bg");

    this.add
      .text(width / 2, 20, "Level 1: Chaos am Schreibtisch", {
        fontSize: "28px",
        fill: "#FFD700",
      })
      .setOrigin(0.5);

    // 2. Kosmos Symbol (Ziel) verstecken
    this.kosmosSymbol = this.add
      .image(width / 2, height / 2, "kosmos_symbol")
      .setScale(0.1)
      .setVisible(false)
      .setDepth(10); // Symbol liegt über allen anderen Objekten

    // 3. Füge die geordneten Zielmarkierungen hinzu
    // Die Koordinaten müssen zu deinem Hintergrundbild passen!
    this.addTarget(280, 500, 0, "book_target");
    this.addTarget(200, 300, 0, "pencil_target");
    this.addTarget(400, 430, 0, "paper_target");
    this.addTarget(500, 420, 0, "mug_target");

    // 4. Füge die ziehbaren chaotischen Objekte hinzu (Startpositionen und Soll-Werte)
    this.createChaosDraggable("book", 300, 500, 60, 1.2, 280, 500, 0);
    this.createChaosDraggable("pencil", 200, 300, -30, 0.8, 200, 300, 0);
    this.createChaosDraggable("paper_stack", 400, 450, -15, 1.0, 400, 430, 0);
    this.createChaosDraggable("mug", 500, 400, 90, 0.9, 500, 420, 0);

    // 5. Feedback-Text
    this.feedbackText = this.add
      .text(
        width / 2,
        height - 30,
        `Ordnung: ${this.orderAchieved}/${this.chaosCount}`,
        {
          fontSize: "24px",
          fill: "#00FF00",
          backgroundColor: "#1E1E1E",
        }
      )
      .setOrigin(0.5)
      .setDepth(10);

    this.showMessage(
      "Bringe die Unordnung in Ordnung. Ziehe und klicke auf die chaotischen Objekte!",
      4000
    );
  }

  // ----------------------------------------------------------------------------------
  // HILFSFUNKTIONEN
  // ----------------------------------------------------------------------------------

  setFullScreenBackground(key) {
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;
    const background = this.add.image(gameWidth / 2, gameHeight / 2, key);
    background.setOrigin(0.5, 0.5);

    const scaleX = gameWidth / background.width;
    const scaleY = gameHeight / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);
  }

  showMessage(text, duration = 2000) {
    console.log("FEEDBACK: " + text);
    // Hier könntest du eine sichtbare Textbox-Implementierung einfügen, falls gewünscht.
  }

  addTarget(x, y, rotationDeg, key) {
    // Zeigt die Soll-Position und -Rotation leicht transparent an
    this.add
      .image(x, y, key)
      .setAlpha(0.2)
      .setScale(key.includes("pencil") ? 0.8 : 1.0) // Skalierung anpassen
      .setRotation(Phaser.Math.DegToRad(rotationDeg));
  }

  createChaosDraggable(
    key,
    startX,
    startY,
    startRot,
    scale,
    targetX,
    targetY,
    targetRot
  ) {
    const item = this.add
      .image(startX, startY, key)
      .setInteractive({ draggable: true }) // Objekt kann gezogen werden
      .setRotation(Phaser.Math.DegToRad(startRot))
      .setScale(scale)
      .setDepth(1); // Stellt sicher, dass das Objekt beim Ziehen sichtbar bleibt

    // Speichere die Soll-Positionen (Target Values) im Objekt selbst
    item.setData({
      targetX: targetX,
      targetY: targetY,
      targetRot: Phaser.Math.DegToRad(targetRot),
      isOrdered: false,
    });

    // Event: Ziehen des Objekts
    item.on("drag", (pointer, dragX, dragY) => {
      // Beim Ziehen nur die Position aktualisieren
      item.x = dragX;
      item.y = dragY;
    });

    // Event: Rotation beim Klick (Pointerdown)
    item.on("pointerdown", (pointer) => {
      if (
        !item.getData("isOrdered") &&
        pointer.downElement.tagName === "CANVAS"
      ) {
        // Der Klick soll NUR die Rotation ändern, NICHT die Position.
        // Wir müssen verhindern, dass dies ausgelöst wird, wenn der User beginnt zu ziehen.
        // Da die Rotation so konfiguriert ist, dass sie nur mit dem Klick ausgelöst wird,
        // ist das Problem oft, dass der Browser das Ziehen nicht von einem Klick unterscheidet.

        // LÖSUNG: Wir nutzen ein einfaches Flag für die Rotation
        if (pointer.primaryDown) {
          // Stellt sicher, dass es der linke Mausklick ist
          item.angle += 30; // Rotiere um 30 Grad pro Klick
          this.checkOrder(item);
        }
      }
    });

    // Event: Prüfen, wenn das Ziehen beendet wird (Drag End)
    item.on("dragend", () => {
      this.checkOrder(item);
    });

    // --- Zusätzlicher Trick zur Trennung von Klick und Drag ---
    // Du brauchst einen Abstandhalter (z.B. 10 Pixel), damit der Klick nicht sofort zum Drag wird.
    this.input.dragDistanceThreshold = 10;
  }

  checkOrder(item) {
    if (item.getData("isOrdered")) return;

    const tx = item.getData("targetX");
    const ty = item.getData("targetY");
    const tr = item.getData("targetRot");

    const POS_TOLERANCE = 35; // Toleranz für die Position in Pixeln
    const ROT_TOLERANCE = 0.3; // Toleranz für die Rotation in Radian (ca. 17 Grad)

    // 1. Position prüfen
    const posMatch =
      Math.abs(item.x - tx) < POS_TOLERANCE &&
      Math.abs(item.y - ty) < POS_TOLERANCE;

    // 2. Rotation prüfen
    const rotMatch = Math.abs(item.rotation - tr) < ROT_TOLERANCE;

    // Wenn beides korrekt ist, wurde Ordnung hergestellt
    if (posMatch && rotMatch) {
      this.achieveOrder(item);
    }
  }

  achieveOrder(item) {
    item.setData("isOrdered", true);
    item.disableInteractive(); // Objekt ist fixiert

    // Visuelles Feedback
    this.tweens.add({
      targets: item,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      onComplete: () => item.setAlpha(1),
    });

    this.orderAchieved++;
    this.feedbackText.setText(
      `Ordnung: ${this.orderAchieved}/${this.chaosCount}`
    );

    if (this.orderAchieved === this.chaosCount) {
      this.levelComplete();
    }
  }

  levelComplete() {
    this.showMessage(
      "Das Chaos ist gebannt! Das Symbol von Kosmos erscheint.",
      5000
    );

    // Das versteckte Symbol sichtbar machen
    this.kosmosSymbol.setVisible(true);

    this.kosmosSymbol.setInteractive();
    this.kosmosSymbol.once("pointerdown", () => {
      this.showMessage("Übergang zu Level 2...", 3000);
      // Hier würde der Übergang zur nächsten Szene erfolgen, z.B.:
      // this.scene.start('Level2_NewPuzzle');
    });
  }
}
