import React, { Component, Fragment, useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

import Cookies from 'universal-cookie'
import openSocket from 'socket.io-client';

import GoogleButton from './components/googleButton'
import MessageCenter from './components/messageCenter'
import LogoutButton from './components/logoutButton'

import { DOMAIN, parseUrl } from './helpers'

class App extends Component {
  state={
    emailField: '',
    email: '',
    password: '',
    token: '',
    name: '',
    socket: openSocket(DOMAIN),
    image: '',
    messages: []
  }

  endPointPing = () => {
    fetch('/ping')
      .then(res=>res.json())
      .then(res=>this.appendToMessages(res))
  }

  appendToMessages = message => {
    let newMessages = this.state.messages
    newMessages.unshift(message)
    this.setState({newMessages})
  }

  socketPing = () => {
    this.state.socket.emit('message', 'hello')
    console.log(this.state.socket.room)
  }

  attemptLogin = (emailField, password = null, token = null, endpoint = 'login') => {
    const user = token ? {email: emailField, token} : {email: emailField, password}

    fetch('/api/users/'+endpoint, {
      method: 'POST',
      headers: {
          'content-type': "application/json; charset=utf-8",
          authorization: token && 'Token ' + token
      },
      body: JSON.stringify({user})
    }).then(res=>res.json()).then(res=>{
      if (res.user && res.user.token) {
        const { token, name, image, email } = res.user
        const parsedName = name.indexOf(' ') > -1 ? name.split(' ')[0] : name
        
        this.setState({password: '', token, name: parsedName, image, email})
        
        const cookies = new Cookies()
        cookies.set("jwt", token, { path: '/', expires: new Date(Date.now()+604800000) });
        cookies.set("email", email, { path: '/', expires: new Date(Date.now()+604800000) });
      }
      else if (res.errors) {
        const keys = Object.keys(res.errors)
        this.appendToMessages('problem with: ' + keys.join(', '))
      }
      else {
        console.log(res)
        this.appendToMessages('error: ' + res)
      }
    })
    .catch((error) => {
      console.log('request had error')
      this.appendToMessages('error: invalid login')
    });
  }

  handleLoginLocal = () => {
    const { emailField, password } = this.state

    this.attemptLogin(emailField, password)
  }

  // tryOldSecureEndpoint = () => {
  //   const { token, email, socket: { id: socketId } } = this.state

  //   fetch(DOMAIN + 'api/users/oldsecure', {
  //     method: 'POST',
  //     "headers": {
  //       "Content-Type": "application/json; charset=utf-8"
  //     },
  //     body: JSON.stringify({token, email, socketId })

  //   }).then(res=>res.json()).then(res=>{
  //     this.appendToMessages(res.data)
  //   })
  //   .catch((error) => {
  //     console.log('request had error')
  //     this.setState({errorMessage: 'invalid endpoint attempt'})      
  //   });    
  // }

  trySecureEndpoint = () => {
    const { token, socket: { id: socketId } } = this.state

    fetch(DOMAIN + 'api/users/secure', {
      method: 'GET',
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        authorization: token && 'Token ' + token,
        socketId
      }

    }).then(res=>res.json()).then(res=>{
      this.appendToMessages('email: '+res.user.email)
    })
    .catch((error) => {
      console.log('request had error')
      this.appendToMessages('errorMessage: invalid endpoint attempt')
    });    
  }

  componentDidMount = () => {
    const { socket } = this.state
    socket.on('secureMessage', mes => this.appendToMessages('secure: '+mes.data));
    socket.on('message', mes => this.appendToMessages('pong: '+mes))

    const cookies = new Cookies()
    const oldJwt = cookies.get('jwt')
    const oldEmail = cookies.get('email')

    if(oldJwt){
      this.attemptLogin(oldEmail, null, oldJwt, 'refreshlogin')
    }
    else {
      const currentUrl = document.location.href
      const requestHasToken = currentUrl.indexOf('token=') > -1
      if (requestHasToken) {
        const { name, image, token, email } = parseUrl(currentUrl)

        const parsedName = name.indexOf('%20') > -1 ? name.split('%20')[0] : name
        this.setState({token, name: parsedName, image, email})
        
        cookies.set("jwt", token, { path: '/', expires: new Date(Date.now()+604800000) });
        cookies.set("email", email, { path: '/', expires: new Date(Date.now()+604800000) });

        this.props.history.push("/");
      }
    }
  }

  logout = e => {
    e.preventDefault()
    
    this.setState({name: '', image: '', token: '', email: '', emailField: '', messages: []})
    
    const cookies = new Cookies()
    cookies.remove('jwt', { path: '/' });
    cookies.remove('email', { path: '/' });
  }

  render() {
    const { emailField, password, token, name, image, messages, chatHistory, socket } = this.state

    const messageColumns = window.innerWidth > 1000 ? 3 : 1; 
    return (
      <div className="App">
        <header className="App-header">
          {image ?
            <img src={image} alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" />
          }
          <button onClick={this.endPointPing}>End point ping...</button>
          <button onClick={this.socketPing}>Socket ping...</button>
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
          {!token && <GoogleButton />}
          {/*token && <button onClick={this.trySecureEndpoint}>Secure End point</button>*/}
          {token && <button onClick={this.trySecureEndpoint}>Message from Secure End point</button>}
          {token && <LogoutButton name={name} handleClick={this.logout} />}
          <MessageCenter {...{socket, messages}}/>
        </header>
      </div>
    );
  }
}

export default App;
