Stores = new Mongo.Collection("stores");

if (Meteor.isClient) {
  Meteor.startup(function () {
    GoogleMaps.load();
  });

  Template.body.helpers({
    exampleMapOptions: function () {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(48.8588589, 2.340816),
          zoom: 13
        };
      }
    },
    stores: function () {
      return Stores.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.body.onCreated(function () {
    // We can use the 'ready' callback to interact with the map API once the map is ready
    GoogleMaps.ready('exampleMap', function(map) {
      // Add a marker to the map once it's ready
      var storesList, markersList, lat, lng, i;

      storesList = Stores.find({}, { sort: { createdAt: 1 }}).fetch();
      markersList = [];

      for (i = 0; i < storesList.length; i++) {
        lat = storesList[i].lat;
        lng = storesList[i].lng;
        if (lat !== "" && lng !== "") {
          markersList.push({
            position: new google.maps.LatLng(+lat, +lng),
            title: storesList[i].text
          });
        }
      }

      dropMarkers(markersList, map.instance);
    });
  });

  var dropMarkers = function (markersList, map) {
    for (var i = 0; i < markersList.length; i++) {
      addMarkerWithTimeout(markersList[i], map, i * 50);
    }
  }

  var addMarkerWithTimeout = function (marker, map, timeout) {
    window.setTimeout(function () {
      marker = new google.maps.Marker({
        position: marker.position,
        title: marker.title,
        map: map,
        animation: google.maps.Animation.DROP
      });
    }, timeout);
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
