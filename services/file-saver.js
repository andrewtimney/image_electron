var fs = require('fs');
var _ = require('lodash');
var moment = require('moment');

function savePics(pics) {
  var sorted = _.sortBy(pics, function (pic) {
    if(pic.DateTimeOriginal){
      return moment(pic.DateTimeOriginal).valueOf();
    }
    return 0;
  }).reverse();
  
  var stringed = JSON.stringify(sorted);
  fs.writeFile("indexed-pics.json", stringed, 'utf8', function (err) {
    if (err) {
      console.error('Could not save indexed pics json', err);
    }
  });
}

module.exports = savePics;