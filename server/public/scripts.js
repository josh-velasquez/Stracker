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
    const yahooFinanceUrl = rootUrl + "yhfinance/stocks/summary/?symbol=";
    var tickerSymbol = document.getElementById("tickerSymbol").value;
    var completeUrl = yahooFinanceUrl + tickerSymbol;
    sendGetRequest(completeUrl);
    displayStatistics(true)
}

function alphaVantageClick() {
    const alphaVantageUrl = rootUrl + "alphavantage/stocks/daily-adjusted/?symbol=";
    var tickerSymbol = document.getElementById("tickerSymbol").value;
    var completeUrl = alphaVantageUrl + tickerSymbol;
    displayStatistics(true)
    sendGetRequest(completeUrl);
}

function displayStatistics(display) {
    var statisticsField = document.getElementById("statistics-field")
    if (display) {
        statisticsField.style.display = "flex";
    } else {
        statisticsField.style.display = "none";
    }
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

function showStockMarketTimer(open) {
    if (open) {
        stockMarketStatus.style.display = "none";
        stockMarketTimer.style.display = "block";
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

function startStockMarketTimer(countDownDate) {
    var x = setInterval(function (...countDownDate) {
        var now = new Date();
        var distance = countDownDate - now.getTime();
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        timerHours.innerHTML = padTime(hours);
        timerMinutes.innerHTML = padTime(minutes);
        timerSeconds.innerHTML = padTime(seconds);
        if (distance < 0) {
            showStockMarketTimer(false)
            clearInterval(x);   
        }
    }, 1000, countDownDate);
}

function stockTimer() {
    var currentDateTime = new Date();
    // have to increase month by 1 to get the correct coundown date
    var countDownDate = new Date(currentDateTime.getFullYear() + " " + (currentDateTime.getMonth() + 1) + " " + currentDateTime.getDate() + " 14:00:00").getTime();
    if (isWeekend(currentDateTime) || isHoliday(currentDateTime) || currentDateTime.getTime() > countDownDate) {
        showStockMarketTimer(false)
        return;
    }
    showStockMarketTimer(true)
    startStockMarketTimer(countDownDate)
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

    stockSymbol.innerHTML = responseJson.symbol;
    stockName.value = responseJson.price.shortName;
    currentPrice.value = responseJson.price.regularMarketPrice.raw;
    openPrice.value = responseJson.price.regularMarketOpen.raw;
    exchange.value = responseJson.price.exchangeName;
    summary.innerHTML = responseJson.summaryProfile.longBusinessSummary;
}

function sendGetRequest(url) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            showLoading(false);
            processStatistics(xmlHttp.responseText);
        }
        else {
            showLoading(true);
        }
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

function showLoading(show) {
    var statistics = document.getElementById("statistics")
    var loading = document.getElementById("statistics-status")
    if (show) {
        loading.style.display = "block";
        statistics.style.display = "none";
    } else {
        loading.style.display = "none";
        statistics.style.display = "block"
    }
}

function onRegisterClick() {
    var tickerSymbol = document.getElementById("trackerTickerSymbol").value;

    var isLowChecked = document.getElementById("lowCheckBox").checked;
    var lowAmount = document.getElementById("lowAmount").value;

    var isHighChecked = document.getElementById("highCheckBox").checked;
    var highAmount = document.getElementById("highAmount").value;

    var email = document.getElementById("email").value;

    var url = rootUrl + "notifications/email";

    var payload = {
        "email": email,
        "stock": tickerSymbol,
        "low": isLowChecked ? lowAmount : null,
        "high": isHighChecked ? highAmount : null
    }
    sendPostRequest(url, payload)
}

function sendPostRequest(url, payload) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(payload));
}