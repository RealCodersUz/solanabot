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
            text: "Update 🔄",
            callback_data: "UPDATE_BOT",
          },
        ],
      ],
      //   🅴
      //   resize_keyboard: true,
      //   one_time_keyboard: true,
    },
  },
};

module.exports = commands;
