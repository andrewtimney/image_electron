var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs');
var Q = require('Q');
var _ = require('lodash');
var moment = require('moment');
var savePics = require('./file-saver');

var p = path.join(__dirname, '../indexed-pics');
var imags = require(p);
var newImages = [];

function resize(imgs){
  
  if(imgs.length === 0){
    savePics(imags);
    process.stdout.write(JSON.stringify(newImages));
    return;
  }
  
  var current = [];
  var topImages = imgs.slice(-50);
  var sliced = imgs.slice(0, -50);
  
  topImages.forEach(function(file){
    if(!file.thumbnailPath){
      current.push(createThumbnail(file));
      newImages.push(file);
    }
  });
  
  Q.all(current)
    .then(function(){
      //process.stdout.write('length: '+sliced.length);
      resize(sliced);
    });
}
resize(imags);

function createThumbnail(image){
  
  var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
  image.thumbnailPath = thumbnailPath;
  image.stylePath = 'url("' + encodeURI(thumbnailPath) + '")';
  
  try{
    fs.statSync(thumbnailPath);
    return Q.when([]);
  }
  catch(err){
    console.log('Error with statSync');
  } 
  
  return easyimg.thumbnail({
    src:image.path, dst:thumbnailPath,
    width:250, height:250,
    x:0, y:0
  })
  .then(function(result){
    // Success
  }, function(err){
    console.error(err);
  });
  
}