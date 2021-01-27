// USGS 7 Day Earth Quake geoJson data
var url =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// geoJson data to be used by the map
var geoJson = null;

// Calculate the min/max earthquake depths
var maxDepth = 0;
var minDepth = 9999999;

var colors = [
  "#008000",
  "#ADFF2F",
  "#FFFF00",
  "#FFAE42",
  "#FFA500",
  "#FF4500",
  "#FF0000",
];

const scale = (num, in_min, in_max, out_min, out_max) => {
  return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};
//
// Fetch the data and pass the initial function you want called after.
// This also sets the global geoJson variable to be used later in the
// code
//
function initData(initFunc) {
  d3.json(url)
    .then(
      function (data) {
        console.log(data.features);
        // Store the data into the global variable
        geoJson = data;
        geoJson.features.forEach(function (feature) {
          // Get the min and max of earthquake depth to map colors
          var depth = +feature.geometry.coordinates[2];
          if (depth > maxDepth) {
            maxDepth = depth;
          }
          if (depth < minDepth) {
            minDepth = depth;
          }
        });
      },
      function (error) {
        console.log(error);
      }
    )
    .then(initFunc);
}

//
// Get a circle radius base on magnatude
function getRadius(magnitude) {
  return magnitude * 3;
}

// Give each feature a popup describing the place and time of the earthquake
function onEachFeatureFunc(feature, layer) {
  layer.bindPopup(
    "<h3>" +
      feature.properties.place +
      "</h3><hr><p>" +
      new Date(feature.properties.time) +
      "</p>" +
      "<p>Depth: " +
      feature.geometry.coordinates[2] +
      "</p>"
  );
}

//
// Need to set the radius and color of the earthquake coordinates
//
function pointToLayerFunc(feature, latlng) {
  // Get the normalized value for depth
  var normalized = normalize(
    +feature.geometry.coordinates[2],
    minDepth,
    maxDepth
  );

  //   console.log(+feature.geometry.coordinates[2]);
  //   console.log(
  //     Math.round(
  //       scale(+feature.geometry.coordinates[2], minDepth, maxDepth, 0, 6),
  //       0
  //     )
  //   );

  var scaler = Math.round(
    scale(
      +feature.geometry.coordinates[2],
      minDepth,
      maxDepth,
      0,
      colors.length - 1
    ),
    0
  );

  //var color = perc2color(normalized * 100, 0, 1);
  var color = colors[scaler];

  //.log("depth:" + +feature.geometry.coordinates[2]);
  //console.log("percent:" + normalized * 100);

  return L.circleMarker(latlng, {
    radius: getRadius(+feature.properties.mag),
    fillColor: color,
    color: color,
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
  });
}

//
// Initialize the mapping visualization
//
function init() {
  // This is it! Leaflet knows what to do with
  // each type of feature (held in the `geometry` key) and draws the correct markers.
  var earthquakes = L.geoJSON(geoJson.features, {
    onEachFeature: onEachFeatureFunc,
    pointToLayer: pointToLayerFunc,
  });

  // Create base layers
  // Satellite Layer
  var satelliteMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      id: "mapbox/satellite-v9",
      accessToken: API_KEY,
    }
  );

  // Grayscale Layer
  var grayscaleMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY,
    }
  );

  // Outdoors Layer
  var outdoorsMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "outdoors-v11",
      accessToken: API_KEY,
    }
  );

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    Satellite: satelliteMap,
    Grayscale: grayscaleMap,
    Outdoors: outdoorsMap,
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [satelliteMap, earthquakes],
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);
}

initData(init);
