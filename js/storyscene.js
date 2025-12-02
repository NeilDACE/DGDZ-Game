class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  create() {
    
    document.getElementById("side-left").classList.toggle("hidden");
    document.getElementById("side-right").classList.toggle("hidden");

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    // Storytext (kannst du frei ändern, \n für neue Zeilen)
    this.fullText =
      "Die Geschichte der Zwei – Ursprung der Welt\n" +
      "Seit Anbeginn der Zeit existierten zwei Kräfte, älter als das Universum selbst:\n" +
      "Kosmos, der Gott der Ordnung, und Umbra, der Gott des Chaos.\n" +
      "Unsichtbar für die Menschheit wachten sie über die Welt, hielten Naturgesetze stabil, lenkten Zufall und Schicksal und sorgten dafür, dass Licht und Dunkelheit im Gleichgewicht blieben.\n" +
      "Jahrtausende lang war ihre Harmonie unerschütterlich. \n" +
      "Doch die Menschen veränderten alles.\n" +
      "Mit dem Aufstieg der modernen Zivilisation begannen sie, das Gleichgewicht zu stören:\n" +
      "Kriege, Umweltzerstörung, massenhafte Datenströme, unkontrollierte Technologien, manipulierte Informationen – all das verstärkte Umbra, den Gott des Chaos.\n" +
      "Sein Einfluss breitete sich in Schatten aus, zwischen Radiowellen, im Lärm der Städte, in den Ängsten der Menschen.\n" +
      "Je chaotischer die Welt wurde, desto schwächer wurde Kosmos.\n" +
      "Die Welt selbst – die echte Welt – geriet aus dem Gleichgewicht.\n" +
      "Eine Seele, die das Gleichgewicht wiederherstellen kann.\n\n" +
      "Du bist diese Seele.\n\n" +
      "Deine Aufgabe ist es, die chaotischen Elemente der Welt zu ordnen und das Gleichgewicht zwischen Kosmos und Umbra wiederherzustellen.\n" +
      "Die Zukunft der Welt liegt in deinen Händen.";

    // LEERES Textfeld (Startpunkt)
    this.storyText = this.add
      .text(width / 2, 50, "", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 80 }, // AUTOMATISCHER UMBRUCH
      })
      .setOrigin(0.5, 0);

    this.currentCharIndex = 0;
    this.typingSpeed = 30;
    this.isDone = false;

    // Schreibmaschinen Timer
    this.typeTimer = this.time.addEvent({
      delay: this.typingSpeed,
      callback: this.typeNextChar,
      callbackScope: this,
      loop: true,
    });

    // Scrollen mit Mausrad
    this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
      this.storyText.y -= dy * 0.4; // Scrollgeschwindigkeit
    });

    // Skip oder weiter
    this.input.on("pointerdown", () => this.handleSkipOrNext());
    this.input.keyboard.on("keydown-SPACE", () => this.handleSkipOrNext());
  }

  // Schreibmaschinen-Effekt
  typeNextChar() {
    if (this.currentCharIndex < this.fullText.length) {
      this.currentCharIndex++;
      this.storyText.setText(this.fullText.substring(0, this.currentCharIndex));
    } else {
      if (this.typeTimer) {
        this.typeTimer.remove(false);
        this.typeTimer = null;
      }

      if (!this.isDone) {
        this.isDone = true;
        this.showContinueHint();
      }
    }
  }

  showContinueHint() {
    const { width } = this.scale;

    this.continueText = this.add
      .text(
        width / 2,
        this.storyText.y + this.storyText.height + 40,
        "Weiter mit Klick oder Leertaste",
        {
          fontSize: "18px",
          color: "#aaaaaa",
        }
      )
      .setOrigin(0.5);
  }

  handleSkipOrNext() {
    if (!this.isDone) {
      // Schreibmaschine abbrechen → ganzen Text anzeigen
      if (this.typeTimer) {
        this.typeTimer.remove(false);
        this.typeTimer = null;
      }
      this.storyText.setText(this.fullText);
      this.isDone = true;
      this.showContinueHint();
      this.scene.start("level1scene");
    } else {
      // Weiter zur LevelScene
      this.scene.start("level1scene");
    }
  }
}
