var ipc = require('ipc');
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
  sortByDate(){
  },
  render(){
    console.log('rendering', new Date());
    var files = [];
    
    this.state.files.forEach((file) => {
      var divStyle = { backgroundImage: file.stylePath };
      files.push(<span className="image flex-item square" style={divStyle}></span>);
    });
  
    return <div className="flex-container">
            {files.reverse()}
           </div>;
  }
});

React.render(
	<Images />,
	document.getElementById('images')
);