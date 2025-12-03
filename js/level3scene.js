
class level3scene extends Phaser.Scene {
  // Konstruktor ist korrekt
  constructor() {
    super("level3scene");
  }

  // FEHLER: 'function' muss entfernt werden
  preload () {
    // 'myAnimation' ist der Schlüssel, mit dem Sie das Bild später referenzieren
    // 'assets/sheet.png' ist der Pfad zu Ihrem Sprite Sheet
    // frameWidth und frameHeight müssen der Größe eines einzelnen Bildes/Frames entsprechen (z.B. 32x32)
    this.load.spritesheet('myAnimation', 'assets/sheet.png', {
        frameWidth: 32,
        frameHeight: 32
    });
  } // KEIN Komma nach Methoden!

  // FEHLER: 'function' muss entfernt werden
  create () {
    // 1. Animation definieren
    this.anims.create({
        key: 'backgroundAnimation', // Eindeutiger Name für die Animation
        frames: this.anims.generateFrameNumbers('myAnimation', { start: 0, end: 3 }), // Frames 0, 1, 2, 3 nutzen
        frameRate: 8,              // Frames pro Sekunde (z.B. 8)
        repeat: -1                 // Wiederholen: -1 bedeutet unendlich oft
    });

    // 2. Ein Sprite-Objekt erstellen und die Animation starten
    // x und y sind die Positionen, 'myAnimation' der Schlüssel zum Sprite Sheet
    const sprite = this.add.sprite(100, 100, 'myAnimation');

    // Animation auf dem Sprite abspielen
    sprite.play('backgroundAnimation');
  }
} // KEIN Semikolon am Ende der Klassendefinition
