const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [GameMenuScene, StoryTellingScene, LevelOneScene, LevelTwoScene, LevelThreeScene, LevelFourScene, LevelFiveScene, GameEndScene],
};

const game = new Phaser.Game(config);
