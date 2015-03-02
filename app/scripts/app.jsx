var houses = require('./houses'),
    socket = require('./socket'),
    components = require('./components.jsx');

window.addEventListener('load', init);

// initial house values
socket.on('all', function(stats) {
  for(var index in stats) {
    houses[index].points = parseInt(stats[index]);
  }
});

function init() {
  React.render(
    <components.Houses houses={houses} />,
    document.getElementById('houses')
  );
  React.render(
    <components.HouseInfo />,
    document.getElementById('house-info')
  );
}
