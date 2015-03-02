var houses = require('./houses');

// Graph Utilities
module.exports = function() {
  var index = 0,
      total = 0,
      highest = 0,
      house = null;

  for(index in houses) {
    house = houses[index];
    total += house.points;
    if(house.points > highest) {
      highest = house.points;
    }
  }

  return {
    total: total,
    relative: highest / total
  };
};
