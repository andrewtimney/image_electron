var chokidar = require('chokidar');
var path = require('path');
var user = process.env.HOME || process.env.USERPROFILE;
var dropbox = path.join(user, 'Pictures');
var pictures = path.join(user, 'dropbox', 'Camera Uploads');

var watcher = chokidar.watch([pictures, dropbox], {
  ignored: /[\/\\]\./,
  persistent: true,
  ignoreInitial: true,
});
 
// something to use when events are received 
var log = console.log.bind(console);
 
// Add event listeners 
  
module.exports = function(callback){
  watcher.on('add', callback); 
  // .on('add', function(path) { 
	//   console.log('File', path, 'has been added'); 
	// });
};