var ipc = require('ipc');
var React = require('react');
var _ = require('lodash');
var moment = require("moment");

var Images = React.createClass({
  getInitialState(){
    return { files:[], newly:[] };
  },
  componentWillMount(){
    ipc.on('exif-complete', this.getNewPics);
    ipc.on('on-files', this.getOldPics);
    ipc.send('get-files');
  },
  getNewPics(files){
    console.log('new', files);
    this.setState({ newly: files });
  },
  getOldPics(files){
    this.setState({ files: files.old });
    ipc.send('get-exif', files);
  },
  sortByDate(files){
   return _.sortBy(files.slice(10), function (pic) {
      var val = pic.DateTimeOriginal ? pic.DateTimeOriginal.valueOf() : 0;
      console.log(val, typeof pic.DateTimeOriginal);
      return val;
    });
  },
  render(){
    var files = []; 
    this.state.files.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      files.push(<span className="image flex-item square" style={divStyle} data-date={file.date}></span>);
    });
    
    var newly = [];
    this.state.newly.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      newly.push(<span className="image flex-item square" style={divStyle}></span>);
    });
    
    return <div className="">
            <div className="flex-container new">
              {newly}
            </div>
            <div>{newly.length ? 'NEW':''}</div>
            <div className="flex-container old">
              {files}
            </div>
           </div>;
  }
});

React.render(
	<Images />,
	document.getElementById('images')
);