if (Meteor.isClient) {
  Meteor.startup(function () {
    GoogleMaps.load();
  });

  Template.body.helpers({
    exampleMapOptions: function () {
      // Make sure the maps API has loaded
      if (GoogleMaps.loaded()) {
        return {
          center: new google.maps.LatLng(48.8588589, 2.3475569),
          zoom: 12
        };
      }
    },
    stores: [
      { text: "This is store 1" },
      { text: "This is store 2" },
      { text: "This is store 3" }
    ]
  });

  Template.body.onCreated(function () {
    // We can use the 'ready' callback to interact with the map API once the map is ready
    GoogleMaps.ready('exampleMap', function(map) {
      // Add a marker to the map once it's ready
      var marker = new google.maps.Marker({
        position: map.options.center,
        map: map.instance
      });
    });
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
