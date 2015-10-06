var ipc = require('ipc');
var Q = require('Q');
var exifData = require('./exif-data');
var moment = require('moment');
var _ = require('lodash');
var geolib = require('geolib');
var fs = require('fs');
var Jimp = require('jimp');
var path = require('path');
var easyimg = require('easyimage');

var pics = [];
var fileArg;

ipc.on('get-exif', function (event, arg) {
  fileArg = arg;
  processFiles(arg.newly, event);
});

function processFiles(files, event) {
  console.log('processFiles', files.length, event);
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
    //createThumbnails(all, event);
    console.log('complete', all.length);
    savePics(all);
    
    var pro = require('child_process');
    var crt = pro.spawn('node', ['services/create-thumbnails.js'], { stdio: ['pipe'] });
     crt.stdout.on('data', function(buffer){
    //   try{
    //     var st = buffer.toString();
    //     console.log('update', buffer.toJSON());
    //   }
    //   catch(err){
         console.log('update', buffer.toString());
    //   }
     });
    crt.stdout.on('end', function(){
      console.log('END');
    });
    
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
  var topImages = images.slice(-100);
  var sliced = images.slice(0, -100);
  
  topImages.forEach(function(image){
    imgs.push(resize(image));
  });
  
  Q.all(imgs)
    .then(function(res){
      //event.sender.send('exif-update', res[0]);
      createThumbnails(sliced, event);
    });
    
  return;
}

function nResize(image){
   var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
    
  return easyimg.rescrop({
     src:image.path, dst:thumbnailPath,
     width:250, height:250,
     cropwidth:128, cropheight:128,
     x:0, y:0
  });
}

function resize(image){

  var deferred = Q.defer();
  
  var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
    
  if(image.thumbnailPath){
    deferred.resolve(image);
    return deferred.promise;
  }
 
  new Jimp(image.path, function(err, jimage){
    
    if(err){
      console.log(err);
      deferred.reject(err);
    }
    
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
    image.stylePath = 'url("' + encodeURI(thumbnailPath) + '")';
      
    deferred.resolve(image);
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