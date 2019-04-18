import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import Cookies from 'universal-cookie'

import GoogleButton from './components/googleButton'
import MessageCenter from './components/messageCenter'
import LogoutButton from './components/logoutButton'
import SocketComponent from './components/socketComponent'

import { DOMAIN, parseUrl } from './helpers'

class App extends Component {
  state={
    emailField: '',
    email: '',
    password: '',
    token: '',
    name: '',
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

  trySecureEndpoint = (token, socket) => {
    const { id: socketId } = socket

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
    const { emailField, password, token, name, image, messages, email } = this.state

    const listeners = [
      {
        name: ['secureMessage'],
        onEvent: mes => this.appendToMessages('secure: '+mes.data)
      },
      {
        name: ['message'],
        onEvent: mes => this.appendToMessages('pong: '+mes)
      }
    ]

    return (
      <div className="App">
        <header className="App-header">
          {image ?
            <img src={image} alt="logo" /> :
            <img src={logo} className="App-logo" alt="logo" />
          }
          <button onClick={this.endPointPing}>End point ping...</button>
          <SocketComponent
            socketAddress={DOMAIN}
            listeners={listeners}
            render={({socket}) => (
              <Fragment>
                <button onClick={()=>socket.emit('message')}>Socket ping...</button>
                <button disabled={token ? false : true} onClick={()=>this.trySecureEndpoint(token, socket)}>Secure End point</button>
              </Fragment>
            )}
          />
          {token
            ? <Fragment>
                <div>You're logged in!</div>
                <LogoutButton name={name} handleClick={this.logout} />
              </Fragment>
            : <Fragment>
                <button onClick={()=>this.setState({emailField: 'arthesius@gmail.com', password: 'better'})}>autofill :D</button>
                <input placeholder='email' value={emailField} onChange={e=>this.setState({emailField: e.target.value})} />
                <input placeholder='password' value={password} onChange={e=>this.setState({password: e.target.value})} />
                <button onClick={this.handleLoginLocal}>login</button>
                <GoogleButton />
              </Fragment>
          }
          <MessageCenter 
            {...{messages, email, DOMAIN}}
            appendToMessages={this.appendToMessages}
          />
        </header>
      </div>
    );
  }
}

export default App;
