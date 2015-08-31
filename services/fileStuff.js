var fs = require('fs');
var path = require('path');

var user = process.env.HOME || process.env.USERPROFILE;
var dropbox = path.join(user, 'pictures');
var pictures = path.join(user, 'dropbox', 'Camera Uploads');

function getImages(folder){
	
	var allFiles = fs.readdirSync(folder);
	var images = allFiles.filter(filterImages);
	
	for(var i = 0; i < images.length; i++){
		fstats.push({
			file: images[i],
			path: dir+images[i],
			fstat: fs.statSync(dir+images[i])
		});
	}
	
	return fstats;//.sort(sort);
}

function getFiles(){
	
	var saved = getSaved();
	if(saved)
		return saved;
		
	return getImages(pictures);
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

function saveStat(fstat){
	fstats.push(fstat);
}

// function sort(a, b){
// 	if(a.fstat.mtime.getTime() - b.fstat.mtime.getTime())
// 		return 1;
// 		
// 	if(b.fstat.mtime.getTime() - a.fstat.mtime.getTime())
// 		return -1;
// 		
// 	return 0;
// }

exports.getFiles = getFiles;