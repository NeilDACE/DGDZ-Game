/**
 * Hauptszene für Level 1: Ordnen der Planeten.
 * Die Planeten müssen in die korrekte Reihenfolge und Position gezogen werden.
 */
class level1scene extends Phaser.Scene {
  constructor() {
    super({ key: "level1scene" }); // --- Spielzustand ---

    this.chaosCount = 8; // Gesamtzahl der Planeten.
    this.orderAchieved = 0; // Zähler für korrekt platzierte Planeten. // --- Daten --- // Liste der Planeten in der korrekten Zielreihenfolge (links nach rechts).

    this.planets = [
      "merkur",
      "venus",
      "erde",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptun",
    ]; // --- Konstanten für Anordnung und Skalierung ---

    this.PLANET_SCALE = 0.08;
    this.TARGET_Y = 300; // Feste Y-Koordinate der Ziellinie.
    this.TARGET_X_START = 300; // Start-X-Koordinate der Ziellinie.
    this.TARGET_X_SPACING = 85; // Horizontaler Abstand zwischen den Zielen.
  }
  /**
   * Lädt alle benötigten Assets (Bilder, Sounds etc.)
   */

  preload() {
    // Hintergrundbild laden
    this.load.image("desk_bg", "assets/levelOne/levelOneBackground.png"); // Alle Planetenbilder laden
    this.load.image("merkur", "Assets/levelOne/Merkur.png");
    this.load.image("venus", "Assets/levelOne/Venus.png");
    this.load.image("erde", "Assets/levelOne/Erde.png");
    this.load.image("mars", "Assets/levelOne/Mars.png");
    this.load.image("jupiter", "Assets/levelOne/Jupiter.png");
    this.load.image("saturn", "Assets/levelOne/Saturn.png");
    this.load.image("uranus", "Assets/levelOne/Uranus.png");
    this.load.image("neptun", "Assets/levelOne/Neptun.png");
  }
  /**
   * Erstellt die Spielobjekte und legt das Level an
   */

  create() {
    document.getElementById("bodyId").classList.toggle("level1-background");
    document.getElementById("game-container").classList.toggle("level1-game-container");
    
    
    const { width, height } = this.sys.game.config; // Hintergrundbild setzen und skalieren

    this.setFullScreenBackground("desk_bg");

    this.add
      .text(width / 2, 20, "Level 1: Ordne die Planeten", {
        fontSize: "28px",
        fill: "#FFD700",
      })
      .setOrigin(0.5); // Bereich, in dem die Planeten chaotisch starten

    const chaoticAreaY = 150;
    const chaoticAreaHeight = 250; // Schleife zur Erstellung aller Ziele und Planeten
    for (let i = 0; i < this.planets.length; i++) {
      const planetKey = this.planets[i]; // Berechnung der Zielposition
      const targetX = this.TARGET_X_START + i * this.TARGET_X_SPACING;
      const targetY = this.TARGET_Y; // Zielmarkierung als schwacher, weißer Kreis hinzufügen
      this.addTarget(targetX, targetY, this.PLANET_SCALE); // Zufällige Startposition im chaotischen Bereich
      const startX = Phaser.Math.Between(50, width - 50);
      const startY = Phaser.Math.Between(
        chaoticAreaY,
        chaoticAreaY + chaoticAreaHeight
      ); // Ziehbares Planetenobjekt erstellen
      this.createChaosDraggable(
        planetKey,
        startX,
        startY,
        this.PLANET_SCALE,
        targetX,
        targetY
      );
    } // Feedback-Text (Ordnungsstatus) am unteren Rand
    this.feedbackText = this.add
      .text(
        width / 2,
        height - 30,
        `Ordnung: ${this.orderAchieved}/${this.chaosCount}`,
        {
          fontSize: "24px",
          fill: "#FFD700",
        }
      )
      .setOrigin(0.5)
      .setDepth(10); // Kurze Startnachricht anzeigen

    this.showMessage(
      "Bringe die Planeten in ihre korrekte\nReihenfolge und ziehe sie auf die Ziellinie!",
      4000
    );
  } // ---------------------------------------------------------------------------------- // HILFSFUNKTIONEN // ----------------------------------------------------------------------------------
  /**
   * Skaliert ein Bild, um den gesamten Bildschirm auszufüllen (Hintergrund).
   * @param {string} key - Der Asset-Key des Hintergrundbildes.
   */

  setFullScreenBackground(key) {
    const { width: gameWidth, height: gameHeight } = this.sys.game.config;
    const background = this.add.image(gameWidth / 2, gameHeight / 2, key);
    background.setOrigin(0.5);

    const scaleX = gameWidth / background.width;
    const scaleY = gameHeight / background.height;
    const scale = Math.max(scaleX, scaleY);
    background.setScale(scale);
  }
  /**
   * Zeigt eine Debug-Nachricht in der Konsole an.
   * @param {string} text - Die anzuzeigende Nachricht.
   * @param {number} [duration=2000] - Dauer der Nachricht (wird hier ignoriert).
   */

