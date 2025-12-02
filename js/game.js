const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  scene: [StartScene, LevelScene, level1scene],
  physics: {
        default: 'arcade', 
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
