const commands = {
  startCommands: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Sotish 〽️",
            callback_data: "SELL_SOLANA",
          },
          {
            text: "Sotib olish ❇️",
            callback_data: "BUY_SOLANA",
          },
        ],
        [
          {
            text: "Tokenlar ✳️",
            callback_data: "TOKENS_SOLANA",
          },
          {
            text: "Chiqarib olish 📉",
            callback_data: "WITHDRAW_SOLANA",
          },
        ],
        [
          {
            text: "Sozlamalar ⚙️",
            callback_data: "SETTINGS_SOLANA",
          },
          {
            text: "Yangilash 🔄",
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
