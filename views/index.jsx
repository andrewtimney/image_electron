var ipc = require('ipc');
var React = require('react');
var _ = require('lodash');
var moment = require("moment");
var folderWatch = require('../services/folder-watch.js');
var ReactWinJS = require('react-winjs');

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
		return <div className="ui menu">
            <div className="header item">
              Images
            </div>
            <div className="right menu">
              <a className="item">
                { this.state.hasNewFiles ? 'New Files' : 'Watching for new files' }
              </a>
            </div>
				  </div>;
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
      var divStyle = { backgroundImage: file.stylePath, width:'200', height:'200' };
      newly.push(<span 
        className="image flex-item square" 
        style={divStyle}
        key={file.path}></span>);
    });
    
    var dateSource = new WinJS.Binding.List(this.state.files);
    var listViewItemRenderer = ReactWinJS.reactRenderer(function (item) {
            var divStyle = { backgroundImage: item.data.stylePath, height:'200px', width:'200px', display: '-ms-grid' };
            console.log(item.data);
            return <div 
                    className="image square"
                    style={divStyle}>
                  </div>;
          });
    var listViewLayout = { type: WinJS.UI.GridLayout };
    
    return <ReactWinJS.ListView
      itemDataSource={dateSource.dataSource}
      itemTemplate={listViewItemRenderer}
      style={{height:'100vh'}}
      layout={listViewLayout} />;
    /*
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
           </div>;*/
  }
});

React.render(
	<Images />,
	document.getElementById('images')
);