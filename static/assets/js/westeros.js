(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    React.createElement(components.Houses, {houses: houses}),
    document.getElementById('houses')
  );
  React.render(
    React.createElement(components.HouseInfo, null),
    document.getElementById('house-info')
  );
}

},{"./components.jsx":2,"./houses":4,"./socket":5}],2:[function(require,module,exports){
var houses = require('./houses'),
    socket = require('./socket'),
    events = require('./events'),
    stats = require('./stats'),
    util = require('./util');

var components = module.exports = {

  // List of Houses
  Houses: React.createClass({displayName: 'Houses',
    componentWillMount: function() {
      socket.on('set', function(index, points) {
        houses[index].points = points;
        this.forceUpdate();
      }.bind(this));
    },
    render: function() {
      function createHouse(house, index) {
        return React.createElement(components.House, {house: house, index: index, key: index});
      }
      return (
        React.createElement("div", {className: "houses"}, 
          houses.map(createHouse)
        )
      );
    }
  }),

  // House Element
  House: React.createClass({displayName: 'House',
    render: function() {
      var index = this.props.index,
          name = this.props.house.name,
          points = this.props.house.points;

      return (
        React.createElement("div", {className: "house"}, 
          React.createElement(components.ChartBar, {index: index, name: name, points: points}), 
          React.createElement(components.Shield, {index: index, name: name}), 
          React.createElement(components.Label, {index: index, name: name})
        )
      );
    }
  }),

  // House Shield and Image
  Shield: React.createClass({displayName: 'Shield',
    getClassName: function() {
      var size = this.props.size || '';
      return [this.props.name, 'shield', size].join(' ');
    },
    getImgSrc: function() {
      return 'assets/img/' + this.props.name + '.svg';
    },
    handleClick: function() {
      // emit click event
      socket.emit('click', this.props.index);
    },
    render: function() {
      return (
        React.createElement("div", {className: this.getClassName(), onClick: this.handleClick}, 
          React.createElement("img", {src: this.getImgSrc()})
        )
      );
    }
  }),

  // Clickable Label
  Label: React.createClass({displayName: 'Label',
    handleClick: function() {
      // emit click event
      events.emit('info:show', this.props.index);
    },
    render: function() {
      return (
        React.createElement("label", {className: "name", onClick: this.handleClick}, 
          this.props.name
        )
      );
    }
  }),

  // A bar in the chart
  ChartBar: React.createClass({displayName: 'ChartBar',
    getClassName: function() {
      return [this.props.name, 'bar'].join(' ');
    },
    getStyle: function() {
      var nums = stats();
      return {
        height: ((this.props.points / nums.total) / nums.relative) * 400 + 'px'
      };
    },
    render: function() {
      return (
        React.createElement("div", {className: this.getClassName(), style: this.getStyle()}, 
          React.createElement("b", {className: "points"}, util.toShortNum(this.props.points))
        )
      );
    }
  }),

  // House info modal
  HouseInfo: React.createClass({displayName: 'HouseInfo',
    getInitialState: function() {
      return {
        showing: false,
        house: this.getHouseFromIndex(0)
      }
    },
    getHouseFromIndex: function(index) {
      return houses[index];
    },
    componentWillMount: function() {
      events.on('info:show', this.showInfo);
    },
    showInfo: function(index) {
      this.setState({
        showing: true,
        house: this.getHouseFromIndex(index)
      });
    },
    handleOverlayClick: function() {
      this.setState({
        showing: false
      });
    },
    getClassName: function() {
      var state = this.state.showing ? 'visible' : 'hidden';
      return ['overlay', 'view', state].join(' ');
    },
    getStripClass: function() {
      return ['strip', this.state.house.name].join(' ');
    },
    render: function() {
      return (
        React.createElement("div", {className: this.getClassName(), onClick: this.handleOverlayClick}, 
          React.createElement("div", {className: "modal"}, 
            React.createElement("div", {className: this.getStripClass()}), 
            React.createElement(components.Shield, {name: this.state.house.name, size: "large"}), 
            React.createElement("h1", null, "House ", this.state.house.name), 
            React.createElement("q", null, this.state.house.words), 
            React.createElement("div", {className: "divider"}), 
            React.createElement("div", {className: "content"}, this.state.house.description)
          )
        )
      );
    }
  })
};

},{"./events":3,"./houses":4,"./socket":5,"./stats":6,"./util":7}],3:[function(require,module,exports){
var Emitter = require('events').EventEmitter;

module.exports = new Emitter();

},{"events":10}],4:[function(require,module,exports){
module.exports = require('../../common/houses.json');

},{"../../common/houses.json":9}],5:[function(require,module,exports){
var config = require('../../common/config.json');

module.exports = io.connect(config.HOST + ':' + config.PORT);

},{"../../common/config.json":8}],6:[function(require,module,exports){
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

},{"./houses":4}],7:[function(require,module,exports){
var util = module.exports =  {
  toShortNum: function(number) {
    var prefixes = ['t', 'b', 'm', 'k'],
        str = number.toString(),
        index = 0,
        limit = 0;

    for(index = 0; index < prefixes.length; index++) {
      limit = (prefixes.length - index) * 3;
      if(str.length > limit) {
        return (number / Math.pow(10, limit)) + prefixes[index];
      }
    }

    return number;
  }
};

},{}],8:[function(require,module,exports){
module.exports={
  "PORT": 4949,
  "HOST": "http://localhost"
}

},{}],9:[function(require,module,exports){
module.exports=[
  {
    "name": "lannister",
    "words": "Hear Me Roar",
    "points": 0,
    "description": "The Lannisters of Casterly Rock are one of the Great Houses of the Seven Kingdoms. The Lannisters have prospered through mining gold and extend their influence throughout Westeros, where a Lannister usually rules as the Warden of the West. The sigil of House Lannister is a Lion."
  },
  {
    "name": "stark",
    "words": "Winter Is Coming",
    "points": 0,
    "description": "The Starks rule the North of Westeros from their Ancient seat in Winterfell. They are one of the oldest houses in Westeros, stretching back to when they ruled as the Kings in the North. The sigil of House Stark is a direwolf."
  },
  {
    "name": "baratheon",
    "words": "Ours Is The Fury",
    "points": 0,
    "description": "The Baratheons are one of the Great Houses of Westeros and rule the Stormlands from their seat at Storm's End. Known for their mercurial tempers, the Baratheons have earned their words. The sigil of House Baratheon is a stag."
  },
  {
    "name": "arryn",
    "words": "As High As Honour",
    "points": 0,
    "description": "House Arryn is one of the Great Houses of Westeros and rule the Vale from their seat in the Eyrie. Their line dates back to the Andals and their Andal blood has stayed truer than any other Westerosi family. The sigil of House Arryn is a Falcon."
  },
  {
    "name": "targaryen",
    "words": "Fire and Blood",
    "points": 0,
    "description": "The Targaryens are a surviving Valyrian family line, who escaped after the Doom and came to Westeros. Their seat in Westeros is Dragonstone, although it was also Targaryen Lineage that raised the Red Keep. The Targaryen sigil is a three headed dragon. "
  },
  {
    "name": "martell",
    "words": "Unbent Unbowed Unbroken",
    "points": 0,
    "description": "House Martell is one of the Great Houses of Westeros and rule Dorne from their Prince's Seat at Sunspear. They remain the only one of the Seven Kingdoms to have never been conquered. The sigil of House Martell is a sun, pierced by a spear."
  },
  {
    "name": "tully",
    "words": "Family Duty Honour",
    "points": 0,
    "description": "House Tully is one of the Great Houses of Westeros and rule the Riverlands from Riverrun, their seat on the Tumblestone. The sigil of House Tully is a trout."
  },
  {
    "name": "tyrell",
    "words": "Growing Strong",
    "points": 0,
    "description": "House Tyrell is one of the Great Houses of Westeros and they sit as the Overlords of the Reach from their seat at Highgarden. Traditionally, they also sit as Wardens of the South. House Tyrell's sigil is a golden rose."
  },
  {
    "name": "frey",
    "words": "Unknown",
    "points": 0,
    "description": "House Frey are a noble house of the Riverlands, seated at the Twins. Their strategic position on the Trident has allowed the house to exact a toll on those who wish to cross the river. The sigil of House Frey is a bridge with two towers."
  },
  {
    "name": "bolton",
    "words": "Our Blades Are Sharp",
    "points": 0,
    "description": "House Bolton is an old line from the North, who date back to the First Men. They sit as one of the most powerful houses in the North in The Dreadfort. House Bolton are known for their practice of flaying their enemies. The sigil of House Bolton is a flayed man."
  },
  {
    "name": "greyjoy",
    "words": "We Do Not Sow",
    "points": 0,
    "description": "House Greyjoy is one of the Great Houses of Westeros and they rule over the Iron Islands from their seat on Pyke. They have rebelled against the Throne many times and unlike the rest of Westeros, keep the Drowned God's faith. The sigil of House Greyjoy is a Kraken."
  }
]

},{}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1]);
