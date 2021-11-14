const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const axios = require("axios");
const serverPort = 6060;

//#region Setup
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const config = require("./config.json");

const dir = path.join(__dirname, "public");
app.use(express.static(dir));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//#endregion

app.get("/", (req, res) => {
  res.sendFile(dir + "/index.html");
});

//#region Yahoo Finance

const yhFinanceApiRootUrl = "https://yh-finance.p.rapidapi.com";
const yhFinanceHost = "yh-finance.p.rapidapi.com";
const yhFinanceApiKey = config.yhFinanceApiKey;

app.get("/yhfinance/stocks/summary", (req, res) => {
  var symbol = req.query.symbol.toUpperCase();
  var options = {
    method: "GET",
    url: yhFinanceApiRootUrl + "/stock/v2/get-summary",
    params: { symbol: symbol, region: "US" },
    headers: {
      "x-rapidapi-host": yhFinanceHost,
      "x-rapidapi-key": yhFinanceApiKey,
    },
  };

  axios
    .request(options)
    .then((response) => {
      res.status(200).send(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
});

//#endregion

//#region Alpha Vantage API

const alphaVantageApiRootUrl = "https://www.alphavantage.co";
const alphaVantageApiKey = config.alphaVantageApiKey;

app.get("/", (_, res) => {
  return res.status(200).send("Live");
});

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
