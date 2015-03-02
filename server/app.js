var app = require('http').createServer(),
    io = require('socket.io')(app),
    stats = require('./lib/stats'),
    leader = require('./lib/leader');

module.exports = app;

io.on('connection', function(socket) {

  // initial stats dump to new clients
  stats.dump(function(err, stats) {
    if(err) throw err;
    socket.emit('all', stats);
  });

  // on click event
  socket.on('click', function(house) {
    stats.increment(house, function(err, num) {
      if(err) throw err;
      // tell all other clients
      io.sockets.emit('set', house, num);
      leader.identify();
    });
  });

});
