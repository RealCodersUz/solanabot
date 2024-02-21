const { default: axios } = require("axios");
const { Telegraf, Markup, session, Scenes } = require("telegraf");
const crypto = require("crypto");
const fs = require("fs");
const { isUtf8 } = require("buffer");
const path = require("path");
const db = require("./db");
require("dotenv/config");

//db connection
db();

const stage = new Scenes.Stage([]);

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  ctx.reply("Assalomu Alaykum Solana botga hush kelibsiz!");
});

bot.use(session());
bot.use(stage.middleware());

// actions
const warningWords = ["/start", "", "", "/help", "dev"]; // Taqiqlangan so'zlarning ro'yxati

bot.on("text", (ctx) => {
  const messageText = ctx.message?.text.toLowerCase();
  if (!warningWords.includes(messageText)) {
    ctx.reply(`Uzr, bu buyruqni tushunmayman, \n qayta /start bosing`);
  }
});

bot.launch();
console.log("Bot ishladi");
