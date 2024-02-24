const { Scenes } = require("telegraf");
const { solToUsd } = require("../functions");
const { default: axios } = require("axios");

const Currency = new Scenes.WizardScene(
  "CURRENCY",
  (ctx) => {
    ctx.reply("Necha solana bor");
    return ctx.wizard.next();
  },
  async (ctx) => {
    // ctx.reply("Hisoblamoqda");
    if (!isNaN(parseFloat(ctx.message.text))) {
      ctx.session.sol = parseFloat(ctx.message.text);
      //   return ctx.scene.enter("USD");
      const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`;
      try {
        const response = await axios.get(apiUrl);
        const price = response.data;
        // console.log(response.data);
        console.log(price.solana.usd * ctx.session.sol);
        ctx.reply(`${ctx.session.sol}Sol = ${price.solana.usd * ctx.session.sol} $Usd`);
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
      let result = await solToUsd(ctx.session.sol);
      await ctx.reply(result);
    } else {
      ctx.replyWithMarkdown(
        `Lo siento, pero "${ctx.message.text}" no es un número válido.`
      );
    }
  }
);

module.exports = Currency;
