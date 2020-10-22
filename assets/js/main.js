// Creating variables for weather info - JQuery
var weatherIcon = $("#weatherIcon");
var tempertaure = $("#temperature");
var humidity = $("#humidity");

// Weather API
   $.ajax({
    url:
      "https://api.openweathermap.org/data/2.5/weather?q=Austin&appid=3a62bced9ceab4de3f9f5c1c6e205817",
    }).then(function (response4) {
    console.log(response4);

    weatherIcon2 = response4.weather[0].icon;
    let x = $('<img>').attr("src","http://openweathermap.org/img/w/" + weatherIcon2 + ".png");
    $(weatherIcon).html(x);
    $(temperature).text(Math.floor(((response4.main.temp - 273.15) * 9) / 5 + 32) + "°F");
    $(humidity).text(Math.floor(response4.main.humidity) + "%");
  });
