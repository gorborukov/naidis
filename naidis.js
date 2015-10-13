Posts = new Mongo.Collection("posts");

if (Meteor.isClient) {
  // counter starts at 0
  getCurrentPosition = function(){
    // timeout at 60000 milliseconds (60 seconds)
    var options = {timeout:60000};
    navigator.geolocation.watchPosition(function(position) {
      Session.set('location',{
        lat:position.coords.latitude,
        lon:position.coords.longitude
      });
      console.log(Session.get('location'));
    },function(err) {
      console.log(err);
    },options);
  };

  Session.setDefault('location', {lat:0,lon:0});

  //web browser client
  Template.body.helpers({
    nearbyPosts: function () {
      return Posts.find({
        location: {
          $near: Session.get('location')
        }
      });
    },
    allPosts: function () {
      return Posts.find({});
    }
  });

  Template.body.events({
    "submit .new-post": function (event) {
      event.preventDefault(); 
      var text = event.target.text.value;
      Posts.insert({
        text: text,
        createdAt: new Date(),
        location: Session.get('location')
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
  Meteor.startup(function () {

  });
}
