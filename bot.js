const { Telegraf, Markup, session, Scenes } = require("telegraf");
const solanaWeb3 = require("@solana/web3.js");
const db = require("./modules/db");
const crypto = require("crypto");
const { startCommands, backMainCommands } = require("./modules/commands");
const registerScene = require("./modules/scenes/register");
const User = require("./modules/models/User");
const { Connection } = require("mongoose");
const { solToUsd, getPairs } = require("./modules/functions");
const Currency = require("./modules/scenes/currency");
const { default: axios } = require("axios");

require("dotenv/config");

// Solana configuration (replace with your actual values)
const solanaEndpoint = "https://api.mainnet-beta.solana.com";
const connection = new solanaWeb3.Connection(solanaEndpoint);
const solanaTokenLink = "https://solscan.io/account/";
let startVideoID =
  "BAACAgQAAxkBAAICtmXaDFoULe1S9hsxTC7eR2fID5gCAAIzBQAC_T5lUDFAgyX-fIqqNAQ";

const DEXSCREENER_API_BASE_URL =
  "https://api.dexscreener.com/latest/dex/search/?q=solana";

// Telegram bot setup
const stage = new Scenes.Stage([registerScene, Currency]);
const bot = new Telegraf(process.env.BOT_TOKEN);
db();

bot.use(session());
bot.use(stage.middleware());

async function createUser(userId, publicKey, secretKey) {
  try {
    // Validate input data
    if (!userId || !publicKey || !secretKey) {
      throw new Error("Missing required user data");
    }

    // Check for existing user with unique and valid `tg_id`
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      throw new Error(`User with ID ${userId} already exists`);
    }

    // Hash secret key before saving (recommended)

    const newUser = new User({
      userId,
      publicKey,
      secretKey,
    });

    await newUser.save();
    console.log(`New user created with ID: ${userId}`);

    // Return safe user information (without sensitive data)
    const safeUser = {
      userId,
      publicKey,
    };
    return safeUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error; // Re-throw for proper error handling
  }
}

async function getUser(userId) {
  try {
    const user = await User.findOne({ userId });

    // if (!user) {
    //   // Create a new Solana account and user entry
    //   const newAccount = solanaWeb3.Keypair.generate();
    //   const newUser = await createUser(
    //     userId,
    //     newAccount.publicKey.toString(),
    //     newAccount.secretKey.toString("hex")
    //   ); // Store secret key securely (e.g., encrypt or hash)
    //   console.log(`New user created with ID: ${userId}`);
    //   return newUser;
    // }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Re-throw for proper error handling
  }
}

// bcrypt
async function getSolanaAccountBalance(connection, publicKey) {
  try {
    const balance = await connection.getBalance(
      new solanaWeb3.PublicKey(publicKey)
    );
    console.log("Solana Account Balance:", balance);
    return balance;
  } catch (error) {
    console.error("Error fetching Solana account balance:", error);
    throw error; // Re-throw for proper error handling
  }
}

