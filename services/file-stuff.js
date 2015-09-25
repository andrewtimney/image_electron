var fs = require('fs');
var path = require('path');
var ipc = require('ipc');
var _ = require('lodash');

var user = process.env.HOME || process.env.USERPROFILE;
var dropbox = path.join(user, 'Pictures');
var pictures = path.join(user, 'dropbox', 'Camera Uploads');
var pictureFolders = [dropbox, pictures];

ipc.on('get-files', function(event, arg) {
	var files = getFiles();
	event.sender.send('on-files', files);
});

function getImages(folder){
	
	var fstats = [];
	var allFiles = fs.readdirSync(folder);
	var images = allFiles.filter(filterImages);

	for(var i = 0; i < images.length; i++){
		fstats.push({
			file: images[i],
			path: path.join(folder, images[i]),
			fstat: fs.statSync(path.join(folder, images[i]))
		});
	}
	return fstats;
}

function getFiles(){
	
	var saved = getSavedFiles();
	var files = [];
	
	for(var i = 0; i < pictureFolders.length; i++){
		var found = getImages(pictureFolders[i]);
		files = files.concat(found);
	} 
	
	var newFiles = getNewFiles(saved, files);
	console.log('saved', saved.length);
	console.log('new', newFiles.length);
	
	return {
		old: saved,
		newly: newFiles
	};
} 

function getNewFiles(saved, allFiles){
	 return _.filter(allFiles, function(file){
		 return !_.find(saved, function(savedFile){
			 return savedFile.path === file.path;
		 }); 
	 });
}

function getSavedFiles(){
	try{
		var pics = require('../indexed-pics.json');
		return pics;
	}
	catch(err){
		console.log('Error reading pics file:'+err);
	}
	return [];
}

function filterImages(file){
	return file.indexOf('.jpg') !== -1;
}