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
            text: "New pairs ✳️",
            callback_data: "NEW_PAIRS",
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
  settingCommands: {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Buy Settings",
            callback_data: "SELL_SETTINGS",
          },
          {
            text: "Sell Settings",
            callback_data: "BUY_SETTINGS",
          },
        ],
        [
          {
            text: "🔴 Auto Buy",
            callback_data: "AUTO_BUY",
          },
          {
            text: "🔴 Auto Sell",
            callback_data: "AUTO_SELL",
          },
        ],
        [
          {
            text: "Wallets",
            callback_data: "WALLETS",
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
