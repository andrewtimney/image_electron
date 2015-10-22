var ipc = require('ipc');
var Q = require('Q');
var exifData = require('./exif-data');
var moment = require('moment');
var _ = require('lodash');
var geolib = require('geolib');
var fs = require('fs');
var path = require('path');
var easyimg = require('easyimage');
var savePics = require('./file-saver');

var watcher = require('./folder-watch');

var pics = [];
var fileArg;

ipc.on('get-exif', function (event, arg) {
  fileArg = arg;
  processFiles(arg.newly, event);
});

function processFiles(files, event) {
  
  if (files.length === 0) {
    complete(event, files);
    return;
  }

  var current = [];
  var topFiles = files.slice(-50);
  var sliced = files.slice(0, -50);

  topFiles.forEach(function (file) {
    var result = getExifData(file);
    current.push(result);
  });

	 Q.all(current)
    .then(function (res) {
      res.forEach(function (file) {
        pics.push(file);
      });
      event.sender.send('exif-update', pics);
      processFiles(sliced, event);
    });
};

function complete(event, files) {
  try { 
    var sorted = _.sortBy(pics, function (pic) {
      return pic.DateTimeOriginal ? pic.DateTimeOriginal.valueOf() : 0;
    });
    fileArg.newly = sorted;
    var all = fileArg.old.concat(sorted);
    
    savePics(all);
    createThumbnailsProcess(sorted, event);
  }
  catch (ex) {
    console.error(ex);
  }
}

function createThumbnailsProcess(sorted, event){
  var pro = require('child_process');
  var crt = pro.spawn('node', ['services/create-thumbnails.js'], { stdio: ['pipe'] });
  crt.stdout.on('data', function(buffer){
    try{
      var newImage = buffer.toString();
      if(newImage.length){
        event.sender.send('exif-complete', JSON.parse(newImage));
      }
    }
    catch(err){
      console.error(err);
    }
  });
  crt.stdout.on('end', function(){
    console.log('END', arguments);
    //event.sender.send('exif-complete', sorted);
  });
}

function getExifData(file) {

  if (file.point) {
    var deferred = Q.defer();
    deferred.resolve(file);
    return deferred.promise;
  }

  return exifData.getExif(file.path)
    .then(function (exif) {

      if (exif.exif.DateTimeOriginal || exif.exif.CreatedDate) {
        file.DateTimeOriginal = moment(exif.exif.DateTimeOriginal || exif.exif.CreatedDate, "YYYY:MM:DD HH:mm:SS");
        file.date = file.DateTimeOriginal.format('DD/MM/YYYY');
      }

      if (exif.exif.ExifImageHeight && exif.exif.ExifImageWidth) {
        file.orientation = (exif.exif.ExifImageWidth > exif.exif.ExifImageHeight) ? 0 : 1;
      } else {
        file.orientation = 0;
      }

      if (exif.gps && exif.gps.GPSLatitude && exif.gps.GPSLongitude) {
        try {
          var lat = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef));
          var lon = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef));
          var point = { latitude: lat, longitude: lon };
          file.point = point;
        }
        catch (error) {
          console.log('GPS Error', error);
        }
      }

      return file;
    });
}

function GPSCoordToString(coords, ref) {
  return coords[0] + "\u00B0 " + coords[1] + "' " + coords[2] + "\" " + ref;
}