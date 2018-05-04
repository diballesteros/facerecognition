import React, { Component } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import 'tachyons';


//React Particles object that contains properties for the background
const particlesOptions = {
  particles: {
    line_linked: {
      shadow: {
        enable: true,
        color: "#3CA9D1",
        blur: 5
      }
    }
  }
}



const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {

  //State: Manages the input of the image url, the image url itself, the coordinates of the facebox, route determines the page, and isSignedIn to determine the login status
  state = {
    input: '',
    imageUrl: '',
    box: {},
    route: 'signin',
    isSignedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  //using the outputs provided by the API, first get the width and height of the image and calculate the columns and rows to fill out the facebox
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  // After recieving the image set the state and coordinates of the facebox
  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box });
  }

  //Pass in value of input field into respective state
  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  }

  //https://cdn2.goabroad.com/images/program_content/5-tips-for-teaching-english-abroad-as-a-person-of-color-2-1462426680.jpg

  // Upon submitting URL use clarifai API method from the BACKEND to receive facebox coordinates
  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    fetch('https://arcane-savannah-46733.herokuapp.com:3000/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://arcane-savannah-46733.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  // Route pages depending on what is clicked and sent in
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({ isSignedIn: true })
    }
    this.setState({ route: route });
  }

  render() {
    // Destructure state
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      //Navigation has properties pertaining to route and login status
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange} />
        {route === 'home'
          ? <div>
            <Logo />
            <Rank name={this.state.user.name}
              entries={this.state.user.entries} />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
          : (route === 'signin'
            ? <Signin
              loadUser={this.loadUser}
              onRouteChange={this.onRouteChange} />
            : <Register
              loadUser={this.loadUser}
              onRouteChange={this.onRouteChange} />
          )
        }
      </div>
    );
  }
}

export default App;
