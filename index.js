const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");

// Replace with your bot token
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false }); // Set polling to false for webhook mode

// Express server setup
const app = express();
app.use(bodyParser.json());

// Define the packages
const packages = {
  signal: {
    price: 50,
    wallet: "WALLET_ADDRESS_FOR_SIGNAL",
  },
  mentorship: {
    price: 200,
    wallet: "WALLET_ADDRESS_FOR_MENTORSHIP",
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
  bot.sendMessage(
    msg.chat.id,
    `You chose the signal package. Please pay $${packageInfo.price} to wallet ${packageInfo.wallet}.`
  );
});

// Mentorship package command
bot.onText(/\/mentorship/, (msg) => {
  const packageInfo = packages.mentorship;
  bot.sendMessage(
    msg.chat.id,
    `You chose the mentorship package. Please pay $${packageInfo.price} to wallet ${packageInfo.wallet}.`
  );
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
