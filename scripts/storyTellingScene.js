/**
 * Scene for displaying the narrative storyline with a typing effect.
 * It introduces the game's theme of Order (Kosmos) versus Chaos (Umbra).
 */
class StoryTellingScene extends Phaser.Scene {
  /**
   * @type {Phaser.GameObjects.Text}
   */
  storyText;
  /**
   * @type {Phaser.Time.TimerEvent | null}
   */
  typeTimer = null;
  /**
   * @type {number}
   */
  currentCharIndex = 0;
  /**
   * @type {number}
   */
  typingSpeed = 30;
  /**
   * @type {boolean}
   */
  isDone = false;
  /**
   * @type {string}
   */
  fullText = "";
  /**
   * @type {Phaser.Sound.BaseSound | null}
   */
  music = null; // Stored reference for the music object

  constructor() {
    super("storyTellingScene");
  }

  /**
   * Loads necessary assets, including background music.
   */
  preload() {
    this.load.audio(
      "bg_1_music",
      "assets/audio/story-telling-background-sound.mp3"
    );
  }

  /**
   * Sets up the scene, including background, story text, and typing effect.
   */
  create() {
    document.getElementById("side-left").classList.toggle("hidden");
    document.getElementById("side-right").classList.toggle("hidden");

    this.music = this.sound.add("bg_1_music", {
      volume: 0.5,
      loop: false,
    });

    this.music.play();

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

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

    this.storyText = this.add
      .text(width / 2, 50, "", {
        fontSize: "22px",
        fontFamily: "Arial",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5, 0);

    this.typeTimer = this.time.addEvent({
      delay: this.typingSpeed,
      callback: this._typeNextChar,
      callbackScope: this,
      loop: true,
    });

    this.input.on("wheel", (pointer, gameObjects, dx, dy) => {
      this.storyText.y -= dy * 0.4;
    });

    this.input.on("pointerdown", () => this._handleSkipOrNext());
    this.input.keyboard.on("keydown-SPACE", () => this._handleSkipOrNext());
  }

  // ----------------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // ----------------------------------------------------------------------------------

  /**
   * Implements the typewriter effect by revealing one character at a time.
   */
  _typeNextChar() {
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
        this._showContinueHint();
      }
    }
  }

  /**
   * Displays the hint text to continue to the next scene.
   */
  _showContinueHint() {
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

  /**
   * Handles user input (click/space) to skip the typing or proceed to the next level.
   */
  _handleSkipOrNext() {
    if (!this.isDone) {
      if (this.typeTimer) {
        this.typeTimer.remove(false);
        this.typeTimer = null;
      }
      this.storyText.setText(this.fullText);
      this.isDone = true;
      this._showContinueHint();
    } else {
      if (this.music) {
        this.music.stop(); // Stop music before changing scene
      }
      this.scene.start("levelOneScene");
    }
  }
}
