import React from 'react';
import ReactDOM from 'react-dom';
import * as posenet from '@tensorflow-models/posenet';
import { Player } from 'video-react';
import '../node_modules/video-react/dist/video-react.css';
import './App.css';

class App extends React.Component {
  constructor(props){    
    super(props)    
    this.state = {      
      file: null    
    }    
    this.handleChange = this.handleChange.bind(this)  
    this.handleConvert = this.handleConvert.bind(this)  
    this.handleDownload = this.handleDownload.bind(this)  
  }  

  handleChange(event) {    
    var files = []
    Array.from(event.target.files).map(file => { 
      files.push({
        name: file.name,
        url: URL.createObjectURL(file)
      })
    });
    this.setState({      
      file: files
    })
  }  

  handleConvert(){
    var elements = []

    // async function estimatePoseOnImage(imageElement) {
    //   const imageScaleFactor = 0.50;
    //   const flipHorizontal = false;
    //   const outputStride = 16;
      
    //   // load the posenet model from a checkpoint
    //   const net = await posenet.load();

    //   const pose = await net.estimateSinglePose(imageElement, imageScaleFactor, flipHorizontal, outputStride);

    //   console.log(pose)

    //   return pose;
    // }

    const estimatePoses = () => {
      return new Promise((resolve, reject) =>{
        const imageElements = document.getElementsByClassName("video-frame");

        const results = Promise.all(Array.from(imageElements).map(async imageElement => {
          
          // load the posenet model from a checkpoint
          const net = await posenet.load({
            architecture: 'ResNet50',
            outputStride: 32,
            inputResolution: { width: 1920, height: 1080 },
            quantBytes: 2
          });
    
          const pose = await net.estimateSinglePose(imageElement, {
            flipHorizontal: false
          });

          console.log(imageElement)
          console.log(pose)
    
          return {
            id: parseInt(imageElement.id),
            pose: pose
          };
        }))
    
        resolve(results);
      });
    }

    estimatePoses().then(poses => {
      console.log("done");

      console.log(poses.sort((a, b) => (a.id > b.id) ? 1 : -1))

      const newposes = poses.sort((a, b) => (a.id > b.id) ? 1 : -1).map(pose => {
        return pose.pose;
      })

      this.setState({poses: newposes})
    })
  }

  componentDidMount() {

  }

  handleDownload()
  {
    let filename = "export.json";
    let contentType = "application/json;charset=utf-8;";
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(this.state.poses)))], { type: contentType });
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var a = document.createElement('a');
      a.download = filename;
      a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(this.state.poses));
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  render() {
    var frames = null
    var downloadbtn = null
    if(this.state.file)
    {
      frames = this.state.file.map((f, index) => {
        return <img className='video-frame' id={index} src={f.url}/>
      })
    }

    if(this.state.poses)
    {
      downloadbtn = 
      <button onClick={this.handleDownload}>Download</button>
    }

    return (      
      <div>        
        <input type="file" accept=".jpg,.jpeg,.png" onChange={this.handleChange} multiple/>      
        {/* <Player
          playsInline
          src={this.state.file}
        /> */}
        {/* <img id='image-test' style={{maxHeight: '300px'}} src={this.state.file}/> */}
        <button onClick={this.handleConvert}>Convert</button>
        {downloadbtn}
        {frames}
      </div>    
    ); 
  }
}

export default App;
