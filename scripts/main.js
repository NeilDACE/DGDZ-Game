const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  parent: "game-container",
  backgroundColor: "#000000",
  scene: [GameMenuScene,StoryTellingScene, LevelOneScene, LevelTwoScene, LevelThreeScene, LevelFourScene, LevelFiveScene, StoryOutroScene],
};
/**
 * [GameMenuScene,StoryTellingScene, LevelOneScene, LevelTwoScene, LevelThreeScene, LevelFourScene, LevelFiveScene, StoryOutroScene]
 */
const game = new Phaser.Game(config);
