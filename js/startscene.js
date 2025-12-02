class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload() {
    // Logo laden – Pfad an deine Struktur anpassen
    this.load.image("logo", "assets/Logo OC Trans.png");
  }

  create() {
    document.getElementById("side-left").style.display = "none";
    document.getElementById("side-right").style.display = "none";

    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    // Logo in der Mitte etwas höher
    const logo = this.add.image(width / 2, height / 2 - 100, "logo");
    logo.setOrigin(0.5);
    logo.setScale(0.5); // bei Bedarf anpassen

    // Start Game Text direkt unter dem Logo
    const startText = this.add
      .text(width / 2, logo.y + logo.displayHeight / 2 + 40, "Start Game", {
        fontSize: "40px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    startText
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => startText.setStyle({ color: "#ffcc00" }))
      .on("pointerout", () => startText.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => {
        this.scene.start("StoryScene"); // Sort the Chaos Szene
      });
  }
}
