/**
 * Scene for displaying the narrative storyline with a typing effect.
 * It introduces the game's theme of Order (Kosmos) versus Chaos (Umbra).
 */
class StoryOutroScene extends Phaser.Scene {
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
    super("StoryOutroScene");
  }

  /**
   * Loads necessary assets, including background music.
   */
  preload() {
    this.load.audio("bg_outro_music", "assets/story-outro/outro.mp3");
  }

  /**
   * Sets up the scene, including background, story text, and typing effect.
   */
  create() {
    document.getElementById("side-left").classList.toggle("hidden");
    document.getElementById("side-right").classList.toggle("hidden");
    this.setupHtmlClasses();

    this.music = this.sound.add("bg_outro_music", {
      volume: 0.5,
      loop: false,
    });

    this.music.play();

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    this.fullText =
      "Auserwählter… du hast es geschafft.\n" +
      "Der Computer ist erwacht, die Welt kehrt ins Gleichgewicht zurück.\n" +
      "Durch alle Zeitalter hindurch hast du dich dem Chaos gestellt – von den ersten Planeten des Sonnensystems bis zur modernen Welt, in der Wissen und Technologie die Zukunft formen.\n" +
      "Du hast gezeigt, dass Ordnung nicht bedeutet, alles unverändert zu lassen…\n" +
      "sondern die Kraft, aus jedem Chaos etwas Neues entstehen zu lassen.\n \n" +
      "Umbra wurde geschwächt – doch nicht vernichtet.\n" +
      "Denn Chaos kann niemals völlig verschwinden.\n\n" +
      "Es bleibt ein Teil des Universums… und unseres Weges.\n" +
      "Aber solange es jemanden wie dich gibt, der die Balance sucht, der Mut zeigt, wo andere verzweifeln, und Licht bringt, wo Schatten wuchern… wird die Welt niemals untergehen.\n\n" +
      "Ruhe dich aus, Auserwählter.\n\n" +
      "Doch sei bereit: Die Geschichte ist nicht zu Ende.\n" +
      "Die Zeit wird neue Prüfungen bringen.\n" +
      "Und wenn die Ordnung erneut erschüttert wird… werde ich dich wieder rufen.\n\n" +
      "Ps: Und die Nase der Sphinx ist auch wieder dran…\n";

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

  setupHtmlClasses() {
    document.getElementById("bodyId").classList.toggle("levelOutro-background");
    document
      .getElementById("game-container")
      .classList.toggle("level5-game-container");
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
      this.scene.start("LevelCreditsScene");
    }
  }
}
