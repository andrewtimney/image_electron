var ipc = require('ipc');
var Q = require('Q');
var exifData = require('./exifData');
var moment = require('moment');
var _ = require('lodash');
var geolib = require('geolib');
var fs = require('fs');

var pics = [];
ipc.on('get-exif', function(event, arg){
	console.log('get-exif', event, arg); 
	processFiles(arg.slice(-50), event);
});

function processFiles(files, event){
	
	if(files.length === 0){
		complete(event);
		return;
	}
	
	var current = [];
  var topFiles = files.slice(-50);
  var sliced = files.slice(0, -50);
  console.log('Files: ', topFiles.length, sliced.length);
	
	topFiles.forEach(function(file){
    var result = getExifData(file);
    current.push(result);
  });
	
	 Q.all(current)
        .then(function(res){
          res.forEach(function(file){
            pics.push(file);
          }); 
          event.sender.send('exif-update', pics.length);
          processFiles(sliced, event);
        });
};

function complete(event){
	try{
    console.log('complete...', event, pics.length);
    var sorted = _.sortBy(pics, function(pic){
     return pic.DateTimeOriginal ? pic.DateTimeOriginal.valueOf() : 0;
    });
	  savePics(pics);
    event.sender.send('exif-complete', sorted);
  }
  catch(ex){
    console.log(ex);
  }
}

function savePics(pics){
  var stringed = JSON.stringify(pics);
    fs.writeFile("../indexedPics.json", stringed, function(err){
      console.error(err);
    });
}

function getExifData(file){
  
  if(file.point){
    var deferred = Q.defer();
    deferred.resolve(file);
    return deferred.promise;
  }
  
  return exifData.getExif(file.path)
    .then(function(exif){
     
      if(exif.exif.DateTimeOriginal || exif.exif.CreatedDate){
        console.log(exif.exif);
        file.DateTimeOriginal = moment(exif.exif.DateTimeOriginal || exif.exif.CreatedDate, "YYYY:MM:DD HH:mm:SS");
        file.date = file.DateTimeOriginal.format('DD/MM/YYYY');
      }
      
      if(exif.exif.ExifImageHeight && exif.exif.ExifImageWidth){
        file.orientation = (exif.exif.ExifImageWidth > exif.exif.ExifImageHeight) ? 0 : 1;
      }else{
        file.orientation = 0;
      }
      
      if(exif.gps && exif.gps.GPSLatitude && exif.gps.GPSLongitude){
        try{
          var lat = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLatitude, exif.gps.GPSLatitudeRef));
          var lon = geolib.sexagesimal2decimal(GPSCoordToString(exif.gps.GPSLongitude, exif.gps.GPSLongitudeRef));
          var point = {latitude: lat, longitude: lon};
          file.point = point;
        }
        catch(error){
          console.log(error);
        }
      }
      
      file.stylePath = 'url("'+encodeURI(file.path)+'")';
      
      return file;
    });
}

function GPSCoordToString(coords, ref){
  return coords[0]+"\u00B0 "+coords[1]+"' "+coords[2]+"\" "+ref;
}