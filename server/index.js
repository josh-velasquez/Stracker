const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const serverPort = 6060;
const AUTOMATED_NOTIFICATION_INTERVAL = 20;

const config = require("./config.json");
const email = config.automatedEmail;
const password = config.automatedEmailPassword;
const transporter = nodemailer.createTransport({
  service: "gmail",
  type: "OAuth2",
  auth: {
    user: email,
    pass: password,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  },
});

const dir = path.join(__dirname, "public");

var userNotifications = [
  {
    email: "test@email.com",
    stock: "AMD",
    low: 99,
    high: 130,
  },
];

app.get("/", (_, res) => {
  res.sendFile(dir + "/index.html");
});

//#region Setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(dir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//#endregion

//#region Email notifier
cron.schedule(`${AUTOMATED_NOTIFICATION_INTERVAL} * * * *`, () => {
  if (email === "" || password === "") {
    return;
  }
  console.log("Sending automated email notifications.");
  automatedEmailNotification();
});

async function automatedEmailNotification() {
  var usersToNotify = [];
  for (const user of userNotifications) {
    try {
      var result = await shouldBeNotified(user.low, user.high, user.stock);
      if (result.notify) {
        usersToNotify.push({
          email: user.email,
          stock: user.stock,
          message: result.message,
        });
      }
    } catch (ex) {
      console.log("Failed to notify users.");
    }
  }
  usersToNotify.forEach((users) => {
    notifyUsers(users);
  });
}

function shouldBeNotified(low, high, symbol) {
  var options = {
    method: "GET",
    url: yhFinanceApiRootUrl + "/stock/v2/get-summary",
    params: { symbol: symbol, region: "US" },
    headers: {
      "x-rapidapi-host": yhFinanceHost,
      "x-rapidapi-key": yhFinanceApiKey,
    },
  };
  return axios
    .request(options)
    .then((response) => {
      return generateNotificationMessage(response.data, low, high);
    })
    .catch((error) => {
      return {
        notify: false,
        message: "Error retrieving information: " + error,
      };
    });
}

function generateNotificationMessage(data, low, high) {
  var currentPrice = parseFloat(data.price.regularMarketPrice.raw);
  var notify = false;
  var message = "Current stock price: " + currentPrice + "\n";
  if (low !== null) {
    if (low < currentPrice) {
      notify = true;
      message +=
        "This stock is lower than your target price.\n" +
        "Your target price: " +
        low +
        "\n";
    }
  }
  if (high !== null) {
    if (high > currentPrice) {
      notify = true;
      message +=
        "This stock is higher than your target price.\n" +
        "Your target price: " +
        high +
        "\n";
    }
  }
  return { notify: notify, message: message };
}

function notifyUsers(usersToNotify) {
  var message =
    "Hello!\nWe have an update regarding the stock: " +
    usersToNotify.stock +
    "\n" +
    usersToNotify.message +
    "\n\nRegards, \nStracker Team";
  var mail = {
    from: email,
    to: usersToNotify.email,
    subject: "Project Stracker - Automated Email: Stock Update",
    text: message,
  };
  transporter.sendMail(mail, (error, _) => {
    if (error) {
      console.log("Failed to send email: " + error);
    } else {
      console.log("Notification email sent.");
    }
  });
}
//#endregion

//#region Email sender
app.post("/notifications/email", (req, res) => {
  console.log("Server Request: Email Notification");
  var userEmail = req.body.email;
  var stock = req.body.stock;
  var lowAmount = req.body.low !== null ? parseFloat(req.body.low) : null;
  var highAmount = req.body.high !== null ? parseFloat(req.body.high) : null;
  var message =
    "Hello!\nThank you for registering!" +
    "\nYou will receive notifications regarding: " +
    stock;
  if (lowAmount !== null) {
    message += "\nLow for: " + lowAmount;
  }
  if (highAmount !== null) {
    message += "\nHigh for: " + highAmount;
  }

  message += "\n\nRegards,\nStracker Team";

  var mail = {
    from: email,
    to: userEmail,
    subject: "Project Stracker - Automated Email",
    text: message,
  };
  try {
    transporter.sendMail(mail, (error, _) => {
      if (error) {
        res.status(500).send("Failed to send email: " + error);
      } else {
        res.status(200).send("Email sent.");
        addUserNotification({ userEmail, stock, lowAmount, highAmount });
      }
    });
  } catch (ex) {
    res.status.send("Failed to register notification. Exception: " + ex);
  }
});

function addUserNotification(userInfo) {
  userNotifications.push({
    email: userInfo.userEmail,
    stock: userInfo.stock,
    low: userInfo.lowAmount,
    high: userInfo.highAmount,
  });
}
//#endregion

//#region Yahoo Finance
const yhFinanceApiRootUrl = "https://yh-finance8.p.rapidapi.com";
const yhFinanceHost = "yh-finance8.p.rapidapi.com";
const yhFinanceApiKey = config.yhFinanceApiKey;

const sampleApplePayload = {
  symbol: "AAPL",
  price: {
    shortName: "Apple Inc.",
    regularMarketPrice: {
      raw: "$2342.00",
    },
    regularMarketOpen: {
      raw: "$12123123.00",
    },
    exchangeName: "AAPL",
  },
  summaryProfile: {
    longBusinessSummary:
      "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts. In addition, the company offers various services, such as Apple Arcade, a game subscription service; Apple Fitness+, a personalized fitness service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a cashless payment service, as well as licenses its intellectual property. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It distributes third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was founded in 1976 and is headquartered in Cupertino, California.",
  },
};

