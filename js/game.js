const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [StartScene, StoryScene, level1scene],
};

const game = new Phaser.Game(config);
