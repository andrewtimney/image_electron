var fs = require('fs');
var path = require('path');
var ipc = require('ipc');

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
	console.log('getImages', fstats.length);
	return fstats;
}

function getFiles(){
	
	// var saved = getSaved();
	// if(saved)
	// 	return saved; 
	var files = [];
	
	for(var i = 0; i < pictureFolders.length; i++){
		files = files.concat(getImages(pictureFolders[i]));
	}
	console.log('WAW', files.length);
	return files;
}

function getSaved(){
	try{
		var pics = require('../indexedPics.json');
		console.log('READ PICS FILE: '+pics.length);
		return pics;
	}
	catch(err){
		console.log('Error reading pics file:'+err);
	}
	return;
}

function filterImages(file){
	return file.indexOf('.jpg') !== -1;
}