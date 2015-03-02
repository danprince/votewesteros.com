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
