const commands = {
  startCommands: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Sell 〽️",
            callback_data: "SELL_SOLANA",
          },
          {
            text: "Buy ❇️",
            callback_data: "BUY_SOLANA",
          },
        ],
        [
          {
            text: "Tokens ✳️",
            callback_data: "TOKENS_SOLANA",
          },
          {
            text: "Withdraw 📉",
            callback_data: "WITHDRAW_SOLANA",
          },
        ],
        [
          {
            text: "Settings ⚙️",
            callback_data: "SETTINGS_SOLANA",
          },
          {
            text: "Help 🆘",
            callback_data: "HELP",
          },
          {
            text: "Update 🔄",
            callback_data: "UPDATE_BOT",
          },
        ],
      ],
    },
  },


  backMainCommands: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⟵",
            callback_data: "BACK_MAIN_MENU",
          },
        ],
      ],
    },
  },
};

//   🅴
module.exports = commands;
