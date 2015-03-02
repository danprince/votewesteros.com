var Twitter = require('ntwitter'),
    colors = require('colors'),
    houses = require('../../common/houses.json'),
    config = require('../config');

var client = new Twitter({
  consumer_key: config.twitter.CONSUMER_KEY,
  consumer_secret: config.twitter.CONSUMER_SECRET,
  access_token_key: config.twitter.TOKEN,
  access_token_secret: config.twitter.TOKEN_SECRET
});

client.verifyCredentials(function(err, data) {
  if(err) throw err;
});

var tweet = module.exports = {
  message: function(message, callback) {
    console.log('Tweet', message.cyan);
    client.updateStatus(message, callback);
  },
  newLeader: function(leaderIndex, oldIndex, score) {
    var leaderHouse = houses[leaderIndex],
        oldHouse = houses[oldIndex],
        message = 'House ' + leaderHouse.name + ' has just overtaken ' +
                  'House ' + oldHouse.name + ' and now has ' + score + ' repuation.';

    tweet.message(message, function(err) {
      if(err) throw err;
    });
  }
};

