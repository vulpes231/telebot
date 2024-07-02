const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const Orders = require("./models/orders.json");

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

const saveOrder = (order) => {
  Orders.push(order);
  fs.writeFile("./models/orders.json", JSON.stringify(Orders), (err) => {
    if (err) {
      console.error("Error writing orders file:", err);

      bot.sendMessage(
        order.userId,
        "There was an error creating your order. Please try again later."
      );
    } else {
      console.log("Order saved successfully.");
    }
  });
};

// Handle /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Choose a package: /rdp or /cpanel");
});

bot.onText(/\/rdp/, (msg) => {
  const packageOptions = [
    { command: "/small", label: "Small" },
    { command: "/medium", label: "Medium" },
    { command: "/large", label: "Large" },
    { command: "/xlarge", label: "X-Large" },
  ];

  const optionsMessage = packageOptions
    .map((option) => `${option.command}: ${option.label}`)
    .join("\n");
  bot.sendMessage(msg.chat.id, `Choose an RDP package:\n${optionsMessage}`);
});

// Handle /cpanel command
bot.onText(/\/cpanel/, (msg) => {
  bot.sendMessage(msg.chat.id, "cPanel options will be implemented soon.");
  // Implement cPanel options if needed
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  if (
    messageText.startsWith("/small") ||
    messageText.startsWith("/medium") ||
    messageText.startsWith("/large") ||
    messageText.startsWith("/xlarge")
  ) {
    const selectedCommand = messageText.split(" ")[0];
    const selectedPackage = selectedCommand.replace("/", ""); // Remove the leading slash

    const rdpDetails = rdps[selectedPackage];

    if (rdpDetails) {
      const orderId = `00${msg.chat.id}`; // Simulated order ID generation
      const orderDetails = {
        orderId: orderId,
        userId: msg.chat.id,
        package: rdpDetails.size,
        price: rdpDetails.price,
        status: "pending",
      };

      // Save order to JSON (simulated database)
      saveOrder(orderDetails);
      bot.sendMessage(
        chatId,
        `You selected ${selectedPackage}: ${rdpDetails.size} - $${rdpDetails.price}. Confirm your order?`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Yes", callback_data: `confirm_${selectedPackage}` },
                { text: "No", callback_data: "cancel" },
              ],
            ],
          },
        }
      );
    } else {
      bot.sendMessage(chatId, "Invalid RDP package selection.");
    }
  }
});

bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data.startsWith("confirm_")) {
    const selectedPackage = data.replace("confirm_", "");
    const rdpDetails = rdps[selectedPackage];

    if (rdpDetails) {
      // Show payment options
      const paymentOptions = [
        { command: "/btc", label: "Pay with BTC" },
        { command: "/naira", label: "Pay with Naira (Opay)" },
        { command: "/eth", label: "Pay with ETH" },
      ];

      const optionsMessage = paymentOptions
        .map((option) => `${option.command}: ${option.label}`)
        .join("\n");
      bot.sendMessage(chatId, `Select a payment option:\n${optionsMessage}`);
    } else {
      bot.sendMessage(chatId, "Invalid selection.");
    }
  } else if (data === "cancel") {
    bot.sendMessage(
      chatId,
      "Order canceled. Choose a package: /rdp or /cpanel"
    );
  }

  // Answer callback query to remove the inline keyboard prompt
  bot.answerCallbackQuery(callbackQuery.id);
});

bot.onText(/btc/, (msg) => {
  bot.sendMessage(msg.chat.id, `Wallet Address: 3Fab05ghslamdhdsykk9ywzx`);
});

bot.onText(/eth/, (msg) => {
  bot.sendMessage(msg.chat.id, `8125100200 John Doe (GTB)`);
});

bot.onText(/naira/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Wallet Address: 0xab6db5Eb6BDcA184Cb13D697D0dE377D3f0F023A `
  );
});

bot.onText(/paid/, (msg) => {
  const orderId = `00${msg.chat.id}`;

  bot.sendMessage(
    msg.chat.id,
    `Order pending. Your order ID is: ${orderId}. check status with /status`
  );
});

bot.onText(/\/status/, (msg) => {
  const orderId = `00${msg.chat.id}`;
  const order = Orders.find((order) => order.orderId === orderId);

  if (order) {
    bot.sendMessage(msg.chat.id, `Your order is ${order.status}`);
  } else {
    bot.sendMessage(msg.chat.id, "Order not found.");
  }
});

// Webhook setup
const setWebhook = async () => {
  // const webhookUrl = `https://telebot-wf5l.onrender.com/${token}`;
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
  console.log(`Server is running on port http://localhost:${PORT}`);
  setWebhook();
});
