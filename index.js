const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");

// Replace with your bot token
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// Express server setup
const app = express();
app.use(bodyParser.json());

// Define the packages
const packages = {
  signal: {
    price: 50,
    wallet: {
      usdt: "0x59a7C8b85Ea3d4f2056dae28343d1538C87FF63A",
      btc: "3LotQGWvGvjKbTszKs3PQBeQhbCeLxqnS1",
      eth: "0x59a7C8b85Ea3d4f2056dae28343d1538C87FF63A",
    },
  },
  mentorship: {
    price: 200,
    wallet: {
      usdt: "0x59a7C8b85Ea3d4f2056dae28343d1538C87FF63A",
      btc: "3LotQGWvGvjKbTszKs3PQBeQhbCeLxqnS1",
      eth: "0x59a7C8b85Ea3d4f2056dae28343d1538C87FF63A",
    },
  },
};

// Start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Welcome! Choose a package: /signal or /mentorship"
  );
});

// Signal package command
bot.onText(/\/signal/, (msg) => {
  const packageInfo = packages.signal;
  const responseMessage = `
You chose the signal package. Please pay $${packageInfo.price} to one of the following wallets:
USDT: ${packageInfo.wallet.usdt}
BTC: ${packageInfo.wallet.btc}
ETH: ${packageInfo.wallet.eth}
  `;
  bot.sendMessage(msg.chat.id, responseMessage);
});

// Mentorship package command
bot.onText(/\/mentorship/, (msg) => {
  const packageInfo = packages.mentorship;
  const responseMessage = `
You chose the mentorship package. Please pay $${packageInfo.price} to one of the following wallets:
USDT: ${packageInfo.wallet.usdt}
BTC: ${packageInfo.wallet.btc}
ETH: ${packageInfo.wallet.eth}
  `;
  bot.sendMessage(msg.chat.id, responseMessage);
});

// Express webhook route
app.post("/" + token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Set webhook
const setWebhook = async () => {
  const webhookUrl = `https://telebot-wf5l.onrender.com/${token}`; // Use https for secure communication
  await bot.setWebHook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
};

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setWebhook();
});