app.get("/yhfinance/stocks/summary", (req, res) => {
  console.log("Server Request: Yahoo Finance Summary");
  var symbol = req.query.symbol.toUpperCase();
  var options = {
    method: "GET",
    url: yhFinanceApiRootUrl + "/stock/get_summary",
    params: { symbol: symbol, region: "US" },
    headers: {
      "x-rapidapi-host": yhFinanceHost,
      "x-rapidapi-key": yhFinanceApiKey,
    },
  };
  res.status(200).send(sampleApplePayload);
  // axios
  //   .request(options)
  //   .then((response) => {
  //     res.status(200).send(response.data.message);
  //   })
  //   .catch((error) => {
  //     console.error(error.response.data.message);
  //   });
});

//#endregion

//#region Alpha Vantage API

const alphaVantageApiRootUrl = "https://www.alphavantage.co";
const alphaVantageApiKey = config.alphaVantageApiKey;

app.get("/", (_, res) => {
  return res.status(200).send("Live");
});

//#endregion

//#region Crypto
const CRYPTO_WATCH = ["BTC", "ETH", "SHIB", "DOGE"];

const CRYPTO_FUNCTIONS = {
  CURRENCY_EXCHANGE_RATE: "CURRENCY_EXCHANGE_RATE",
};

app.get("/alphavantage/crypto/add-watch", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  // check if req.query.symbol is valid
  CRYPTO_WATCH.push(symbol);
});

app.delete("/alphavantage/crypto/delete-watch", (_, res) => {});

app.get("/alphavantage/crypto/currency-exchange-rate", (req, res) => {
  console.log("Server Request: Alpha Vantage Summary");
  var fromCurrency = req.query.fromCurrency.toUpperCase();
  var toCurrency = req.query.toCurrency.toUpperCase();
  console.log(
    "Server Request (CRYPTO): Currency_Exchange_Rate=" +
      fromCurrency +
      " to " +
      toCurrency
  );
  var url = buildExchangeRateUrl(
    CRYPTO_FUNCTIONS.CURRENCY_EXCHANGE_RATE,
    fromCurrency,
    toCurrency
  );
  axios.get(url).then((clientRes) => {
    res.status(200).send(clientRes.data);
  });
});

//#endregion

//#region Stocks

var STOCKS_WATCH = [];

const STOCKS_FUNCTION = {
  TIME_SERIES_INTRADAY: "TIME_SERIES_INTRADAY",
  TIME_SERIES_DAILY_ADJUSTED: "TIME_SERIES_DAILY_ADJUSTED",
  GLOBAL_QUOTE: "GLOBAL_QUOTE",
};

app.put("/alphavantage/stocks/add-watch/", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  // check if req.query.symbol is valid
  STOCKS_WATCH.push(symbol);
});

app.delete("/alphavantage/stocks/delete-watch", (req, res) => {
  // delete from stocks watch
});

app.get("/alphavantage/stocks/list-all", (req, res) => {
  // list all stocks here
});

app.get("/alphavantage/stocks/daily-adjusted", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  console.log("Server Request (STOCK): Daily_Adjusted=" + symbol);
  var url = buildStocksUrl(STOCKS_FUNCTION.TIME_SERIES_DAILY_ADJUSTED, symbol);
  axios.get(url).then((clientRes) => {
    res.status(200).send(clientRes.data);
  });
});

app.get("/alphavantage/stocks/intraday", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  console.log("Server Request (STOCK): Intraday=" + symbol);
  var url = buildStocksUrl(STOCKS_FUNCTION.TIME_SERIES_INTRADAY, symbol);
  axios.get(url).then((clientRes) => {
    res.status(200).send(clientRes.data);
  });
});

app.get("/alphavantage/stocks/global-quote", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  console.log("Server Request (STOCK): Global_Quote=" + symbol);
  var url = buildStocksUrl(STOCKS_FUNCTION.GLOBAL_QUOTE, symbol);
  axios.get(url).then((clientRes) => {
    res.status(200).send(clientRes.data);
  });
});

function buildStocksUrl(
  queryFunction,
  symbol,
  interval = "1min",
  adjusted = true,
  outputsize = "compact",
  datatype = "json"
) {
  var url =
    alphaVantageApiRootUrl +
    "/query?" +
    "function=" +
    queryFunction +
    "&symbol=" +
    symbol +
    "&interval=" +
    interval +
    "&adjusted=" +
    adjusted +
    "&outputsize=" +
    outputsize +
    "&datatype=" +
    datatype +
    "&apikey=" +
    alphaVantageApiKey;
  return url;
}

function validateTicker(ticker) {}

function buildExchangeRateUrl(queryFunction, fromCurrency, toCurrency) {
  var url =
    alphaVantageApiRootUrl +
    "/query?" +
    "function=" +
    queryFunction +
    "&from_currency=" +
    fromCurrency +
    "&to_currency=" +
    toCurrency +
    "&apikey=" +
    alphaVantageApiKey;
  return url;
}

//#endregion

app.listen(serverPort, () => {
  console.log(`Server is running at ${serverPort}`);
});
