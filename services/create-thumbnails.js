var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs');
var Q = require('Q');

var p = path.join(__dirname, '../indexed-pics');
var imags = require(p);
//imags = imags.slice(-50);

function resize(imgs){
  
  if(imgs.length === 0){
    savePics(imags);
    return;
  }
  
  var current = [];
  var topImages = imgs.slice(-50);
  var sliced = imgs.slice(0, -50);
  
  topImages.forEach(function(file){
    if(!file.thumbnailPath)
      current.push(nResize(file));
  });
  
  Q.all(current)
    .then(function(){
      process.stdout.write('length: '+sliced.length);
      resize(sliced);
    });
}
resize(imags);

function nResize(image){
  var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
  image.thumbnailPath = thumbnailPath;
  image.stylePath = 'url("' + encodeURI(thumbnailPath) + '")';
    
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

function savePics(pics) {
  var stringed = JSON.stringify(pics);
  console.log('savePic', pics.length, pics[0]);
  fs.writeFile("indexed-pics.json", stringed, 'utf8', function (err) {
    if (err) {
      console.error('Could not save indexed pics json', err);
    }else{
      
    }
  });
}