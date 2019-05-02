import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import axios from 'axios'

export default class App extends Component {
  
  state = {
    file: null,
    scanning: false,
    scan: null,
    message: 'Upload a photo of an album to get started'
  }

  uploadHandler = (event) => {
    console.log(event.target.files[0])
    const data = new FormData() 
    data.append('file', event.target.files[0])

    this.setState({
      file: event.target.files[0],
      scanning: true,
      scan: null,
      message: null
    })

    axios.post('/api/scans', data, {})
    .then(res => {
      console.log(res.data)
      this.setState({ 
        scanning: false,
        scan: res.data
      })
    }).catch(error => {
      if (error.response) {
        this.setState({
          message: error.response.data.message
        })
      }
      this.setState({ 
        scanning: false,
      })
    })
  }

  feedbackHandler = (correct, event) => {
    console.log(correct)
    const data = { correct }

    axios.patch(`/api/scans/${this.state.scan.scanId}`, data, {})

    if (correct) {
      this.setState({ 
        message: `Great! On to the next album.`,
        scan: null
      })
    } else {
      this.setState({ 
        message: `Sorry about that, we're still working out all the kinks. Let's try again.`,
        scan: null
      })
    }
  }

  render() {
    const { scanning, scan } = this.state

    const content = () => {
      switch(true) {
        case scanning:
          return <FontAwesomeIcon className='fa-spin' icon={faCompactDisc} size='5x' color='#dc4b99' />
        case scan!==null:
          return (
            <div className="album">
              <div className="message"></div>
                <div className="album-info">
                    <h2>{scan.album.name}</h2>
                    <h3>by {scan.album.artists}</h3>
                </div>
                <div className="album-cover">
                    <img src={scan.album.imageURL} alt='Album'/>
                </div>
                <div className="spotify-link">
                    <a href={`https://open.spotify.com/album/${scan.album.spotifyId}`} target="_blank" className="spotify-button" rel="noopener noreferrer">Listen On Spotify</a> 
                </div>
                <div className="feedback">
                    <h4>How'd We Do?</h4>
                    <ul>
                      <li><button className="upload-button" onClick={(e) => this.feedbackHandler(true, e)}>Right</button></li>
                      <li><button className="upload-button" onClick={(e) => this.feedbackHandler(false, e)}>Wrong</button></li>
                    </ul>
                </div>
            </div>
          )
        default:
          return (
            <div className="button-area">
              <div className="upload-btn-wrapper">
                <label className="upload-button">
                  Upload Photo <input type="file" name="upload" onChange={this.uploadHandler} />
                </label>    
              </div>
            </div>
          )
      }
    }

    return (
      <div className="container">
        <div className="row">
          <div className="column">
            <div className="message">
                <h3>{this.state.message}</h3>
            </div>
            {content()}
          </div>
        </div>
        <div className="footer">
          <p>Powered by <a href="http://www.plynth.com">Plynth</a></p>
        </div>
      </div>
    )
  }
}