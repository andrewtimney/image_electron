var ipc = require('ipc');
var configSettings = require('../configsettings/config.js'); 
var fileStuff = require('../services/file-stuff');
var exifData = require('../services/exif-data');
var Q = require('Q');
var moment = require('moment');
var _ = require('lodash');
var http = require('http');

var viewModel = {
  count: ko.observable(0),
  files: ko.observableArray(),
  newly: ko.observableArray(),
  config: ko.observable(),
  cities: ko.observableArray(),
  imageSize: ko.observable('100px')
};
ko.applyBindings(viewModel);

ipc.on('exif-complete', function(arg) {
   complete(arg);
});
 
ipc.on('on-files', function(arg) {
  if(arg.old.length){
    viewModel.files(arg.old);
    console.log(arg.old.slice(-1), arg.old.slice(0, 1));
  }
  ipc.send('get-exif', arg);
});

ipc.send('get-files');

function complete(pics){
   viewModel.newly(pics.newly);
}