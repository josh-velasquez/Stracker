const rootUrl = "http://localhost:6060/"

// Timer for when stocks are open till
var timerHours = document.getElementById("timer-hour");
var timerMinutes = document.getElementById("timer-minutes");
var timerSeconds = document.getElementById("timer-seconds");
var stockMarketStatus = document.getElementById("stock-market-status");
var stockMarketTimer = document.getElementById("stock-clock");

// Time
var clockHour = document.getElementById("hours");
var clockMinutes = document.getElementById("minutes");
var clockSeconds = document.getElementById("seconds");

stockTimer();
clock();

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

function clock() {
    setInterval(function () {
        var today = new Date();
        var hour = today.getHours();
        var minutes = today.getMinutes();
        var seconds = today.getSeconds();
        clockHour.innerHTML = padTime(hour);
        clockMinutes.innerHTML = padTime(minutes);
        clockSeconds.innerHTML = padTime(seconds);
    }, 1000);
}

function startStockMarketTimer(open) {
    if (open) {
        stockMarketStatus.style.display = "none";
    } else {
        stockMarketStatus.style.display = "block";
        stockMarketTimer.style.display = "none";
    }
}

function isHoliday(currentDateTime) {
    var isHoliday = false;
    // TODO: check if current day is a holiday
    return isHoliday;
}

function isWeekend(currentDateTime) {
    return currentDateTime.getDay() == 6 || currentDateTime.getDay() == 0;
}

function stockTimer() {
    var currentDateTime = new Date();
    var countDownDate = new Date(currentDateTime.getMonth() + " " + currentDateTime.getDate() + " " + currentDateTime.getFullYear() + " 14:00:00").getTime();
    if (isWeekend(currentDateTime) || isHoliday(currentDateTime) || currentDateTime.getTime() > countDownDate) {
        startStockMarketTimer(false)
        return;
    }
    startStockMarketTimer(true)
    var x = setInterval(function () {
        var now = new Date().getTime();
        var distance = countDownDate - now;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerHours.innerHTML = padTime(hours);
        timerMinutes.innerHTML = padTime(minutes);
        timerSeconds.innerHTML = padTime(seconds);
        if (distance < 0) {
            startStockMarketTimer(false)
            clearInterval(x);
        }
    }, 1000);
}

function padTime(t) {
    return (t < 10 ? "0" : "") + t;
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
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            console.log("Done.")
            processStatistics(xmlHttp.responseText);
        }
        else {
            // TODO: Show loading symbol
            console.log("Loading...")
        }
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