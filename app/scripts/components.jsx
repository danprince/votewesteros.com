var houses = require('./houses'),
    socket = require('./socket'),
    events = require('./events'),
    stats = require('./stats'),
    util = require('./util');

var components = module.exports = {

  // List of Houses
  Houses: React.createClass({
    componentWillMount: function() {
      socket.on('set', function(index, points) {
        houses[index].points = points;
        this.forceUpdate();
      }.bind(this));
    },
    render: function() {
      function createHouse(house, index) {
        return <components.House house={house} index={index} key={index}/>;
      }
      return (
        <div className='houses'>
          {houses.map(createHouse)}
        </div>
      );
    }
  }),

  // House Element
  House: React.createClass({
    render: function() {
      var index = this.props.index,
          name = this.props.house.name,
          points = this.props.house.points;

      return (
        <div className='house'>
          <components.ChartBar index={index} name={name} points={points}/>
          <components.Shield index={index} name={name}/>
          <components.Label index={index} name={name}/>
        </div>
      );
    }
  }),

  // House Shield and Image
  Shield: React.createClass({
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
        <div className={this.getClassName()} onClick={this.handleClick}>
          <img src={this.getImgSrc()}/>
        </div>
      );
    }
  }),

  // Clickable Label
  Label: React.createClass({
    handleClick: function() {
      // emit click event
      events.emit('info:show', this.props.index);
    },
    render: function() {
      return (
        <label className='name' onClick={this.handleClick}>
          {this.props.name}
        </label>
      );
    }
  }),

  // A bar in the chart
  ChartBar: React.createClass({
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
        <div className={this.getClassName()} style={this.getStyle()}>
          <b className='points'>{util.toShortNum(this.props.points)}</b>
        </div>
      );
    }
  }),

  // House info modal
  HouseInfo: React.createClass({
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
        <div className={this.getClassName()} onClick={this.handleOverlayClick}>
          <div className='modal'>
            <div className={this.getStripClass()}></div>
            <components.Shield name={this.state.house.name} size='large'/>
            <h1>House {this.state.house.name}</h1>
            <q>{this.state.house.words}</q>
            <div className='divider'></div>
            <div className='content'>{this.state.house.description}</div>
          </div>
        </div>
      );
    }
  })
};
