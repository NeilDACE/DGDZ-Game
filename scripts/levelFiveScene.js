class LevelFiveScene extends Phaser.Scene {
  constructor() {
    super("LevelFiveScene");
    this.levelCompleted = false;
  }

  preload() {
    this.load.image("bg", "assets/level-five/backgroundCanvas.png");

    // Load Background Music
    this.load.audio(
      "bg_6_music",
      "assets/audio/level-five-background-sound.mp3"
    );

    // 🔊 Success-/Intro-Sound für Level 5
    // Pfad ggf. anpassen, z.B. dialog5.mp3 oder eine andere Datei
    this.load.audio("success_sound_five", "assets/audio/dialog5.mp3");
  }

  create() {
    // HTML-Klassen für dieses Level setzen
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.setupHtmlClasses();
    this._startBackgroundMusic();

    const width = this.game.config.width;
    const height = this.game.config.height;

    // Hintergrundbild
    const bg = this.add.image(0, 0, "bg").setOrigin(0);
    bg.setDisplaySize(width, height);

    // Raster-Einstellungen: 6x6
    this.cols = 6;
    this.rows = 6;
    this.tileSize = 56; // etwas kleiner, damit alles gut reinpasst

    // Schwierigkeitsgrad: wie viele "virtuelle Klicks" wir machen
    this.mixClicks = 4;

    // Raster zentrieren
    this.offsetX = (width - this.cols * this.tileSize) / 2;
    this.offsetY = (height - this.rows * this.tileSize) / 2 + 20;

    // Farben für Glow-Design
    this.colorOnFill = 0x00aaff; // leuchtendes Blau
    this.colorOnStroke = 0x66ccff; // heller Rand
    this.colorOffFill = 0x002233; // dunkles Blau
    this.colorOffStroke = 0x444444; // dezenter Rand

    this.tiles = [];
    this.levelCompleted = false;

    // Titel
    this.add
      .text(width / 2, 30, "Level 5: Quanten-KI-Computer", {
        fontSize: "26px",
        color: "#00ffe0",
        fontFamily: "Macondo",
      })
      .setOrigin(0.5);

    // Info
    this.add
      .text(
        width / 2,
        60,
        "Ziel: Alle Felder AN, um den Computer einzuschalten.",
        { fontSize: "16px", fontFamily: "Macondo", color: "#ccccff" }
      )
      .setOrigin(0.5);

    // Gewinn-Text
    this.winText = this.add
      .text(width / 2, height - 30, "", {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        fontFamily: "Macondo",
      })
      .setOrigin(0.5);

    // Raster erzeugen
    for (let y = 0; y < this.rows; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.cols; x++) {
        // Erstmal mit OFF-Werten erstellen
        const rect = this.add
          .rectangle(
            this.offsetX + x * this.tileSize + this.tileSize / 2,
            this.offsetY + y * this.tileSize + this.tileSize / 2,
            this.tileSize - 4,
            this.tileSize - 4,
            this.colorOffFill
          )
          .setStrokeStyle(2, this.colorOffStroke)
          .setInteractive({ useHandCursor: true });

        rect.isOn = false;
        rect.gridX = x;
        rect.gridY = y;

        rect.on("pointerdown", () => {
          this.handleClick(rect.gridX, rect.gridY);
        });

        this.tiles[y][x] = rect;
      }
    }

    // Startzustand erzeugen (vereinfachte Variante)
    this.randomizeGrid();
  }

  _startBackgroundMusic() {
    this.music = this.sound.add("bg_6_music", {
      volume: 0.4,
      loop: true,
    });
    this.music.play();

    // 🔊 Intro-/Success-Sound direkt beim Start des Levels
    this.startSuccessSound();
  }

  startSuccessSound() {
    const successSound = this.sound.add("success_sound_five", {
      volume: 0.7,
      loop: false,
    });
    successSound.play();
  }

  // Kachel explizit setzen: hier machen wir das Glow-Design
  setTileState(x, y, isOn) {
    const tile = this.tiles[y][x];
    tile.isOn = isOn;

    if (isOn) {
      // ON: blau leuchtend, dicker heller Rand
      tile.setFillStyle(this.colorOnFill);
      tile.setStrokeStyle(4, this.colorOnStroke);
    } else {
      // OFF: dunkel, dezenter Rand
      tile.setFillStyle(this.colorOffFill);
      tile.setStrokeStyle(2, this.colorOffStroke);
    }
  }

  // Kachel umschalten (mit Bounds-Check)
  toggleTile(x, y) {
    if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return;
    const tile = this.tiles[y][x];
    this.setTileState(x, y, !tile.isOn);
  }

  // Ein kompletter Zug (Feld + Nachbarn)
  _applyMove(x, y) {
    this.toggleTile(x, y);
    this.toggleTile(x - 1, y);
    this.toggleTile(x + 1, y);
    this.toggleTile(x, y - 1);
    this.toggleTile(x, y + 1);
  }

  handleClick(x, y) {
    // Wenn Level schon abgeschlossen, keine weiteren Klicks verarbeiten
    if (this.levelCompleted) return;

    // Lights-Out-Regel anwenden
    this._applyMove(x, y);

    // Gewinn prüfen
    if (this.checkWin()) {
      this.levelCompleted = true;

      // Alle Tiles deaktivieren, damit nix mehr geklickt werden kann
      for (let row of this.tiles) {
        for (let tile of row) {
          tile.disableInteractive();
        }
      }

      this.winText.setText(
        "Super! Du hast den Quanten-KI-Computer aktiviert.\nKlicke irgendwo, um zum nächsten Level zu gehen."
      );

      // Kleines Delay, damit der aktuelle Klick NICHT den Szenenwechsel auslöst
      this.time.delayedCall(200, () => {
        this.input.once("pointerdown", () => {
          if (this.music) {
            this.music.stop();
          }
          // Nächste Szene starten (Namen anpassen, falls anders)
          this.cameras.main.fadeOut(1000, 0, 0, 0); // 1000ms, R=0, G=0, B=0 (Schwarz)
          this.cameras.main.once(
            Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            (cam, effect) => {
              // Wenn der Fade-Out abgeschlossen ist, zur nächsten Szene wechseln
              this.scene.start("StoryOutroScene");
            }
          );
        });
      });
    }
  }

  // Startzustand:
  // 1. Alle Felder AN
  // 2. 'mixClicks' echte Züge simulieren
  randomizeGrid() {
    // Erst alles AN setzen
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.setTileState(x, y, true);
      }
    }

    // Jetzt einige echte Klicks simulieren
    for (let i = 0; i < this.mixClicks; i++) {
      const rx = Phaser.Math.Between(0, this.cols - 1);
      const ry = Phaser.Math.Between(0, this.rows - 1);
      this._applyMove(rx, ry);
    }

    this.winText.setText("");
    this.levelCompleted = false;

    // Sicherstellen, dass Tiles wieder klickbar sind, falls resetLevel mal genutzt wird
    for (let row of this.tiles) {
      for (let tile of row) {
        tile.setInteractive({ useHandCursor: true });
      }
    }
  }

  // HTML-Klassen für dieses Level setzen/entfernen
  setupHtmlClasses() {
    document.getElementById("bodyId").classList.toggle("level5-background");
    document
      .getElementById("game-container")
      .classList.toggle("level5-game-container");
  }

  // Ziel: ALLE Felder AN
  checkWin() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.tiles[y][x].isOn) {
          return false;
        }
      }
    }
    return true;
  }

  resetLevel() {
    this.randomizeGrid();
  }
}
