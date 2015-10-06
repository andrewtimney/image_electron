
var easyimg = require('easyimage');
var path = require('path');
var fs = require('fs');

var p = path.join(__dirname, '../indexed-pics');
var imgs = require(p);

console.log('Processing files: '+imgs.length);

imgs.slice(0, 100).forEach(function(img){
	nResize(img);
  fs.createWriteStream(null, {fd:0})
    .write("sss");
});

process.stdout.write('stdout');
process.stdout.write('stdout');

function nResize(image){
   var thumbnailPath = path.join(__dirname, '../thumbnails', path.basename(image.path));
    
  return easyimg.thumbnail({
     src:image.path, dst:thumbnailPath,
     width:250, height:250,
     x:0, y:0
  });
}