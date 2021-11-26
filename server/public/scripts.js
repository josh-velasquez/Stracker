const rootUrl = "http://localhost:6060/"

function yahooFinanceClick() {
    console.log("Yahoo Finance");
    const yahooFinanceUrl = rootUrl + "yhfinance/stocks/summary/?symbol=";
    var tickerSymbol = document.getElementById("tickerSymbol").value;
    var completeUrl = yahooFinanceUrl + tickerSymbol;
    sendRequest(completeUrl);
}

function alphaVantageClick() {
    console.log("Alpha Vantage")
    const alphaVantageUrl = rootUrl + "alphavantage/stocks/daily-adjusted/?symbol=";
    var tickerSymbol = document.getElementById("tickerSymbol").value;
    var completeUrl = alphaVantageUrl + tickerSymbol;
    sendRequest(completeUrl);
}

function processStatistics(response) {
    var stockSymbol = document.getElementById("symbol");
    var stockName = document.getElementById("stockName");
    var currentPrice = document.getElementById("currentPrice");
    var openPrice = document.getElementById("openPrice");
    var exchange = document.getElementById("exchange");
    var summary = document.getElementById("summary");

    var responseJson = JSON.parse(response)

    stockSymbol.value = responseJson.symbol;
    stockName.value = responseJson.price.shortName;
    currentPrice.value = responseJson.price.regularMarketPrice.raw;
    openPrice.value = responseJson.price.regularMarketOpen.raw;
    exchange.value = responseJson.price.exchangeName;
    summary.value = responseJson.summaryProfile.longBusinessSummary;
    console.log("Response: " + responseJson)
}

function sendRequest(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            processStatistics(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

function onRegisterClick() {
    console.log("Register")

    var tickerSymbol = document.getElementById("tickerSymbol").value;
    console.log("Ticker: " + tickerSymbol)

    var isLowChecked = document.getElementById("lowCheckBox").checked;
    var lowAmount = document.getElementById("lowAmount").value;

    console.log("Low Amount: " + lowAmount)

    var isHighChecked = document.getElementById("highCheckBox").checked;
    var highAmount = document.getElementById("highAmount").value;

    console.log("High Amount: " + highAmount)

    console.log("Low: " + isLowChecked)
    console.log("High: " + isHighChecked)

    var email = document.getElementById("email").value;
    console.log("Email: " + email)
}

function sendConfirmationEmail() {

}