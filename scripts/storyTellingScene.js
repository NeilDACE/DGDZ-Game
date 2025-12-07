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
  typingSpeed = 70;
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
    document.getElementById("gameMenuFooter").classList.toggle("hidden");
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
      "Zu Beginn aller Zeit existierten nur zwei Kräfte:\n" +
      "Ordnung, das Licht, das verbindet – und Chaos, der Schatten, der trennt.\n" +
      "Aus dem ewigen Tanz dieser Gegensätze entstand der Kosmos.\n" +
      "Ordnung formte Sterne, Welten und Gesetzmäßigkeiten.\n" +
      "Chaos zerschmetterte sie wieder, um Raum für Neues zu schaffen. \n" +
      "So hielten beide Mächte das Gleichgewicht… bis eine Welt erschien, die alles veränderte:\n\n" +
      "Die Erde.\n\n" +
      "Ordnung sah in ihr das Potenzial für Harmonie, ein Ort, an dem Leben gedeihen und eine Balance zwischen Wandel und Stabilität entstehen konnte.\n\n" +
      "Chaos hingegen sah eine Gelegenheit, sein Reich auszudehnen.\n" +
      "Er schuf eine eigene Manifestation: Umbra, den Schatten, der sich in jede Epoche, jedes Volk und jede Maschine schleichen konnte.\n" +
      "Umbra nährte sich von Fehlern, Konflikten und falschen Entscheidungen – und je weiter die Menschheit wuchs, desto stärker wurde Umbra.\n\n" +
      "Um die Erde zu schützen, rief Ordnung einen Helfer jenseits von Zeit und Raum:\n\n" +
      "den Auserwählten – dich.\n\n" +
      "Nur du kannst durch die Zeitalter reisen, Herausforderungen meistern und die Balance immer wieder zurückholen, bevor Umbra sie endgültig zerstören kann.\n";

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
      this.cameras.main.fadeOut(1000, 0, 0, 0); // 1000ms, R=0, G=0, B=0 (Schwarz)

      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        (cam, effect) => {
          // Wenn der Fade-Out abgeschlossen ist, zur nächsten Szene wechseln
          this.scene.start("levelOneScene");
        }
      );
    }
  }
}