// Start command
bot.command("start", async (ctx) => {
  try {
    // Handle existing user or create a new one
    const userId = ctx.update.message.from.id;
    let user = await getUser(userId);

    // Check if the user already exists
    if (!user) {
      // Create a new Solana account and user entry
      const newAccount = solanaWeb3.Keypair.generate();
      await createUser(
        userId,
        newAccount.publicKey.toString(),
        newAccount.secretKey.toString("hex")
      ); // Store secret key securely
      user = await getUser(userId);

      let balance = await getSolanaAccountBalance(connection, user.publicKey);
      let SolanaUsdBalance = await solToUsd(balance);

      console.log("Solana Account Balance:", balance);

      ctx.sendVideo(startVideoID, {
        caption: `\*Welcome to Solana Bot!\*\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account.\nSimply fund your wallet and dive into trading.\n\n\*Solana ·\* [🅴](${solanaTokenLink}${user.publicKey}) \n\`${user.publicKey}\` (Tap to copy)\nBalance: \`${balance} SOL ${SolanaUsdBalance}$ \`\n\nClick on the Refresh button to update your current balance.
        `,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        ...startCommands,
      });
    } else {
      let balance = await getSolanaAccountBalance(connection, user.publicKey);
      let accountBalance = balance;
      let SolanaUsdBalance = await solToUsd(balance);

      ctx.replyWithMarkdown(
        `\*Welcome to Solana Bot!\*\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account.\nSimply fund your wallet and dive into trading.\n\n\*Solana ·\* [🅴](${solanaTokenLink}${user.publicKey}) \n\`${user.publicKey}\` (Tap to copy)\nBalance: \`${accountBalance} SOL ${SolanaUsdBalance}$ \`\n\nClick on the Refresh button to update your current balance.
     `,
        {
          disable_web_page_preview: true,
          ...startCommands,
        }
      );
    }

    // let startMessage = `**Welcome to Solana Bot!**\n\nHere's your Solana wallet address linked to your Telegram account:\n\n<b>Solana · </b> <a href=${solanaTokenLink}/${user.publicKey}>🅴</a>\n<code>${user.publicKey}</code> (Tap to copy)\n\nBalance: <code>${accountBalance} SOL</code>\n\nClick on the Refresh button to update your current balance.`;

    // ctx.reply(startMessage, startCommands);
  } catch (error) {
    console.error("Error creating user or fetching balance:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});

bot.action("UPDATE_BOT", async (ctx) => {
  // foydalanuvchi identifikatorini olish
  await ctx.deleteMessage();

  const userId = ctx.from.id;

  // foydalanuvchini olish
  let user = await getUser(userId);

  // Solana hisob hisobini olish
  let balance = await getSolanaAccountBalance(connection, user.publicKey);
  let accountBalance = balance;
  let SolanaUsdBalance = await solToUsd(accountBalance);

  // Habarni yuborish
  ctx.replyWithMarkdown(
    `\*Welcome to Solana Bot!\*\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account.\nSimply fund your wallet and dive into trading.\n\n\*Solana ·\* [🅴](${solanaTokenLink}${user.publicKey}) \n\`${user.publicKey}\` (Tap to copy)\nBalance: \`${accountBalance} SOL ${SolanaUsdBalance}$ \`\n\nClick on the Refresh button to update your current balance.`,
    {
      disable_web_page_preview: true,
      ...startCommands,
    }
  );
});

// ctx.reply();
bot.action("HELP", async (ctx) => {
  await ctx.deleteMessage();
  ctx.reply(
    `Unibot on Solana is developed and overseen by Unibot Labs, a new and independent team of Solana developers. We operate autonomously from the core Unibot team, handling all aspects of Unibot on Solana.\nLead Team: @AliiKamoliddinov\n\nAdditional questions or need support?\nJoin our Telegram group @unibotuz_group and one of our admins can assist you.`,
    backMainCommands
  );
});

bot.action("BACK_MAIN_MENU", async (ctx) => {
  // foydalanuvchi identifikatorini olish
  await ctx.deleteMessage();

  const userId = ctx.from.id;

  // foydalanuvchini olish
  let user = await getUser(userId);

  // Solana hisob hisobini olish
  let balance = await getSolanaAccountBalance(connection, user.publicKey);
  let accountBalance = balance;
  let SolanaUsdBalance = await solToUsd(accountBalance);

  // Habarni yuborish
  ctx.replyWithMarkdown(
    `\*Welcome to Solana Bot!\*\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account.\nSimply fund your wallet and dive into trading.\n\n\*Solana ·\* [🅴](${solanaTokenLink}${user.publicKey}) \n\`${user.publicKey}\` (Tap to copy)\nBalance: \`${accountBalance} SOL ${SolanaUsdBalance}$\`\n\nClick on the Refresh button to update your current balance.`,
    {
      disable_web_page_preview: true,
      ...startCommands,
    }
  );
});

bot.action("NEW_PAIRS", async (ctx) => {
  let lastTimestamp = Date.now(); // Hozirgi vaqt bilan lastTimestamp ni boshlaymiz

  try {
    const RANK_BY = "trendingScoreH6"; // "Yangi" juftliklarni aniqlash uchun `created` yoki `lastUpdated` ni ishlatish maqbul bo'lishi mumkin
    const ORDER = "desc";
    const MIN_LIQ = 1;

    // Vaqt filteri bilan URL (sizning "yangi" ta'rifingizga moslashtirib olingan)
    const url = `${DEXSCREENER_API_BASE_URL}`;

    const response = await axios.get(url);
    const pairs = response.data;
    // console.log(pairs, "PAIRS");

    let message = `New DexScreener Data (Solana, New Pairs):\n`;

    // Extract and process "new" pairs
    const newPairs = pairs.pairs.filter((pair) => pair.pairCreatedAt > 0);

    // chainId, dexId,url,pairAddress,baseToken,quoteToken,priceNative,priceUsd,txns,volume,priceChange,liquidity,fdv,pairCreatedAt,info

    console.log(newPairs[0].chainId, " | chainId");
    console.log(newPairs[0].dexId, " | dexId");
    console.log(newPairs[0].url, " | url");
    console.log(newPairs[0].pairAddress, " | pairAddress");
    console.log(newPairs[0].baseToken, " | baseToken");
    console.log(newPairs[0].quoteToken, " | quoteToken");
    console.log(newPairs[0].priceNative, " | priceNative");
    console.log(newPairs[0].priceUsd, " | priceUsd");
    console.log(newPairs[0].txns, " | txns");
    console.log(newPairs[0].volume, " | volume");
    console.log(newPairs[0].priceChange, " | priceChange");
    console.log(newPairs[0].liquidity, " | liquidity");
    console.log(newPairs[0].fdv, " | fdv");
    console.log(newPairs[0].pairCreatedAt, " | pairCreatedAt");
    console.log(newPairs[0].info, " | info");

    if (newPairs) {
      for (const pair of newPairs) {
        // Customize data extraction and presentation as needed
        const formattedData = `* **Pair:** ${pair.name} (${pair.baseSymbol}/${pair.quoteSymbol})\n`;
        const additionalData = pair.additionalData || {}; // Handle potential lack of "additionalData"

        message +=
          formattedData +
          `* URL: ${additionalData.url || ""}\n` +
          `* Pair Address: ${additionalData.pairAddress || ""}\n` +
          `* Price Native: ${additionalData.priceNative || ""}\n` +
          `* Price Usd : ${additionalData.priceUsd || ""}\n` +
          `* Pair created at : ${pair.pairCreatedAt || ""}\n`;

        // Update `lastTimestamp` for future checks
        lastTimestamp = Math.max(lastTimestamp, pair.pairCreatedAt);
      }

      ctx.reply(message);
    } else {
      // Agar ma'lumot topilmasa bildiramiz
      ctx.reply("Yangi juftliklar topilmadi.");
    }
  } catch (error) {
    console.error("Ma'lumotni olishda xatolik:", error);
    ctx.reply(
      "Ma'lumotni olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring."
    );
  }
});

bot.on("video", (ctx) => {
  console.log(ctx.update.message.video.file_id);
  ctx.reply(ctx.update.message.video.file_id);
});

bot.command("currency", (ctx) => {
  // ctx.reply("enter the amaunt");
  solToUsd(1);
  // ctx.scene.enter("CURRENCY");
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

// Error handling and logging
bot.on("error", (error) => console.error("Error:", error));
// const stage = new Scenes.Stage([wizardScene, getSMSCodScene, getAll]);

// Bot launch
bot.launch();
console.log("Bot started successfully!");
