const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [LevelFiveScene],
};

const game = new Phaser.Game(config);
