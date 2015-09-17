var ipc = require('ipc');
var configSettings = require('../configsettings/config.js'); 
var fileStuff = require('../services/file-stuff');
var exifData = require('../services/exif-data');
var geolib = require('geolib');
var Q = require('Q');
var moment = require('moment');
var _ = require('lodash');
var http = require('http');

var viewModel = {
  count: ko.observable(0),
  files: ko.observableArray(),
  config: ko.observable(),
  cities: ko.observableArray(),
  imageSize: ko.observable('100px')
};
ko.applyBindings(viewModel);

ipc.on('exif-complete', function(arg) {
  //calculateImageWidth();
  complete(arg);
});

ipc.on('exif-update', function(arg){
  viewModel.count(arg);
});

ipc.on('on-files', function(arg) {
  ipc.send('get-exif', arg);
});

ipc.send('get-files');

function complete(pics){
   viewModel.files(pics.slice(-100));
}

// function getLocation(path){ // Degree unicode = \u00B0
//   exifData.getExif(path)
//   .then(function(exif){
//     if(exif.gps && exif.gps.GPSLatitude && exif.gps.GPSLongitude){
//       var lat = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef));
//       var lon = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef));
//       var point = {latitude: lat, longitude: lon};
//       var city = getClosestCity(point);
//       console.log('City', city);
//     }
//   })
//   
//   // console.log(geolib, 
//   //   geolib.sexagesimal2decimal("51\u00B0 29' 46\" N"));
//   //   //geolib.sexagesimal2decimal("47° 29' 49.7964\" N"));
// 
//   return '';
// } 

// function GPSCoordToString(coords, ref){
//   return coords[0]+"\u00B0 "+coords[1]+"' "+coords[2]+"\" "+ref;
// }
// 
// function getClosestCity(point){
//   var found, distance = 10000000;
//   
//   allCities.forEach(function(city){
//     //console.log('closest', city);
//     var cityPoint = { latitude: city.Geo.Latitude, longitude: city.Geo.Longitude };
//     var cDistance = geolib.getDistance(point, cityPoint);
//     if(cDistance <= 10000)
//     {
//       if(cDistance < distance){
//         found = city;
//         distance = cDistance
//       }
//     }
//   });
//   
//   return found;
// }

function getLocationAPI(file){
  var point = file.point;
  var url = "http://api.geonames.org/findNearbyPlaceNameJSON?formatted=true&lat="+point.latitude+"&lng="+point.longitude+"&username=demo&style=full";
  http.get(url, function(res){
    console.log(res);
  });
}

var mainElement = document.querySelector('.main');
function calculateImageWidth(){
  try{
    var current = 200;
    var width = mainElement.clientWidth;;
    width = toTens(width);
    while(current > 100){
      if((width/current) % 1 === 0){
        //viewModel.imageSize((current-2)+'px');
        break;
      }
      current--;
    }
  }
  catch(err){
    console.error(err);
  }
}

function toTens(num){
  var tens = num/10;
  return Math.floor(tens)*10;
}