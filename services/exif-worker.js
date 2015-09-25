var ipc = require('ipc');
var Q = require('Q');
var exifData = require('./exif-data');
var moment = require('moment');
var _ = require('lodash');
var geolib = require('geolib');
var fs = require('fs');
var Jimp = require('jimp');
var path = require('path');

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
      //event.sender.send('exif-update', pics.length);
      processFiles(sliced, event);
    });
};

function complete(event, files) {
  try {
    var sorted = _.sortBy(pics, function (pic) {
      return pic.DateTimeOriginal ? pic.DateTimeOriginal.valueOf() : 0;
    });
    fileArg.newly = sorted;
    savePics(fileArg.old.concat(sorted));
    createThumbnails(fileArg.old, event);
    //event.sender.send('exif-complete', fileArg);
  }
  catch (ex) {
    console.log(ex);
  }
}

function createThumbnails(images, event){
  
  if(images.length === 0){
    return;
  }
  
  var imgs = [];
  var topImages = images.slice(-10);
  var sliced = images.slice(0, -10);
  
  topImages.forEach(function(image){
    imgs.push(resize(image));
  });
  
  Q.all(imgs)
    .then(function(res){
      event.sender.send('exif-update', topImages);
      createThumbnails(sliced);
    });
    
    return;
}

function resize(image){
  var deferred = Q.defer();
  
  var img = new Jimp(image.path, function(err, jimage){
    
    if(err){
      console.log(err);
      deferred.reject(err);
    }
    
    var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
    console.log(thumbnailPath);
    
    var options = { width: 250, height: 150 };
    
    var ratio = Math.min(
     jimage.bitmap.width / options.width,
     jimage.bitmap.height / options.height);
    
    var offsetX = (jimage.bitmap.width - (options.width * ratio)) / 2;
    var offsetY = (jimage.bitmap.height - (options.height * ratio)) / 2;  
    
    jimage.crop(offsetX, offsetY,
      jimage.bitmap.width - (offsetX * 2),
      jimage.bitmap.height - (offsetY * 2)
    );
    
    jimage.resize(options.width, options.height)
      .write(thumbnailPath);
      
    image.thumbnailPath = thumbnailPath;
      
    deferred.resolve();
  });
  
  return deferred.promise;
}

function savePics(pics) {
  var stringed = JSON.stringify(pics);
  fs.writeFile("indexed-pics.json", stringed, 'utf8', function (err) {
    if (err) {
      console.error('Could not save indexed pics json', err);
    }
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
        //console.log(exif.exif);
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
          console.log(error);
        }
      }

      file.stylePath = 'url("' + encodeURI(file.path) + '")';

      return file;
    });
}

function GPSCoordToString(coords, ref) {
  return coords[0] + "\u00B0 " + coords[1] + "' " + coords[2] + "\" " + ref;
}