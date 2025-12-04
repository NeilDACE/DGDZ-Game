/**
 * Main scene for Level 1: Ordering the planets.
 * The planets must be dragged into the correct sequence and position.
 */
class LevelOneScene extends Phaser.Scene {
    /**
     * @type {Phaser.GameObjects.Text}
     */
    feedbackText;

    /**
     * Constants for the scene configuration.
     */
    PLANET_SCALE = 0.08;
    TARGET_Y = 300; // Fixed Y-coordinate for the target line.
    TARGET_X_START = 300; // Starting X-coordinate for the targets.
    TARGET_X_SPACING = 85; // Horizontal spacing between targets.
    
    /**
     * List of planets in the correct target order (left to right).
     */
    planets = [
        "merkur",
        "venus",
        "erde",
        "mars",
        "jupiter",
        "saturn",
        "uranus",
        "neptun",
    ];
    
    /**
     * Game state variables.
     */
    chaosCount = 8; // Total number of planets.
    orderAchieved = 0; // Counter for correctly placed planets.

    constructor() {
        super({ key: "levelOneScene" });
    }

    /**
     * Loads all necessary assets (images, sounds, etc.).
     */
    preload() {
        this.load.image("desk_bg", "assets/level-one/background.png");
        this.load.image("merkur", "assets/level-one/planets/merkur.png");
        this.load.image("venus", "assets/level-one/planets/venus.png");
        this.load.image("erde", "assets/level-one/planets/earth.png");
        this.load.image("mars", "assets/level-one/planets/mars.png");
        this.load.image("jupiter", "assets/level-one/planets/jupiter.png");
        this.load.image("saturn", "assets/level-one/planets/saturn.png");
        this.load.image("uranus", "assets/level-one/planets/uranus.png");
        this.load.image("neptun", "assets/level-one/planets/neptun.png");
    }

    /**
     * Creates the game objects and sets up the level.
     */
    create() {
        this._setupHTMLClasses();
        const { width } = this.sys.game.config;

        this.setFullScreenBackground("desk_bg");

        this.add
            .text(width / 2, 20, "Level 1: Ordne die Planeten", {
                fontSize: "28px",
                fill: "#FFD700",
            })
            .setOrigin(0.5);

        this._addTargetsAndPlanets();
        this._addFeedbackText();
        
        this.showMessage(
            "Bringe die Planeten in ihre korrekte\nReihenfolge und ziehe sie auf die Ziellinie!",
            4000
        );
    }

    // ----------------------------------------------------------------------------------
    // PRIVATE HELPER METHODS (Extracted from create for optimization)
    // ----------------------------------------------------------------------------------

    /**
     * Toggles the necessary HTML classes for the scene.
     */
    _setupHTMLClasses() {
        document.getElementById("bodyId").classList.toggle("level1-background");
        document
            .getElementById("game-container")
            .classList.toggle("level1-game-container");
    }

    /**
     * Creates the target markers and the chaotic, draggable planet objects.
     */
    _addTargetsAndPlanets() {
        const { width } = this.sys.game.config;
        const chaoticAreaY = 150;
        const chaoticAreaHeight = 250;

        for (let i = 0; i < this.planets.length; i++) {
            const planetKey = this.planets[i];
            
            // Calculate target position
            const targetX = this.TARGET_X_START + i * this.TARGET_X_SPACING;
            const targetY = this.TARGET_Y;
            
            this.addTarget(targetX, targetY, this.PLANET_SCALE);

            // Calculate random starting position in the chaotic area
            const startX = Phaser.Math.Between(50, width - 50);
            const startY = Phaser.Math.Between(
                chaoticAreaY,
                chaoticAreaY + chaoticAreaHeight
            );

            this.createChaosDraggable(
                planetKey,
                startX,
                startY,
                this.PLANET_SCALE,
                targetX,
                targetY
            );
        }
    }

    /**
     * Adds the level status feedback text to the bottom of the screen.
     */
    _addFeedbackText() {
        const { width, height } = this.sys.game.config;
        this.feedbackText = this.add
            .text(
                width / 2,
                height - 30,
                `Ordnung: ${this.orderAchieved}/${this.chaosCount}`,
                {
                    fontSize: "24px",
                    fill: "#FFD700",
                }
            )
            .setOrigin(0.5)
            .setDepth(10);
    }

