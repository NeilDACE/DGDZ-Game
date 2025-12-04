class level3scene extends Phaser.Scene {
    // --- KONSTANTEN UND VARIABLEN ---
    constructor() {
        super({ key: "level3scene" });
        
        // Konstanten für den animierten Hintergrund (1536x1024)
        this.FRAME_WIDTH = 1536;
        this.FRAME_HEIGHT = 1024; 
        this.START_FRAMERATE = 20;
        this.MIN_FRAMERATE = 1;
        this.FRAMERATE_DECREMENT = 2;

        // SEQUENZ-DEFINITION
        // Wichtig: Die Namen müssen exakt mit den Bild-Keys übereinstimmen!
        this.correctSequence = [
            "Mushroom", "Eye", "Stick", "Bone", "Bottle", 
            "Crawl", "Feather", "Berry", "Sheet", "Crystal"
        ];
        this.TOTAL_INGREDIENTS = this.correctSequence.length;
        this.currentSequenceIndex = 0; // Index der als Nächstes benötigten Zutat
        
        // Feste Positionen für die 10 Zutaten (RELATIV zu einem 800x600 oder ähnlichem Screen)
        // Die tatsächliche Berechnung der x/y-Werte erfolgt in create() oder placeIngredients()
        this.INGREDIENT_POSITIONS = [
            // Oben links
            { x: 100, y: 150 },
            { x: 250, y: 100 },
            // Mitte links
            { x: 50, y: 350 },
            { x: 200, y: 450 },
            // Unten links (unter dem Kessel)
            { x: 150, y: 350 },
            // Oben rechts
            { x: 700, y: 120 },
            { x: 550, y: 80 },
            // Mitte rechts
            { x: 400, y: 300 },
            { x: 350, y: 450 },
            // Unten rechts (unter dem Kessel)
            { x: 500, y: 400 }
        ];

        // Spielstatus & Objekte
        this.ingredientsCollected = 0;
        this.ingredientsGroup = null; // Wichtig: Wird in create() als Phaser.Group initialisiert!
        this.CAULDRON_TARGET = { x: 0, y: 0, radius: 100 };
        this.background;
    }

    // --- PRELOAD: ASSETS LADEN ---
    preload() {
        this.load.spritesheet('backgroundAnimation', 'Assets/levelThree/background-level-3-spritesheet.png', {
            frameWidth: this.FRAME_WIDTH,
            frameHeight: this.FRAME_HEIGHT
        });
        
        
        
        for (const key of this.correctSequence) {
            this.load.image(key, `Assets/levelThree/${key}.png`);
        }
    }

    // --- CREATE: SPIELOBJEKTE ERSTELLEN ---
    create() {
        document.getElementById("bodyId").classList.toggle("level3-background");
        document.getElementById("game-container").classList.toggle("level3-game-container");

        const { width, height } = this.sys.game.config;
        
        // Annahme: Der Standard-Canvas ist 800x600. Wir berechnen den Skalierungsfaktor für die Positionen.
        // Wenn Ihr Canvas eine feste Größe hat, kann die Skalierung vereinfacht oder weggelassen werden.
        const defaultWidth = 1000; // Anzunehmende Basisbreite für die fixen Positionen
        const defaultHeight = 600; // Anzunehmende Basishöhe für die fixen Positionen

        this.positionScaleX = width / defaultWidth;
        this.positionScaleY = height / defaultHeight;

        this.CAULDRON_TARGET.x = width / 2 - 15;
        this.CAULDRON_TARGET.y = height / 2 + 50;

        // 1. Animierten Hintergrund einrichten
        this.setupAnimatedBackground(width, height);
        

        // 3. Gruppe für alle Zutaten erstellen (Wichtig: Hier initialisieren!)
        this.ingredientsGroup = this.add.group();
        
        // 4. Feedback-Text
        this.feedbackText = this.add
            .text(width / 2, height - 30, `Wird geladen...`, {
                fontSize: "24px",
                fill: "#FFFF00",
                backgroundColor: "#1E1E1E",
            })
            .setOrigin(0.5)
            .setDepth(10);
            
        // 5. Level starten/zurücksetzen, um den Anfangszustand zu setzen
        this.resetLevel();
    }
    
    // ----------------------------------------------------------------------
    // --- NEUE FUNKTION: LEVEL ZURÜCKSETZEN ---
    // ----------------------------------------------------------------------
    
    /**
     * Setzt den gesamten Spielzustand zurück, wenn ein Fehler auftritt oder das Spiel beginnt.
     */
    resetLevel() {
        // 1. Zerstöre alle vorhandenen Zutaten-Sprites
        // Die Prüfung if (this.ingredientsGroup) { ... } ist jetzt sicher, da es in create initialisiert wird.
        this.ingredientsGroup.clear(true, true);
        
        // 2. Setze den Spielstatus zurück
        this.ingredientsCollected = 0;
        this.currentSequenceIndex = 0;
        
        // 3. Platziere alle Zutaten neu (Alle Keys aus der Sequenz)
        this.placeIngredients(this.correctSequence);
        
        // 4. Setze Framerate auf den Anfangswert zurück (schnelles Kochen)
        this.updateBackgroundFramerate();
        
        // 5. Aktualisiere Feedback
        this.feedbackText.setText(
            `Zutaten: 0/${this.TOTAL_INGREDIENTS} | Benötigt: ${this.correctSequence[0]}`
        );
    }
    
    // ----------------------------------------------------------------------
    // --- WICHTIGE HILFSFUNKTIONEN ---
    // ----------------------------------------------------------------------

    /**
     * Platziere die in der Liste keysToPlace definierten Zutaten an festen Positionen.
     * @param {string[]} keysToPlace - Array der Keys, die als Sprite platziert werden sollen.
     */
    placeIngredients(keysToPlace) { 
        // Um nur eindeutige Keys zu platzieren, falls doppelte in der Sequenz sind
        const uniqueKeysToPlace = [...new Set(keysToPlace)]; 
        
        // Sicherstellen, dass die Anzahl der Zutaten und Positionen übereinstimmt (oder zumindest nicht überschritten wird)
        const count = Math.min(uniqueKeysToPlace.length, this.INGREDIENT_POSITIONS.length);

        for (let i = 0; i < count; i++) {
            const key = uniqueKeysToPlace[i];
            const pos = this.INGREDIENT_POSITIONS[i];
            
            // Die feste Position basierend auf dem Skalierungsfaktor berechnen
            const startX = pos.x * this.positionScaleX;
            const startY = pos.y * this.positionScaleY;

            // Füge die Zutat der Gruppe hinzu
            const item = this.createDraggableIngredient(key, startX, startY);
            this.ingredientsGroup.add(item); 
        }
    }

    /**
     * Erstellt ein ziehbares Zutaten-Objekt und gibt es zurück.
     */
    createDraggableIngredient(key, startX, startY) {
        const item = this.add
            .image(startX, startY, key)
            .setInteractive({ draggable: true })
            .setScale(0.2) // Skalierung der Zutat
            .setDepth(1)
            .setName(key); // Der Name ist entscheidend für die Sequenzprüfung!

        item.on("drag", (pointer, dragX, dragY) => {
            item.x = dragX;
            item.y = dragY;
        });

        item.on("dragend", () => {
            this.checkCauldronDrop(item);
        });

        return item;
    }
    
    /**
     * Prüft, ob die Zutat in den Kessel gezogen wurde und leitet zur Verarbeitung weiter.
     */
    checkCauldronDrop(item) {
        const dist = Phaser.Math.Distance.Between(
            item.x, item.y, 
            this.CAULDRON_TARGET.x, this.CAULDRON_TARGET.y
        );

        if (dist < this.CAULDRON_TARGET.radius) {
            this.processDrop(item); 
        }
    }

    /**
     * Verarbeitet den Drop: Prüft die Reihenfolge und reagiert auf Korrekt/Falsch (mit Reset).
     */
    processDrop(item) {
        // Prüfe, ob das Spiel bereits abgeschlossen ist
        if (this.ingredientsCollected === this.TOTAL_INGREDIENTS) return;
        
        const requiredKey = this.correctSequence[this.currentSequenceIndex];
        
        if (item.name === requiredKey) {
            // --- KORREKTE ZUTAT GEZOGEN ---
            
            item.destroy(); 
            this.ingredientsCollected++;
            this.currentSequenceIndex++;
            
            this.updateBackgroundFramerate();

            if (this.ingredientsCollected === this.TOTAL_INGREDIENTS) {
                this.levelComplete();
            } else {
                 // Aktualisiere Feedback mit der als Nächstes benötigten Zutat
                this.feedbackText.setText(
                    `Zutaten: ${this.ingredientsCollected}/${this.TOTAL_INGREDIENTS} | Benötigt: ${this.correctSequence[this.currentSequenceIndex]}`
                );
            }
            
        } else {
            // --- FALSCHE ZUTAT GEZOGEN: LEVEL RESET ---
            this.feedbackText.setText(`Falsche Zutat! Benötigt: ${requiredKey}. Alle Zutaten zurückgesetzt!`);
            
            // Führe den Reset nach kurzer Verzögerung aus (1.5 Sekunden)
            this.time.delayedCall(1500, this.resetLevel, [], this);
        }
    }


    /**
     * Passt die Framerate der Hintergrundanimation an den Fortschritt an (Verlangsamung).
     */
    updateBackgroundFramerate() {
        // ... (Logik unverändert)
        let newFramerate = this.START_FRAMERATE - (this.ingredientsCollected * this.FRAMERATE_DECREMENT);
        newFramerate = Math.max(newFramerate, this.MIN_FRAMERATE);
        
        this.background.anims.play({ 
            key: 'backgroundAnimation', 
            frameRate: newFramerate,
            repeat: -1
        });
    }

    /**
     * Wird aufgerufen, wenn alle Zutaten gesammelt wurden. Stoppt die Animation.
     */
    levelComplete() {
        // ... (Logik unverändert)
        this.feedbackText.setText("Brau abgeschlossen! Das Gebräu ist fertig!");
        
        this.background.anims.stop();
        this.background.setFrame(3); 
    }
    
    // setupAnimatedBackground (Unverändert)
    setupAnimatedBackground(width, height) {
        this.anims.create({
            key: 'backgroundAnimation', 
            frames: this.anims.generateFrameNumbers('backgroundAnimation', { start: 0, end: 2 }), 
            frameRate: this.START_FRAMERATE, 
            repeat: -1, 
        });
        
        this.background = this.add.sprite(width / 2, height / 2, 'backgroundAnimation');
        const scaleX = width / this.FRAME_WIDTH;
        const scaleY = height / this.FRAME_HEIGHT; 
        const scale = Math.max(scaleX, scaleY); 

        this.background.setScale(scale); 
        this.background.setDepth(-10); 
        this.background.play("backgroundAnimation");
    }
}
