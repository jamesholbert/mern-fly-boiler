import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import GoogleButton from './components/googleButton'
import LogoutButton from './components/logoutButton'

import openSocket from 'socket.io-client';

import { DOMAIN, parseUrl } from './helpers'

class App extends Component {
  state={
    response: '',
    emailField: '',
    email: '',
    password: '',
    loggedIn: false,
    errorMessage: '',
    token: '',
    name: '',
    socket: openSocket(DOMAIN),
    image: ''
  }


  endPointPing = () => {
    fetch('/ping')
      .then(res=>res.json()
      .then(res=>this.setState({response: res})))
  }

  socketPing = () => {
    console.log('socket ping...')
    this.state.socket.emit('socketping', ()=>console.log('tried'))
  }

  handleLoginLocal = () => {
    const { emailField, password } = this.state
    const user = {email: emailField, password}

    fetch('/api/users/login', {
      method: 'POST',
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({user})
    }).then(res=>res.json()).then(res=>{
      if (res.user && res.user.token) {
        const { token, name, image, email } = res.user
        const parsedName = name.indexOf(' ') > -1 ? name.split(' ')[0] : name
        
        this.setState({loggedIn: true, errorMessage: '', password: '', token, name: parsedName, image, email})

        window.localStorage.setItem("jwt", token);
        window.localStorage.setItem("name", parsedName);
        window.localStorage.setItem("image", image);
        window.localStorage.setItem("email", email);
      }
      else if (res.errors) {
        const keys = Object.keys(res.errors)
        this.setState({errorMessage: 'problem with: ' + keys.join(', ')})
      }
      else {
        console.log(res)
        this.setState({errorMessage: 'error: ' + res})        
      }
    })
    .catch((error) => {
      console.log('request had error')
      this.setState({errorMessage: 'invalid login'})      
    });
  }

  trySecureEndpoint = () => {
    const { token, email, socket: { id: socketId } } = this.state

    fetch(DOMAIN + 'api/users/secure', {
      method: 'POST',
      "headers": {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({token, email, socketId })

    }).then(res=>res.json()).then(res=>{
      console.log(res)
    })
    .catch((error) => {
      console.log('request had error')
      this.setState({errorMessage: 'invalid endpoint attempt'})      
    });    
  }

  componentDidMount = () => {
    const { socket } = this.state
    socket.on('secure', thing => console.log(thing));
    socket.on('pong', mes => console.log(mes))

    const oldJwt = window.localStorage.getItem('jwt')
    const oldName = window.localStorage.getItem('name')
    const oldImage = window.localStorage.getItem('image')
    const oldEmail = window.localStorage.getItem('email')

    const currentUrl = document.location.href
    const requestHasToken = currentUrl.indexOf('token=') > -1
    if (requestHasToken) {
      const { name, image, token, email } = parseUrl(currentUrl)

      const parsedName = name.indexOf('%20') > -1 ? name.split('%20')[0] : name
      this.setState({token, name: parsedName, loggedIn: true, image, email})
      
      window.localStorage.setItem("jwt", token);
      // once refreshing checks server for auth, we won't need these because we'll get them when we authenticate
      window.localStorage.setItem("name", parsedName);
      window.localStorage.setItem("image", image);
      window.localStorage.setItem("email", email);

      this.props.history.push("/");
    }
    else if (oldJwt && oldName) {
      // TODO actually send creds to server, if JWT is still good, login and send profile image to client
      this.setState({token: oldJwt, name: oldName, image: oldImage, email: oldEmail})
    }
  }

  logout = e => {
    e.preventDefault()
    
    this.setState({loggedIn: false, name: '', image: '', token: '', email: '', emailField: ''})
    
    window.localStorage.setItem("jwt", '');
    window.localStorage.setItem("name", '');
    window.localStorage.setItem("image", '');
    window.localStorage.setItem("email", '');
  }

  render() {
    const { emailField, password, errorMessage, token, name, image } = this.state

    return (
      <div className="App">
        <header className="App-header">
          {image ?
            <img src={image} alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" />
          }
          <button onClick={this.endPointPing}>End point ping...</button>
          <button onClick={this.socketPing}>Socket ping...</button>
          {this.state.response}
          {
            token ? 
              <Fragment>
                <div>You're logged in!</div>
                
              </Fragment>
              : 
              <Fragment>
                <button onClick={()=>this.setState({emailField: 'arthesius@gmail.com', password: 'better'})}>autofill :D</button>
                <input placeholder='email' value={emailField} onChange={e=>this.setState({emailField: e.target.value})} />
                <input placeholder='password' value={password} onChange={e=>this.setState({password: e.target.value})} />
                <button onClick={this.handleLoginLocal}>login</button>
              </Fragment>
          }
          {errorMessage && <div>{errorMessage}</div>}
          {!token && <GoogleButton />}
          {token && <button onClick={this.trySecureEndpoint}>Secure End point</button>}
          {token && <LogoutButton name={name} handleClick={this.logout} />}

        </header>
      </div>
    );
  }
}

export default App;
