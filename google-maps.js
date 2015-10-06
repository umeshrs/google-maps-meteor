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
          center: new google.maps.LatLng(48.8588589, 2.335864),
          zoom: 13
        };
      }
    },
    stores: function () {
      return Stores.find({}, {sort: {createdAt: 1}});
    }
  });

  Template.body.events({
    'click #upload-button': function () {
      var config, i, storeDetails;

      config = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function (results) {
          console.log(results);

          for (i = 0; i < results.data.length; i++) {
            storeDetails = results.data[i];
            Stores.insert({
              name: storeDetails['storeName'],
              lat: storeDetails['latitude'],
              lng: storeDetails['longitude'],
              streetAddress: storeDetails['address'],
              postalCode: storeDetails['postalCode'],
              city: storeDetails['city'],
              country: storeDetails['country'],
              telephone: storeDetails['telephone'],
              task: {
                title: storeDetails['taskTitle'],
                description: storeDetails['taskDescription'],
                status: storeDetails['taskStatus']
              },
              createdAt: new Date()
            });
          }

        }
      };

      $('#file-input').parse({
        config: config,
        before: function (file, inputElem) {
          console.log("Parsing file...", file);
        },
        error: function (err, file) {
          console.log("ERROR:", err, file);
        },
        complete: function (results) {
          console.log("Parsing complete.");
        }
      });
    }
  });

  Template.body.onCreated(function () {
    // We can use the 'ready' callback to interact with the map API once the map is ready
    GoogleMaps.ready('exampleMap', function(map) {
      // Add a marker to the map once it's ready
      var storesList, markersList, lat, lng, i, infoWindow, iconBase, markerIcon;

      storesList = Stores.find({}, { sort: { createdAt: 1 }}).fetch();
      markersList = [];
      iconBase = "http://maps.google.com/mapfiles/ms/icons/";

      for (i = 0; i < storesList.length; i++) {
        lat = storesList[i].lat;
        lng = storesList[i].lng;
        infoWindow = '<p>' +
          '<strong>' + storesList[i].name + '</strong><br />' +
          storesList[i].streetAddress + '<br />' +
          storesList[i].postalCode + ' ' + storesList[i].city + ', ' + storesList[i].country + '<br />' +
          '</p>';
        switch (storesList[i].task.status) {
          case "NONE":
            markerIcon = iconBase + "green-dot.png";
            infoWindow += '<p class="text-success">' +
              '<strong>Task</strong><br />' +
              'No pending task' +
              '</p';
            break;
          case "PENDING":
            markerIcon = iconBase + "orange-dot.png";
            infoWindow += '<p class="text-warning">' +
              '<strong>Task</strong><br />' +
              storesList[i].task.title +
              '</p';
            break;
          case "OVERDUE":
            markerIcon = iconBase + "red-dot.png";
            infoWindow += '<p class="text-danger">' +
              '<strong>Task</strong><br />' +
              storesList[i].task.title +
              '</p';
            break;
        }
        if (lat !== "" && lng !== "") {
          markersList.push({
            position: new google.maps.LatLng(+lat, +lng),
            title: storesList[i].name,
            infoWindow: infoWindow,
            icon: markerIcon
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

  var addMarkerWithTimeout = function (markerOptions, map, timeout) {

    var addMarker = function () {
      var marker, infoWindow, storesList, i;

      marker = new google.maps.Marker({
        position: markerOptions.position,
        title: markerOptions.title,
        map: map,
        icon: markerOptions.icon,
        animation: google.maps.Animation.DROP
      });

      infoWindow = new google.maps.InfoWindow({
        content: markerOptions.infoWindow
      });

      // using the z index property of info window object to store
      // the toggle state of each info window
      // undefined = closed; 1 = open;

      marker.addListener('click', function () {
        infoWindow.open(map, marker);
        infoWindow.setZIndex(1);
      });

      infoWindow.addListener('closeclick', function () {
        infoWindow.close();
        infoWindow.setZIndex(undefined);
      });

      map.addListener('click', function () {
        infoWindow.close();
        infoWindow.setZIndex(undefined);
      });

      storesList = document.getElementById("stores-list").getElementsByTagName("li");
      for (i = 0; i < storesList.length; i++) {
        if (storesList[i].getElementsByTagName("strong")[0].innerHTML === markerOptions.title) {
          storesList[i].addEventListener('click', function () {
            if (infoWindow.getZIndex() === undefined) {
              infoWindow.open(map, marker);
              infoWindow.setZIndex(1);
            }
            else {
              infoWindow.close();
              infoWindow.setZIndex(undefined);
            }
          });
        }
      }
    }

    window.setTimeout(addMarker, timeout);
  }
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
