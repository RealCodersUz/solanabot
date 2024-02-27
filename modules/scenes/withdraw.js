const { Scenes } = require("telegraf");
const { withdrawFunc } = require("../functions");
const { default: axios } = require("axios");

const Withdraw = new Scenes.WizardScene(
  "WITHDRAW",
  (ctx) => {
    ctx.reply("Necha solana");
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.amount = ctx.message.text;
    ctx.reply("Qayerga o'tkazasiz token yuboring");
    return ctx.wizard.next();
  },
  async (ctx) => {
    let walletAddress = ctx.message.text;
    let amount = ctx.wizard.state.amount;
    console.log(
      amount,
      ": amount",
      walletAddress,
      ":walletAddress",
      ctx.from.id,
      ":userId"
    );
    await withdrawFunc(amount, ctx.from.id, walletAddress);
  }
);

module.exports = Withdraw;
