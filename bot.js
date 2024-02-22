const { Telegraf, Markup, session, Scenes } = require("telegraf");
const solanaWeb3 = require("@solana/web3.js");
const db = require("./modules/db");
const crypto = require("crypto");
const commands = require("./modules/commands");
const registerScene = require("./modules/scenes/register");
const User = require("./modules/models/User");
const { default: mongoose } = require("mongoose");

require("dotenv/config");

// Solana configuration (replace with your actual values)
const solanaEndpoint = "https://api.mainnet-beta.solana.com";
const connection = new solanaWeb3.Connection(solanaEndpoint);
const solanaTokenLink = "https://solscan.io/account";

// Telegram bot setup
const stage = new Scenes.Stage([registerScene]);
const bot = new Telegraf(process.env.BOT_TOKEN);
db();

bot.use(session());
bot.use(stage.middleware());

async function createUser(userId, publicKey, secretKey) {
  try {
    // 1. Validate input data:
    if (!userId || !publicKey || !secretKey) {
      throw new Error(
        "Missing required user data: userId, publicKey, secretKey"
      );
    }

    // 2. Check for existing user before creating:
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      throw new Error(`User with ID ${userId} already exists`);
    }

    // 3. Hash secret key before storing (recommended for security):
    const salt = crypto.randomBytes(16).toString("hex");

    const newUser = new User({
      userId,
      publicKey,
      secretKey,
      salt,
    });
    await newUser.save();
    console.log(`New user created with ID: ${userId}`);

    // 5. Return user information (with sensitive data excluded):
    const safeUser = {
      userId,
      publicKey, // Include for convenience, but avoid displaying publicly
      // Omit hashedSecretKey and salt
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
        newAccount.publicKey.toBase58(),
        newAccount.secretKey.toString("hex")
      ); // Store secret key securely (encrypt or hash)
      console.log(`New user created with ID: ${userId}`);
      return newUser;
    }

    return user.toObject(); // Convert Mongoose document to POJO
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Re-throw for proper error handling
  }
}
// Start command
bot.command("start", async (ctx) => {
  try {
    // Handle existing user or create a new one
    const userId = ctx.update.message.from.id;
    let user = await getUser(userId);

    console.log(newAccount);

    if (newAccount) {
      const newAccountPublicKeyS = newAccount.publicKey.toJSON;
      ctx.session.NEWACKOUNTPUBLICKEY = newAccountPublicKeyS;
      console.log(ctx.session.NEWACKOUNTPUBLICKEY, "publicKeySSS");
      console.log(newAccountPublicKeyS.length, "publicKeySSS len");
      // Check if the user already exists
      if (!user) {
        // Create a new Solana account and user entry
        const newAccount = solanaWeb3.Keypair.generate();
        await createUser(
          userId,
          newAccount.publicKey.toString(), // Use toString() directly
          newAccount.secretKey.toString("hex")
        ); // Store secret key securely
        user = await getUser(userId);
      }

      const secretKey = user.secretKey;

      console.log(secretKey, "secret key");
      console.log(secretKey.length, "secret key length");

      // Use publicKey directly
      const newAccount = user.publicKey.toString();

      console.log(newAccount, "New Account");

      // Fetch account balance (replace with actual balance update logic)
      const accountBalance = await connection.getBalance(user.publicKey);

      const response = `**Welcome to Solana Bot!**\n\nHere's your Solana wallet address linked to your Telegram account:\n\n<b>Solana · </b><a href=${
        user.publicKey
      }/${user.publicKey}>🅴</a>\n<code>${
        user.publicKey
      }</code> (Tap to copy)\n\nBalance: <code>${accountBalance} SOL</code>\n\nClick on the Refresh button to update your current balance.\n\n${commands.startCommands.join(
        "\n"
      )}`;

      ctx.replyWithHTML(response, commands.startCommands);
    }
  } catch (error) {
    console.error("Error creating user or fetching balance:", error);
    ctx.reply("An error occurred. Please try again later.");
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

// Bot launch
bot.launch();
console.log("Bot started successfully!");
