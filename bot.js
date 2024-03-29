const { Telegraf, Markup, session, Scenes } = require("telegraf");
const solanaWeb3 = require("@solana/web3.js");
const db = require("./modules/db");
const crypto = require("crypto");
const {
  startCommands,
  backMainCommands,
  settingCommands,
} = require("./modules/commands");
const registerScene = require("./modules/scenes/register");
const User = require("./modules/models/User");
const { Connection } = require("mongoose");
const { solToUsd, getPairs } = require("./modules/functions");
const Currency = require("./modules/scenes/currency");
const { default: axios } = require("axios");
const Withdraw = require("./modules/scenes/withdraw");
// const Withdraw = require("./modules/scenes/withdraw");

require("dotenv/config");

// Solana configuration (replace with your actual values)
let BOT_USERNAME = process.env.BOT_USERNAME;
let BOT_TOKEN = process.env.BOT_TOKEN;
const solanaEndpoint = "https://api.mainnet-beta.solana.com";
const connection = new solanaWeb3.Connection(solanaEndpoint);
const solanaTokenLink = "https://solscan.io/account/";
let startVideoID =
  "BAACAgQAAxkBAAICtmXaDFoULe1S9hsxTC7eR2fID5gCAAIzBQAC_T5lUDFAgyX-fIqqNAQ";

const DEXSCREENER_API_BASE_URL =
  "https://api.dexscreener.com/latest/dex/search/?q=solana";

// Telegram bot setup
const stage = new Scenes.Stage([registerScene, Currency, Withdraw]);
const bot = new Telegraf(BOT_TOKEN);
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
// Withdraw
bot.action("NEW_PAIRS", async (ctx) => {
  let lastTimestamp = Date.now(); // Hozirgi vaqt bilan lastTimestamp ni boshlaymiz

  try {
    const url = `${DEXSCREENER_API_BASE_URL}`;

    const response = await axios.get(url);
    const pairs = response.data;
    // console.log(pairs, "PAIRS");

    let message = `New Pairs\n\n`;

    // Extract and process "new" pairs
    const newPairs = pairs.pairs.filter((pair) => pair.pairCreatedAt > 0);

    if (newPairs) {
      for (let i = 0; i < 1; i++) {
        // for (let i = 0; i < newPairs.length; i++) {
        let pair = newPairs[i];
        const formattedData = `\*${pair.baseToken.name || ""} *\ 🔁  ${
          pair.quoteToken.name || ""
        }\n`;
        // pair = (await pair) || {};

        message +=
          formattedData +
          `URL: [Link](${pair.url})\ \n` +
          `Pair Address: \`${pair.pairAddress || "❌"}\` \n` +
          `Price Native: \*${pair.priceNative || "❌"} ${
            pair.baseToken.symbol
          }\* \n` +
          `Price Usd : \*${pair.priceUsd || "❌"} $ *\ \n` +
          `Pair created at : \*${pair.pairCreatedAt || "❌"}\* \n` +
          `([Quick buy](https://t.me/${BOT_USERNAME})) \ \n` +
          // `([Quick buy](https://dexscreener.com/bsc/${pair.pairAddress})) \ \n` +
          `\n`;

        // Update `lastTimestamp` for future checks
        lastTimestamp = Math.max(lastTimestamp, pair.pairCreatedAt);
      }

      ctx.reply(
        message,
        //
        { disable_web_page_preview: true, parse_mode: "Markdown" }
      );
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

bot.action("SETTINGS_SOLANA", async (ctx) => {
  await ctx.deleteMessage();
  ctx.reply("SETTINGS", settingCommands);
});

bot.on("video", (ctx) => {
  console.log(ctx.update.message.video.file_id);
  ctx.reply(ctx.update.message.video.file_id);
});
// stage

bot.command("withdraw", (ctx) => {
  ctx.scene.enter("WITHDRAW");
});
bot.command("currency", (ctx) => {
  // ctx.reply("enter the amaunt");
  solToUsd(1).then((price) => {
    if (price !== null) {
      console.log("SOL to USD Price:", price);
    } else {
      console.log("Failed to fetch SOL to USD price.");
    }
  });
  // ctx.scene.enter("CURRENCY");
});

//buy

async function buySol(amount, price) {
  const endpoint = "https://api.solana.com/v1/orders";

  const payload = {
    amount,
    price,
    side: "buy",
    market: "SOL/USD", // Or another market pair
  };

  try {
    const response = await axios.post(endpoint, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error buying SOL:", error.response.data);
    throw new Error("Failed to buy SOL");
  }
}

bot.command("buy_sol", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1); // Get command arguments
  if (args.length !== 2) {
    return ctx.reply("Invalid command. Use /buy_sol <amount> <price>");
  }

  const amount = parseFloat(args[0]);
  const price = parseFloat(args[1]);

  if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) {
    return ctx.reply("Invalid amount or price. Please enter valid numbers.");
  }

  try {
    const order = await buySol(amount, price);
    ctx.reply(
      `Buy order placed for ${amount} SOL at $${price}. Order ID: ${order.id}`
    );
  } catch (error) {
    ctx.reply("Failed to place buy order. Please try again later.");
  }
});
bot.command('buy', async (ctx) => {
  const tokenSymbolOrAddress = ctx.message.text.split(' ')[1]; // Get the second word after /buy

  if (!tokenSymbolOrAddress) {
    ctx.reply('Please provide a token symbol or address to buy.');
    return;
  }

  try {
    const response = await axios.get(`https://api.solana.com/v1/orders?token=${tokenSymbolOrAddress}`);

    const orders = response.data;
    // Process orders as needed
    ctx.reply(`Fetched orders for ${tokenSymbolOrAddress}: ${JSON.stringify(orders)}`);
  } catch (error) {
    console.error('Error fetching orders:', error);
    ctx.reply('Error fetching orders. Please try again later.');
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

// Error handling and logging
bot.on("error", (error) => console.error("Error:", error));
// const stage = new Scenes.Stage([wizardScene, getSMSCodScene, getAll]);

// Bot launch
bot.launch();
console.log("Bot started successfully!");
