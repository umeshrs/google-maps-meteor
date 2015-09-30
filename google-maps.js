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
      var storesList, lat, lng, marker, i;

      storesList = Stores.find({}, { sort: { createdAt: 1 }}).fetch();

      for (i = 0; i < storesList.length; i++) {
        lat = storesList[i].lat;
        lng = storesList[i].lng;
        console.log(storesList[i].text + ': ' + lat + ', ' + lng);
        if (lat !== "" && lng !== "") {
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            title: storesList[i].text,
            map: map.instance
          });
        }
      }
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
