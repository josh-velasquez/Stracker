const rootUrl = "http://localhost:6060/"

stockTimer();

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

function stockTimer() {
    // Set the date we're counting down to
    var countDownDate = new Date("Jan 5, 2022 15:37:25").getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        var hour = document.getElementById("hour-timer p");
        hour = hours + "H";

        // Display the result in the element with id="demo"
        var test =  hours + "h "
        + minutes + "m " + seconds + "s ";
        console.log("HERE: " + test)

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("demo").innerHTML = "EXPIRED";
        }
    }, 1000);
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