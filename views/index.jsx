var ipc = require('ipc');
var React = require('react');
var _ = require('lodash');
var moment = require("moment");
var folderWatch = require('../services/folder-watch.js');

var Toolbar = React.createClass({
  getInitialState(){
    return { hasNewFiles: false };
  },
  componentWillMount(){
    folderWatch(this.folderWatchCallback);
  },
  folderWatchCallback(){
    this.setState({ hasNewFiles: true });
  },
	render(){
		return <nav className="navbar navbar-default">
				<div className="container-fluid">
				 <div className="navbar-header">
				 	<a href="#" className="navbar-brand">
					 Woo
					</a>
				 </div>
         <div className="collapse navbar-collapse pull-right">
          <button type="button" className="btn btn-default navbar-btn">
            <span>{ this.state.hasNewFiles ? 'New Files' : '' }</span>
          </button>
         </div>
				</div>
			</nav>;
	}
});

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
  render(){
    var files = []; 
    this.state.files.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      files.push(<span 
        className="image flex-item square" 
        style={divStyle} 
        key={file.path}></span>);
    });
    
    var newly = [];
    this.state.newly.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      newly.push(<span 
        className="image flex-item square" 
        style={divStyle}
        key={file.path}></span>);
    });
    
    return <div> 
            <Toolbar />
            <div className="">
              <div className="flex-container new">
                {newly}
              </div>
              <div>{newly.length ? 'NEW':''}</div>
              <div className="flex-container old">
                {files}
              </div>
            </div>
           </div>;
  }
});

React.render(
	<Images />,
	document.getElementById('images')
);