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
const solanaWeb3 = require("@solana/web3.js");

const solanaEndpoint = "https://api.mainnet-beta.solana.com";
const connection = new solanaWeb3.Connection(solanaEndpoint);

const solanaTokenLink = "https://solscan.io/account";

//db connection
db();

const stage = new Scenes.Stage([registerScene]);

const bot = new Telegraf(`${process.env.BOT_TOKEN}`);
bot.use(session());
bot.use(stage.middleware());

// start
bot.command("start", async (ctx) => {
  try {
    // Generate a new Solana keypair
    const newAccount = solanaWeb3.Keypair.generate();

    console.log(newAccount);

    if (newAccount) {
      const newAccountPublicKeyS = newAccount.publicKey.toJSON;
      ctx.session.NEWACKOUNTPUBLICKEY = newAccountPublicKeyS;
      console.log(ctx.session.NEWACKOUNTPUBLICKEY, "publicKeySSS");
      console.log(newAccountPublicKeyS.length, "publicKeySSS len");
    }

    try {
      let newAccountPublicKey = ctx.session.NEWACKOUNTPUBLICKEY;
      const accountBalance = await connection.getBalance(newAccountPublicKey);

      if (newAccountPublicKey && newAccountPublicKey.length == 44) {
        console.log(newAccountPublicKey, "TRYCATCHDAAAAAAAA");
        console.log(accountBalance, "Balance");

        ctx.reply(
          `<b>Welcome to Solana Bot!</b>\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account. Simply fund your wallet and dive into trading.\n\n<b>Solana · </b><a href=${solanaTokenLink}/${newAccountPublicKey}>🅴</a>\n<code>${newAccountPublicKey}</code> <i>(Tap to copy)</i>\n\nBalance: <code>${accountBalance}</code>\nClick on the Refresh button to update your current balance.`,
          {
            parse_mode: "HTML",
            ...commands.startCommands,
          }
        );
      }
    } catch (error) {
      ctx.reply("ERROR");
      console.log(error, "ERROR");
    }

    // console.log(response, "RESPONSE");
  } catch (error) {
    console.error("Error generating Solana account:", error);
    ctx.reply("Error generating Solana account. Please try again later.");
  }
});

// actions
const warningWords = ["/start", "/dev", "/generate", "/help"]; // Taqiqlangan so'zlarning ro'yxati

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
