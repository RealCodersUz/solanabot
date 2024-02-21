const { default: axios } = require("axios");
const { Telegraf, Markup, session, Scenes } = require("telegraf");
const crypto = require("crypto");
const fs = require("fs");
const { isUtf8 } = require("buffer");
const path = require("path");
const db = require("./modules/db");
require("dotenv/config");
const commands = require("./modules/commands");
const registerScene = require("./modules/scenes/register");

//db connection
db();

const stage = new Scenes.Stage([registerScene]);

const bot = new Telegraf(`${process.env.BOT_TOKEN}`);
bot.use(session());
bot.use(stage.middleware());

// start
bot.command("start", (ctx) => {
  ctx.reply(`<b>Assalomu Alaykum Solana Trading botiga hush kelibsiz!</b>`, {
    parse_mode: "HTML",
    ...commands.startCommands,
  });
  ctx.scene.enter("REGISTER_ACKOUNT");
});

// actions
const warningWords = ["/start", "/dev", "/help"]; // Taqiqlangan so'zlarning ro'yxati

bot.command("dev", (ctx) => {
  ctx.reply("@ALCODERSUZ jamoasi tomonidan ishlab chiqilgan!");
});

bot.on("text", (ctx) => {
  const messageText = ctx.message?.text.toLowerCase();
  if (!warningWords.includes(messageText)) {
    ctx.reply(`Uzr, bu buyruqni tushunmayman,\nqayta /start bosing`);
  }
});

bot.launch();
console.log("Bot ishladi");
