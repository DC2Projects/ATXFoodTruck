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
  let x = $("<img>").attr(
    "src",
    "http://openweathermap.org/img/w/" + weatherIcon2 + ".png"
  );
  $(weatherIcon).html(x);
  $(temperature).text(
    Math.floor(((response4.main.temp - 273.15) * 9) / 5 + 32) + "°F"
  );
  $(humidity).text(Math.floor(response4.main.humidity) + "%");
});

// Creating instances
var map, infoWindow, originLat, originLong, destination, start, end;

// Default travel mode
var askMode = "DRIVING";

// button to change travel mode to driving
$("#driving").click(function () {
  askMode = "DRIVING";
  console.log(askMode);
});

// button to change travel mode to bicycling
$("#bicycle").click(function () {
  askMode = "BICYCLING";
  console.log(askMode);
});

// button to change travel mode to walking
$("#walking").click(function () {
  askMode = "WALKING";
  console.log(askMode);
});

// button to change travel mode to public transit
// $("#transit").click(function () {
//   askMode = "TRANSIT";
//   console.log(askMode);
// });

// results variable
var results = document.getElementById("results");

// map div
var mapDiv = document.getElementById("map");

// array for markers
var markerArray = [];

// Google Maps javascript
function initMap() {
  // direction render variable
  var directionsRenderer = new google.maps.DirectionsRenderer();
  // route calculator
  var directionsService = new google.maps.DirectionsService();

  // map render
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 30.270575, lng: -97.744214 },
    zoom: 10,
  });

  // render direction on map
  directionsRenderer.setMap(map);
  // render directions on the panel
  directionsRenderer.setPanel(document.getElementById("directionPanel"));

  // popup marker for current location
  infoWindow = new google.maps.InfoWindow();

  // HTML5 geo-location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        originLat = pos.lat;
        originLong = pos.lng;
        console.log(originLat);
        console.log(originLong);
        infoWindow.setPosition(pos);
        infoWindow.setContent("Current Location.");
        infoWindow.open(map);
        map.setCenter(pos);

        // geo-coding to get address of current location
        var queryURL =
          "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
          originLat +
          "," +
          originLong +
          "&key=AIzaSyAHeXe0OoBIReOvCuEJq5cnU3LhVahYTAk";
        $.ajax({
          url: queryURL,
          method: "POST",
          dataType: "json",
          header: {
            "Access-Control-Allow-Origin": "*",
          },
        }).then(function (response) {
          console.log(response.results[0].formatted_address);
          // current address
          start = response.results[0].formatted_address;

          // search for food truck
          $("#submit").on("click", function () {
            // empyting array
            foodTruckArray = [];
            // removing markers
            removeMarkers();

            // search by price
            var price = $("#1").prop("checked") ? "1," : "";
            price += $("#2").prop("checked") ? "2," : "";
            // price += $("#3").prop("checked") ? "3," : "";
            // price += $("#4").prop("checked") ? "4," : "";
            var textbox = $("#foodType").val();
            price = price.substring(0, price.length - 1);

            // YELP API search
            $.ajax({
              url:
                "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=foodtrucks&location=austin&limit=50&price=" +
                price +
                "&categories=" +
                textbox,
              method: "GET",
              timeout: 0,
              headers: {
                Authorization:
                  "Bearer LWQKKIC6WZLlwyI7-Pg9pE02R0wCWEQtyFS7Y3hPAu-PEbUHgvd9P9munA-Ozw5qz4XsU-RlmxcW9o8bzippVqsR-MUSpI5ZOeEs4J25asF8SJYQZZNbZFefcZPSXnYx",
              },
            }).then(function (getYelpApi) {
              console.log(getYelpApi);

              $("#results").empty();
              for (let i = 0; i < getYelpApi.businesses.length; i++) {
                // address for food trucks
                end =
                  getYelpApi.businesses[i].location.display_address[0] +
                  " " +
                  getYelpApi.businesses[i].location.display_address[1];

                // numerized label
                var labels = String(i + 1);

                // creating cards with template literals
                var card = $(`
                    <div class="card">
                    <img src="${getYelpApi.businesses[i].image_url}" class="card-img-top" alt="${getYelpApi.businesses[i].name}">
                    <div class="card-body">
                    <h6>#${labels}</h6>
                    <div>Rating: <span class="text-primary">${getYelpApi.businesses[i].rating}</span></div>  
                      <h4>${getYelpApi.businesses[i].name}</h4>
                      <div>Address: ${end}</div>
                      <div>Phone Number: ${getYelpApi.businesses[i].display_phone}</div>
                        <a href="#!" id="getDirections${labels}" value="${labels}">Directions</a> &#160;&#160;|&#160;&#160;
                        <a href="${getYelpApi.businesses[i].url}" target="_blank">More Info</a>
                      </div>
                    </div>
                `);

                // storing foodtruck addresses by their number
                localStorage.setItem(labels, end);

                // append cards to results div
                $("#results").append(card);

                // get direction to the food truck
                $(`#getDirections${labels}`).click(function () {
                  mapDiv.scrollIntoView();
                  // using local storage data
                  var endPoint = localStorage.getItem(
                    this.getAttribute("value")
                  );

                  // route calculation
                  directionsService.route(
                    {
                      origin: start,
                      destination: endPoint,
                      travelMode: askMode,
                    },
                    function (response5, status) {
                      if (status === "OK") {
                        console.log(response5);
                        directionsRenderer.setDirections(response5);
                      } else {
                        window.alert(
                          "Directions request failed due to " + status
                        );
                      }
                    }
                  );
                });

                // food truck coordinate
                var LatLng = {
                  lat: getYelpApi.businesses[i].coordinates.latitude,
                  lng: getYelpApi.businesses[i].coordinates.longitude,
                };

                // creating marker for food truck location
                var marker = new google.maps.Marker({
                  position: LatLng,
                  map: map,
                  title: getYelpApi.businesses[i].name,
                  label: labels,
                });
                // putting markers in array
                markerArray.push(marker);

                // zoom in function
                marker.addListener("click", function () {
                  map.setZoom(19);
                  map.setCenter(this.getPosition());
                });
              }
            });
          });
        });
      },
      // error handler
      function () {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // If browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  // error handler
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    // show geo-location data on map
    infoWindow.open(map);
  }
}

// marker removing function
function removeMarkers() {
  for (i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }
}