  showMessage(text, duration = 2000) {
    console.log("FEEDBACK: " + text);

    const { width, height } = this.sys.game.config; // 1. Erstelle das Text-Objekt (zentral positioniert)

    const message = this.add
      .text(
        width / 2,
        height / 4, // Mittig im Bild
        text,
        {
          fontSize: "24px",
          fill: "#FFD700",
          align: "center",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: 10,
        }
      )
      .setOrigin(0.5)
      .setDepth(100); // Stelle sicher, dass es über allem anderen liegt // 2. Erstelle ein Tween (Animation), um es nach der Dauer auszublenden

    this.tweens.add({
      targets: message,
      alpha: 0, // Transparenz auf 0 (unsichtbar)
      ease: "Power1",
      duration: 500, // Ausblende-Animation (0.5 Sekunden)
      delay: duration, // Wartezeit, bevor die Ausblende-Animation startet
      onComplete: () => {
        message.destroy(); // Objekt nach der Animation löschen
      },
    });
  }
  /**
   * Zeichnet die Zielmarkierung als schwachen, weißen Kreis.
   * @param {number} x - X-Koordinate des Kreismittelpunkts.
   * @param {number} y - Y-Koordinate des Kreismittelpunkts.
   * @param {number} scale - Skalierungsfaktor zur Berechnung des Radius.
   */

  addTarget(x, y, scale) {
    const baseRadius = 150; // Basisradius des Kreises
    const radius = baseRadius * scale;
    const graphics = this.add.graphics({ x: x, y: y });

    graphics.fillStyle(0xffffff, 0.15); // Weiß mit 15% Deckkraft
    graphics.fillCircle(0, 0, radius); // Kreis zeichnen

    return graphics;
  }
  /**
   * Erstellt ein ziehbares Planetenobjekt und richtet Drag-Events ein.
   */

  createChaosDraggable(key, startX, startY, scale, targetX, targetY) {
    const item = this.add
      .image(startX, startY, key)
      .setInteractive({ draggable: true })
      .setScale(scale)
      .setDepth(1); // Speichern der Soll-Positionen und Status

    item.setData({
      targetX: targetX,
      targetY: targetY,
      isOrdered: false,
    }); // Event-Listener für das Ziehen

    item.on("drag", (pointer, dragX, dragY) => {
      item.x = dragX;
      item.y = dragY;
    }); // Event-Listener für das Ende des Ziehens

    item.on("dragend", () => {
      this.checkOrder(item);
    });

    this.input.dragDistanceThreshold = 10;
  }
  /**
   * Prüft, ob ein Objekt auf der korrekten Zielposition losgelassen wurde.
   * @param {Phaser.GameObjects.Image} item - Das fallengelassene Planetenobjekt.
   */

  checkOrder(item) {
    if (item.getData("isOrdered")) return; // Wenn bereits geordnet, nichts tun

    const tx = item.getData("targetX");
    const ty = item.getData("targetY");
    const POS_TOLERANCE = 35; // Toleranz in Pixeln. // Prüfen, ob die aktuelle Position innerhalb der Toleranz der Zielposition liegt

    const posMatch =
      Math.abs(item.x - tx) < POS_TOLERANCE &&
      Math.abs(item.y - ty) < POS_TOLERANCE;

    if (posMatch) {
      this.achieveOrder(item); // Ordnung herstellen
    }
  }
  /**
   * Setzt ein Objekt in den geordneten Zustand (eingerastet).
   * @param {Phaser.GameObjects.Image} item - Das Planetenobjekt.
   */

  achieveOrder(item) {
    item.setData("isOrdered", true);
    item.disableInteractive(); // Objekt kann nicht mehr gezogen werden // Optischer "Snap" auf die exakte Zielposition

    item.x = item.getData("targetX");
    item.y = item.getData("targetY"); // Kurze Animation zur visuellen Bestätigung

    this.tweens.add({
      targets: item,
      alpha: 0.5,
      duration: 200,
      yoyo: true,
      onComplete: () => item.setAlpha(1),
    }); // Status aktualisieren

    this.orderAchieved++;
    this.feedbackText.setText(
      `Ordnung: ${this.orderAchieved}/${this.chaosCount}`
    ); // Prüfen, ob das Level abgeschlossen ist

    if (this.orderAchieved === this.chaosCount) {
      this.levelComplete();
    }
  }
  /**
   * Wird aufgerufen, wenn alle Planeten korrekt platziert wurden.
   */

  levelComplete() {
    this.showMessage(
      "Das Chaos ist gebannt!\nDu hast die Planeten erfolgreich in\ndie richtige Umlaufbahn gebracht.",
      5000
    );
    this.scene.start("level2scene");
  }
}
