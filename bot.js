const { Telegraf, Markup, session, Scenes } = require("telegraf");
const solanaWeb3 = require("@solana/web3.js");
const db = require("./modules/db");
const crypto = require("crypto");
const fs = require("fs");
const { startCommands } = require("./modules/commands");
const registerScene = require("./modules/scenes/register");
const User = require("./modules/models/User");
const { Connection } = require("mongoose");

require("dotenv/config");

// Solana configuration (replace with your actual values)
const solanaEndpoint = "https://api.mainnet-beta.solana.com";
const connection = new solanaWeb3.Connection(solanaEndpoint);
const solanaTokenLink = "https://solscan.io/account/";

// Telegram bot setup
const stage = new Scenes.Stage([registerScene]);
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

    if (!user) {
      // Create a new Solana account and user entry
      const newAccount = solanaWeb3.Keypair.generate();
      const newUser = await createUser(
        userId,
        newAccount.publicKey.toString(),
        newAccount.secretKey.toString("hex")
      ); // Store secret key securely (e.g., encrypt or hash)
      console.log(`New user created with ID: ${userId}`);
      return newUser;
    }

    return user.toObject(); // Convert Mongoose document to POJO (omitting sensitive data)
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
    }

    const secretKey = user.secretKey;

    // console.log(secretKey, "secret key");
    // console.log(secretKey.length, "secret key length");

    const newAccount = new solanaWeb3.PublicKey(user.publicKey);

    const balance = await getSolanaAccountBalance(connection, user.publicKey);
    console.log("Solana Account Balance:", balance);

    // Update accountBalance with the retrieved balance
    let accountBalance = balance;

    ctx.replyWithMarkdown(
      `\*Welcome to Solana Bot!\*\n\nIntroducing a cutting-edge bot crafted exclusively for Solana Traders. Trade any token instantly right after launch.\n\nHere's your Solana wallet address linked to your Telegram account.\nSimply fund your wallet and dive into trading.\n\n\*Solana ·\* [🅴](${solanaTokenLink}${user.publicKey}) \n\`${user.publicKey}\` (Tap to copy)\nBalance: \`${accountBalance} SOL\`\n\nClick on the Refresh button to update your current balance.
     `,
      {
        disable_web_page_preview: true,
        ...startCommands,
      }
    );
    // const fileUrl = await ctx.telegram.getFileLink(
    //   "BAACAgEAAxkBAAPEZdoMRlM_TIhw_hNtYEUejxzHyv8AAh8EAALpPtBGiGYH5cr1Wxw0BA"
    // );
    // console.log(fileUrl.href, "fileUrl");
    // const videoStream = fs.createReadStream("./public/start.mp4");
    ctx.replyWithVideo(
      "https://api.telegram.org/file/bot5213173477:AAHUWE0tMByX0Qp83EIngdnEgVmwTTIf5Y4/videos/file_0.mp4"
    );
    // ctx.telegram.sendVideo(userId, "./public/start.mp4", {
    //   caption: "caption",
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         {
    //           text: "buttonText",
    //           url: "https://example.com",
    //         },
    //       ],
    //     ],
    //   },
    // });

    let startMessage = `**Welcome to Solana Bot!**\n\nHere's your Solana wallet address linked to your Telegram account:\n\n<b>Solana · </b> <a href=${solanaTokenLink}/${user.publicKey}>🅴</a>\n<code>${user.publicKey}</code> (Tap to copy)\n\nBalance: <code>${accountBalance} SOL</code>\n\nClick on the Refresh button to update your current balance.`;

    // ctx.reply(startMessage, startCommands);
  } catch (error) {
    console.error("Error creating user or fetching balance:", error);
    ctx.reply("An error occurred. Please try again later.");
  }
});
bot.on("video", async (ctx) => {
  const fileId = ctx.message.video.file_id;
  console.log(fileId);

  try {
    console.log(fileUrl);
    console.log(fileId, "fileId");
  } catch (err) {
    console.log(`Got an error while`);
  }
});
// actions
bot.action("BUY_SOLANA", async (ctx) => {
  ctx.reply("Enter a token symbol or address to buy");
  // if (!warningWords.includes(ctx.update.message?.text)) return;
});
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

// Bot launch
bot.launch();
console.log("Bot started successfully!");
