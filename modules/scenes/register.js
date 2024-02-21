const { Scenes } = require("telegraf");

const registerScene = new Scenes.WizardScene("REGISTER_ACKOUNT", (ctx) => {
  ctx.reply("SCENE ALOHIDA FILEDA");
  return ctx.wizard.next();
});

module.exports = registerScene;
