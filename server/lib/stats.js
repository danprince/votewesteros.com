var redis = require('redis'),
    config = require('../config'),
    client = redis.createClient(),
    stats = {};

module.exports = stats;

client.on('error', function(err) {
  // handle errors
  throw err;
});

// Increment key by 1
stats.increment = function(key, callback) {
  client.HINCRBY(config.HASH_NAME, key, 1, callback);
};

// Retrieve dump of all keys and values
stats.dump = function(callback) {
  client.HGETALL(config.HASH_NAME, callback);
};

// Retrieve the current leader details
stats.leader = function(callback) {
  client.HGETALL('leader', callback);
};

// Update the leader
stats.setLeader = function(index, score) {
  client.HSET('leader', 'index', index);
  client.HSET('leader', 'score', score);
};
