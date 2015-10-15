Posts = new Mongo.Collection("posts");

if (Meteor.isClient) {
  // counter starts at 0
  getCurrentPosition = function(){
    // timeout at 60000 milliseconds (60 seconds)
    var options = {timeout:3000};
    navigator.geolocation.watchPosition(function(position) {
      Session.set('location',{
        lon:position.coords.longitude,
        lat:position.coords.latitude
      });
      console.log(Session.get('location').lon, Session.get('location').lat);
    },function(err) {
      console.log(err);
    },options);
  };

  Session.setDefault('location', {lon:0,lat:0});

  //web browser client
  Template.body.helpers({
    nearbyPosts: function () {
      return Posts.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Session.get('location').lon, Session.get('location').lat]
            },
            $maxDistance: 20000
          }
        }
      },{sort: {createdAt: -1}});
    },
    allPosts: function () {
      return Posts.find({},{sort: {createdAt: -1}});
    }
  });
  
  Template.post.helpers({
    getDistance: function(coordinates) {
     return geolib.getDistance({latitude: coordinates[1], longitude: coordinates[0]},
      {latitude: Session.get('location').lat,longitude: Session.get('location').lon}
     ); 
    }
  });


  Template.body.events({
    "submit .new-post": function (event) {
      event.preventDefault(); 
      var text = event.target.text.value;
      Posts.insert({
        text: text,
        createdAt: new Date(),
        location: {
          type: "Point",
          coordinates: [Session.get('location').lon, Session.get('location').lat]
        }
      });
      event.target.text.value = "";
    }
  });

  $('body').ready(function(e) {
      console.log('body loaded');
      getCurrentPosition();
    }
  );

  
  //mobile app client api
}

if (Meteor.isServer) {
  Posts._ensureIndex({location: "2dsphere"});
  Meteor.startup(function () {

  });
}
