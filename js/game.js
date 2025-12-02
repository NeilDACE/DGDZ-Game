const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000000",
  scene: [StartScene, StoryScene],
};

const game = new Phaser.Game(config);
