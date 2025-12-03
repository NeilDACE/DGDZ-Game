class level3scene extends Phaser.Scene {
    // --- KONSTANTEN UND VARIABLEN ---
    constructor() {
        super({ key: "level3scene" });
        
        // Konstanten für den animierten Hintergrund (aus deiner Konfiguration)
        this.FRAME_WIDTH = 1536;
        this.FRAME_HEIGHT = 1024; // Korrigiert auf 1024
        this.START_FRAMERATE = 20; // Hohe Start-Framerate (schnell kochend)
        this.MIN_FRAMERATE = 1;    // Minimale Framerate (ganz langsam/konstant)
        this.FRAMERATE_DECREMENT = 2; // Wert, um den die Framerate pro Zutat sinkt
        
        // Spielstatus
        this.TOTAL_INGREDIENTS = 10;
        this.ingredientsCollected = 0;
        
        // Liste der Zutaten-Keys (müssen in preload geladen werden)
        this.ingredientKeys = [
            "auge", "pilz", "wurzel", "knochen", "flasche", 
            "kralle", "feder", "beere", "blatt", "kristall" 
        ];
        
        // Position des Kessels (Zentrum der Szene)
        this.CAULDRON_TARGET = { x: 0, y: 0, radius: 100 }; // Radius bestimmt den Trefferbereich
        this.background; // Referenz auf das Hintergrund-Sprite
    }

    // --- PRELOAD: ASSETS LADEN ---
    preload() {
        // Lade den animierten Hintergrund (Spritesheet)
        this.load.spritesheet('backgroundAnimation', 'Assets/levelThree/background-level-3-spritesheet.png', {
            frameWidth: this.FRAME_WIDTH,
            frameHeight: this.FRAME_HEIGHT
        });
        
        // Lade den Kessel (Target)
        this.load.image("cauldron", "Assets/levelFour/kessel.png");
        
        // Lade alle 10 Zutaten (Pfade bitte anpassen!)
        for (const key of this.ingredientKeys) {
            this.load.image(key, `Assets/levelFour/ingredients/${key}.png`);
        }
    }

    // --- CREATE: SPIELOBJEKTE ERSTELLEN ---
    create() {
        const { width, height } = this.sys.game.config;
        
        // Kesselposition im Zentrum festlegen (basierend auf 1000x600)
        this.CAULDRON_TARGET.x = width / 2;
        this.CAULDRON_TARGET.y = height / 2;

        // 1. Animierten Hintergrund einrichten
        this.setupAnimatedBackground(width, height);
        
        // 2. Kessel (Target) in der Mitte platzieren
        this.cauldron = this.add.image(this.CAULDRON_TARGET.x, this.CAULDRON_TARGET.y, "cauldron")
            .setScale(0.5) // Skalierung des Kessels anpassen
            .setDepth(5); 

        // 3. Alle zufälligen Zutaten platzieren
        this.placeIngredients(width, height);
        
        // 4. Feedback-Text
        this.feedbackText = this.add
            .text(width / 2, height - 30, `Zutaten: 0/${this.TOTAL_INGREDIENTS}`, {
                fontSize: "24px",
                fill: "#FFFF00",
                backgroundColor: "#1E1E1E",
            })
            .setOrigin(0.5)
            .setDepth(10);
            
        // Setzt die initiale Framerate
        this.updateBackgroundFramerate();
    }
    
    // ----------------------------------------------------------------------
    // --- HILFSFUNKTIONEN ---
    // ----------------------------------------------------------------------
    
    /**
     * Richte den animierten Hintergrund ein (Contain-Effekt).
     */
    setupAnimatedBackground(width, height) {
        // Animationsdefinition
        this.anims.create({
            key: 'backgroundAnimation', 
            frames: this.anims.generateFrameNumbers('backgroundAnimation', { start: 1, end: 3 }), 
            frameRate: this.START_FRAMERATE, 
            repeat: -1, 
        });
        
        // Sprite erstellen und zentrieren
        this.background = this.add.sprite(width / 2, height / 2, 'backgroundAnimation');
        
        // Contain-Skalierung: Math.min, um das gesamte Bild sichtbar zu halten
        const scaleX = width / this.FRAME_WIDTH;
        const scaleY = height / this.FRAME_HEIGHT; 
        const scale = Math.min(scaleX, scaleY); 

        this.background.setScale(scale); 
        this.background.setDepth(-10); // Hintergrund
        
        // Animation starten
        this.background.play("backgroundAnimation");
    }

    /**
     * Platziere 10 zufällige Zutaten (außerhalb des Kessels).
     */
    placeIngredients(width, height) {
        const padding = 150; // Randabstand, damit Zutaten nicht zu nah an den Rändern liegen
        
        for (let i = 0; i < this.TOTAL_INGREDIENTS; i++) {
            const key = this.ingredientKeys[i % this.ingredientKeys.length]; 
            
            let startX, startY, distanceToCauldron;
            
            // Schleife, um sicherzustellen, dass die Zutat NICHT im Kessel startet
            do {
                startX = Phaser.Math.Between(padding, width - padding);
                startY = Phaser.Math.Between(padding, height - padding);
                
                // Berechne den Abstand zum Kessel
                distanceToCauldron = Phaser.Math.Distance.Between(
                    startX, startY, 
                    this.CAULDRON_TARGET.x, this.CAULDRON_TARGET.y
                );
            } while (distanceToCauldron < this.CAULDRON_TARGET.radius * 1.5); // Muss 1.5x Radius entfernt sein
            
            this.createDraggableIngredient(key, startX, startY);
        }
    }

    /**
     * Erstellt ein ziehbares Zutaten-Objekt und richtet Drag-Events ein.
     */
    createDraggableIngredient(key, startX, startY) {
        const item = this.add
            .image(startX, startY, key)
            .setInteractive({ draggable: true })
            .setScale(0.3) // Skalierung der Zutat
            .setDepth(1)
            .setName(key); 

        item.on("drag", (pointer, dragX, dragY) => {
            item.x = dragX;
            item.y = dragY;
        });

        item.on("dragend", () => {
            this.checkCauldronDrop(item);
        });

        this.input.dragDistanceThreshold = 10;
    }

    /**
     * Prüft, ob die Zutat in den Kessel gezogen wurde.
     */
    checkCauldronDrop(item) {
        // Berechne den Abstand zum Kessel-Mittelpunkt
        const dist = Phaser.Math.Distance.Between(
            item.x, item.y, 
            this.CAULDRON_TARGET.x, this.CAULDRON_TARGET.y
        );

        // Wenn der Abstand kleiner ist als der Treffer-Radius des Kessels
        if (dist < this.CAULDRON_TARGET.radius) {
            this.collectIngredient(item);
        }
    }

    /**
     * Verarbeitet das "Kochen" der Zutat (Zerstören und Framerate anpassen).
     */
    collectIngredient(item) {
        // 1. Zutat verschwinden lassen
        item.destroy();

        // 2. Zähler erhöhen
        this.ingredientsCollected++;
        
        // 3. Framerate anpassen (wird langsamer)
        this.updateBackgroundFramerate();

        // 4. Feedback aktualisieren
        this.feedbackText.setText(`Zutaten: ${this.ingredientsCollected}/${this.TOTAL_INGREDIENTS}`);

        // 5. Level-Ende prüfen
        if (this.ingredientsCollected === this.TOTAL_INGREDIENTS) {
            this.levelComplete();
        }
    }

    /**
     * Passt die Framerate der Hintergrundanimation an den Fortschritt an (Verlangsamung).
     */
    updateBackgroundFramerate() {
        // Berechne die neue Framerate (start - gesammelte * Dekrement)
        let newFramerate = this.START_FRAMERATE - (this.ingredientsCollected * this.FRAMERATE_DECREMENT);
        
        // Stelle sicher, dass die Framerate nicht unter das Minimum (1 FPS) fällt
        newFramerate = Math.max(newFramerate, this.MIN_FRAMERATE);
        
        // Wichtig: Animation mit der neuen Rate neu starten, um die Änderung sofort zu sehen
        this.background.anims.play({ 
            key: 'backgroundAnimation', 
            frameRate: newFramerate,
            repeat: -1
        });
    }

    /**
     * Wird aufgerufen, wenn alle Zutaten gesammelt wurden.
     */
    levelComplete() {
        // 1. Finales Feedback
        this.feedbackText.setText("Brau abgeschlossen! Das Gebräu ist fertig!");
        
        // 2. Framerate auf Minimum setzen (konstant)
        this.background.anims.play({ 
            key: 'backgroundAnimation', 
            frameRate: this.MIN_FRAMERATE, 
            repeat: -1
        });
        
        
        // Optional: Hier könnte der Szenenwechsel zur nächsten Szene erfolgen
    }
}
