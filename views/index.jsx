var ipc = require('ipc');
var fileStuff = require('../services/file-stuff');
var exifData = require('../services/exif-data');
var moment = require('moment');
var _ = require('lodash');
var React = require('react');

var Images = React.createClass({
  getInitialState(){
    return { files:[] };
  },
  componentWillMount(){
    ipc.on('exif-complete', this.getNewPics);
    ipc.on('on-files', this.getOldPics);
    ipc.send('get-files');
  },
  getNewPics(){
  },
  getOldPics(files){
    this.setState({ files: files.old });
    ipc.send('get-exif', files);
  },
  render(){
    var files = [];
    
    this.state.files.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      files.push(<span className="image flex-item square" style={divStyle}></span>);
    });
  
    return <div className="flex-container">
            {files}
           </div>;
  }
});

//ipc.on('exif-complete', function(arg) {
  // complete(arg);
//});
 
//ipc.on('on-files', function(arg) {
//  if(arg.old.length){
//    viewModel.files(arg.old);
//    console.log(arg.old.slice(-1), arg.old.slice(0, 1));
//  }
//  ipc.send('get-exif', arg);
//});

//ipc.send('get-files');

//function complete(pics){
//   viewModel.newly(pics.newly);
//}

React.render(
	<Images />,
	document.getElementById('images')
);