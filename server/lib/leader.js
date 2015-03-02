var stats = require('./stats'),
    tweet = require('./tweet'),
    leader = module.exports = {};

leader.identify = function() {
  var leader = null;

  stats.dump(function(err, scores) {
    var index = 0,
        leader = 0;

    // determine which house is leading
    for(index in scores) {
      if(scores[index] > parseInt(scores[leader])) {
        leader = index;
      }
    }

    // check against current leader
    stats.leader(function(err, oldLeader) {
      if(leader > 0 && oldLeader.index !== leader) {
        stats.setLeader(leader, scores[leader]);
        tweet.newLeader(leader, oldLeader.index, scores[leader]);
      }
    });
  });
};