    // ----------------------------------------------------------------------------------
    // PUBLIC UTILITY FUNCTIONS
    // ----------------------------------------------------------------------------------

    /**
     * Scales an image to fill the entire screen (background).
     * @param {string} key - The asset key of the background image.
     */
    setFullScreenBackground(key) {
        const { width: gameWidth, height: gameHeight } = this.sys.game.config;
        const background = this.add.image(gameWidth / 2, gameHeight / 2, key);
        background.setOrigin(0.5);

        const scaleX = gameWidth / background.width;
        const scaleY = gameHeight / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);
    }

    /**
     * Displays a temporary message on the screen.
     * @param {string} text - The message to display.
     * @param {number} [duration=2000] - Duration before the fade-out starts.
     */
    showMessage(text, duration = 2000) {
        console.log("FEEDBACK: " + text);

        const { width, height } = this.sys.game.config;
        const message = this.add
            .text(
                width / 2,
                height / 4,
                text,
                {
                    fontSize: "24px",
                    fill: "#FFD700",
                    align: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    padding: 10,
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        this.tweens.add({
            targets: message,
            alpha: 0,
            ease: "Power1",
            duration: 500,
            delay: duration,
            onComplete: () => {
                message.destroy();
            },
        });
    }

    /**
     * Draws the target marker as a faint white circle.
     * @param {number} x - X-coordinate of the circle center.
     * @param {number} y - Y-coordinate of the circle center.
     * @param {number} scale - Scaling factor to calculate the radius.
     * @returns {Phaser.GameObjects.Graphics} The created graphics object.
     */
    addTarget(x, y, scale) {
        const baseRadius = 150;
        const radius = baseRadius * scale;
        const graphics = this.add.graphics({ x: x, y: y });

        graphics.fillStyle(0xffffff, 0.15);
        graphics.fillCircle(0, 0, radius);

        return graphics;
    }

    /**
     * Creates a draggable planet object and sets up drag events.
     * @param {string} key - Asset key for the planet.
     * @param {number} startX - Initial X-position.
     * @param {number} startY - Initial Y-position.
     * @param {number} scale - Scale of the object.
     * @param {number} targetX - Target X-position.
     * @param {number} targetY - Target Y-position.
     */
    createChaosDraggable(key, startX, startY, scale, targetX, targetY) {
        const item = this.add
            .image(startX, startY, key)
            .setInteractive({ draggable: true })
            .setScale(scale)
            .setDepth(1);

        item.setData({
            targetX: targetX,
            targetY: targetY,
            isOrdered: false,
        });

        item.on("drag", (pointer, dragX, dragY) => {
            item.x = dragX;
            item.y = dragY;
        });

        item.on("dragend", () => {
            this.checkOrder(item);
        });

        this.input.dragDistanceThreshold = 10;
    }

    /**
     * Checks if an object was dropped on the correct target position.
     * @param {Phaser.GameObjects.Image} item - The dropped planet object.
     */
    checkOrder(item) {
        if (item.getData("isOrdered")) return;

        const tx = item.getData("targetX");
        const ty = item.getData("targetY");
        const POS_TOLERANCE = 35;

        const posMatch =
            Math.abs(item.x - tx) < POS_TOLERANCE &&
            Math.abs(item.y - ty) < POS_TOLERANCE;

        if (posMatch) {
            this.achieveOrder(item);
        }
    }

    /**
     * Sets an object to the ordered state (snapped into place).
     * @param {Phaser.GameObjects.Image} item - The planet object.
     */
    achieveOrder(item) {
        item.setData("isOrdered", true);
        item.disableInteractive();

        item.x = item.getData("targetX");
        item.y = item.getData("targetY");

        this.tweens.add({
            targets: item,
            alpha: 0.5,
            duration: 200,
            yoyo: true,
            onComplete: () => item.setAlpha(1),
        });

        this.orderAchieved++;
        this.feedbackText.setText(
            `Ordnung: ${this.orderAchieved}/${this.chaosCount}`
        );

        if (this.orderAchieved === this.chaosCount) {
            this.levelComplete();
        }
    }

    /**
     * Called when all planets have been correctly placed.
     */
    levelComplete() {
        this.showMessage(
            "Das Chaos ist gebannt!\nDu hast die Planeten erfolgreich in\ndie richtige Umlaufbahn gebracht.",
            5000
        );
        setTimeout(() => {
            this.scene.start("levelTwoScene");
        }, 6000);
    }
}
