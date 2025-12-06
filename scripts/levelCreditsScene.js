class LevelCreditsScene extends Phaser.Scene {
  constructor() {
    super("LevelCreditsScene");
  }

  preload() {
    // Optional: Hintergrundbild
    this.load.image("credits_bg", "assets/game-menu/game-menu-logo.png");

    // Optional: Musik
    this.load.audio(
      "credits_music",
      "assets/audio/game-menu-background-sound.mp3"
    );
  }

  create() {
    document.getElementById("side-left").classList.toggle("hidden");
    document.getElementById("side-right").classList.toggle("hidden");
    
    const width = this.scale.width;
    const height = this.scale.height;

    // Optional HTML-Klassen (falls du Style willst)
    this._setupHTMLClasses(true);

    // Hintergrund
    if (this.textures.exists("credits_bg")) {
      const bg = this.add.image(width / 2, height / 2, "credits_bg");
      bg.setDisplaySize(width, height);
      bg.setDepth(-10);
    }

    // Musik abspielen
    if (this.cache.audio.exists("credits_music")) {
      this.music = this.sound.add("credits_music", {
        volume: 0.6,
        loop: false,
      });
      this.music.play();
    }

    // Credits-Text (füge hier deine Entwickler ein)
    const creditsText = `
        🎮 Game Credits 🎮

        Projektleitung:
        - Alexander Vielkind
        - Nil Vollhardt

        Programmierung:
        - Alexander Vielkind
        - Nil Vollhardt


        Grafik & Design:
        - Alexander Vielkind
        - Nil Vollhardt


        Musik & Sound:
        - ElevenLabs
        

        Story:
        - Alexander Vielkind
        - Nil Vollhardt

        QA & Testing:
        - Alexander Vielkind
        - Nil Vollhardt

        Besonderer Dank:
        - An ChatGPT für die Unterstützung bei der Image-Generierung
        - An alle, die uns Feedback gegeben haben

        © 2025 Projekt Die Geschichte der Zwei - Ursprung der Welt • 
        Alle Rechte vorbehalten
    `;

    // Textobjekt erzeugen (startet unter dem Bildschirm)
    const textObj = this.add
      .text(width / 2, height + 50, creditsText, {
        fontSize: "26px",
        color: "#ffffffff",
        align: "center",
        fontFamily: "Arial",
        wordWrap: {
          width: width - 100,
        },
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Auto-Scroll Animation (hochfahren)
    const scrollDuration = 40000; // 25 Sekunden Credits

    this.tweens.add({
      targets: textObj,
      y: -textObj.height / 2,
      duration: scrollDuration,
      ease: "Linear",
      onComplete: () => {
        this._endCredits();
      },
    });

    // Szene mit Klick oder Taste skippen
    this.input.once("pointerdown", () => this._endCredits());
    this.input.keyboard.once("keydown", () => this._endCredits());
  }

  _endCredits() {
    if (this.music) this.music.stop();

    this._setupHTMLClasses(false);

    // Zurück zum Start
    this.scene.start("GameMenuScene"); // Falls du irgendwann ein Hauptmenü hast
    // Oder alternativ: Reload → this.scene.start("levelOneScene");
  }

  _setupHTMLClasses(add) {
    const body = document.getElementById("bodyId");
    const container = document.getElementById("game-container");
    if (!body || !container) return;

    body.classList[add ? "add" : "remove"]("credits-background");
    container.classList[add ? "add" : "remove"]("credits-container");
  }
}
