var config = require('../../common/config.json');

module.exports = io.connect(config.HOST + ':' + config.PORT);
