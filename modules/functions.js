// GET https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd

const {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  Connection,
} = require("@solana/web3.js");
const { default: axios } = require("axios");
const User = require("./models/User");
require("dotenv").config();

let solToUsd = async (count) => {
  const apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd`;
  try {
    const response = await axios.get(apiUrl);
    const price = response.data;
    // console.log(response.data);
    console.log(price.solana.usd * count);
    return price.solana.usd * count;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
// const bot = new Telegraf(process.env.BOT_TOKEN); 

const connection = new Connection("https://api.devnet.solana.com");

let withdrawFunc = async (msg, userid, recipients_pub_key) => {
  console.log("Function called");
  const text = msg;
  const args = text.split(" ");

  if (args.length !== 2) {
    console.log("Invalid command. Use /withdraw <amount>");
    return; 
  }

  const amount = parseFloat(args[1]);

  if (isNaN(amount) || amount <= 0) {
    console.log("Invalid amount. Please enter a valid number greater than 0");
    return;
  }

  try {
    let user = await User.findOne({ userId: userid }); // Wait for the user to be found

    if (!user) {
      console.log("User not found");
      return;
    }

    if (!user.secretKey) {
      console.log("User secret key not found");
      return;
    }

    const fromPublicKey = Keypair.fromSecretKey(
      Buffer.from(user.secretKey, "base64")
    ).publicKey;
    const toPublicKey = new PublicKey(recipients_pub_key);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports: amount * 10 ** 9, // converting SOL to lamports (1 SOL = 10^9 lamports)
      })
    );

    const signature = await connection.sendTransaction(transaction, [
      Keypair.fromSecretKey(Buffer.from(user.secretKey, "base64")),
    ]);

    console.log("Transaction sent:", signature);
    console.log(`Withdrawal of ${amount} SOL successful. Tx: ${signature}`);
  } catch (error) {
    console.error("Error sending transaction:", error);
    console.log("Withdrawal failed. Please try again later.");
  }
};

// () => {
//   fetch("https://api.coingecko.com/api/v3/simple/price?ids=&vs_currencies=usd")
//     .then((response) => {
//       response.json();
//       console.log(response, "response");
//     })
//     .then((data) => {
//       //   let priceInUsd = data.solana.usd;
//       //   console.log(priceInUsd, "priceInUsd");
//       console.log(data, "data");
//       //   document.getElementById(
//       //     "sol-to-usd"
//       //   ).innerHTML = `1 SOL  = $${priceInUsd}`;
//     });
//};
module.exports = { solToUsd, withdrawFunc };
// Call the function initially to display the price when the page loads
// solToUsd();

// Update every minute in case prices change
// setInterval(solToUsd
// };
