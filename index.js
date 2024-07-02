const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");

// Replace with your bot token
const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: false });

// Express server setup
const app = express();
app.use(bodyParser.json());

const rdps = {
  small: {
    price: 15,
    size: "2gb",
    duration: "1 month",
    renewable: true,
  },
  medium: {
    price: 20,
    size: "2gb",
    duration: "1 month",
    renewable: true,
  },
  large: {
    price: 30,
    size: "8gb",
    duration: "1 month",
    renewable: true,
  },
  xlarge: {
    price: 50,
    size: "16gb",
    duration: "1 month",
    renewable: true,
  },
};

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Choose a package: /rdp or /cpanel");
});

// Handle /rdp command
bot.onText(/\/rdp/, (msg) => {
  const rdpOptions = Object.keys(rdps)
    .map((key) => {
      const rdp = rdps[key];
      return `${key}: ${rdp.size} - $${rdp.price}`;
    })
    .join("\n");

  bot.sendMessage(msg.chat.id, `Choose an RDP package:\n${rdpOptions}`);
});

// Handle /cpanel command
bot.onText(/\/cpanel/, (msg) => {
  bot.sendMessage(msg.chat.id, "cPanel options will be implemented soon.");
  // Implement cPanel options if needed
});

// Handle user messages
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (messageText.startsWith("/rdp")) {
    const selectedPackage = messageText.replace("/rdp ", "");
    const rdpDetails = rdps[selectedPackage];

    if (rdpDetails) {
      bot.sendMessage(
        chatId,
        `You selected ${selectedPackage}: ${rdpDetails.size} - $${rdpDetails.price}. Confirm your order? (Yes/No)`
      );
      // Store user state for confirmation
      // Implement logic to handle user response (Yes/No)
    } else {
      bot.sendMessage(chatId, "Invalid RDP package selection.");
    }
  }

  // Implement logic for cPanel selections if /cpanel commands are extended
});

// Handle 'Paid' button click
bot.onText(/Paid/, (msg) => {
  // Implement logic to mark payment as received and generate order ID
  const orderId = "123456"; // Dummy order ID, replace with actual generation logic
  bot.sendMessage(msg.chat.id, `Order pending. Your order ID is: ${orderId}`);
});

// Handle /status command
bot.onText(/\/status/, (msg) => {
  // Implement logic to retrieve order status based on order ID (stored in a database)
  const orderId = ""; // Retrieve order ID from user input or database
  const orderStatus = ""; // Retrieve order status from database
  bot.sendMessage(msg.chat.id, `Order ID: ${orderId}\nStatus: ${orderStatus}`);
});

// Webhook setup
const setWebhook = async () => {
  const webhookUrl = `https://telebot-wf5l.onrender.com/${token}`;
  await bot.setWebHook(webhookUrl);
  console.log(`Webhook set to ${webhookUrl}`);
};

// Listen to incoming updates via Express
app.post("/" + token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setWebhook();
});
