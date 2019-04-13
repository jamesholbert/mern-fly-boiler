import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import styled from 'styled-components'
import Cookies from 'universal-cookie'
import openSocket from 'socket.io-client';

import GoogleButton from './components/googleButton'
import LogoutButton from './components/logoutButton'
import Grid, { Cell } from './components/grid'

import { DOMAIN, parseUrl } from './helpers'

class App extends Component {
  state={
    emailField: '',
    email: '',
    password: '',
    errorMessage: '',
    token: '',
    name: '',
    socket: openSocket(DOMAIN),
    image: '',
    messages: []
  }

  appendToMessages = message => {
    let { messages } = this.state
    messages.unshift(message)
    this.setState({messages})
  }

  endPointPing = () => {
    fetch('/ping')
      .then(res=>res.json())
      .then(res=>this.appendToMessages(res))
  }

  socketPing = () => {
    console.log('socket ping...')
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
        
        this.setState({errorMessage: '', password: '', token, name: parsedName, image, email})
        
        const cookies = new Cookies()
        cookies.set("jwt", token, { path: '/', expires: new Date(Date.now()+604800000) });
        cookies.set("email", email, { path: '/', expires: new Date(Date.now()+604800000) });
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

  handleLoginLocal = () => {
    const { emailField, password } = this.state

    this.attemptLogin(emailField, password)
  }

  // trySecureEndpoint = () => {
  //   const { token, email, socket: { id: socketId } } = this.state

  //   fetch(DOMAIN + 'api/users/secure', {
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
      // this.appendToMessages(res.user.email)
      console.log(res)
    })
    .catch((error) => {
      console.log('request had error')
      this.setState({errorMessage: 'invalid endpoint attempt'})      
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

  joinRoom = room => {
    this.state.socket.emit('join', room)
  }

  render() {
    const { emailField, password, errorMessage, token, name, image, messages } = this.state

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
          {errorMessage && <div>{errorMessage}</div>}
          {!token && <GoogleButton />}
          {/*token && <button onClick={this.trySecureEndpoint}>Secure End point</button>*/}
          {token && <button onClick={this.trySecureEndpoint}>Message from Secure End point</button>}
          {token && <LogoutButton name={name} handleClick={this.logout} />}
          <MessageContainer>
            <Grid numColumns={3}>
              <Responses>
                <button onClick={()=>this.joinRoom('room1')}>Join room1</button>
                <button onClick={()=>this.joinRoom('room2')}>Join room2</button>
                <button onClick={()=>this.joinRoom('room3')}>Join room3</button>
              </Responses>
              <Responses>
                {messages.map((mes, i)=><div key={i}>{mes}</div>)}
              </Responses>
              <Cell />
            </Grid>
          </MessageContainer>
        </header>
      </div>
    );
  }
}

export default App;

const Responses = styled.div`
  max-height: 200px;
  min-height: 200px;
  width: 100%;
  overflow: scroll;
  border: solid 1px white;
  border-radius: 3px;
  font-size: 15px;
`

const MessageContainer = styled.div`
  position: fixed;
  bottom: 5px;
  width: 100%;
  // margin: 10px;
  padding: 10px;
`