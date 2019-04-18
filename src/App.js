import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';

import Cookies from 'universal-cookie'

import GoogleButton from './components/googleButton'
import MessageCenter from './components/messageCenter'
import LogoutButton from './components/logoutButton'
import SocketComponent from './components/socketComponent'

import { endPointPing, attemptLogin, trySecureEndpoint } from './api-requests'

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

  appendToMessages = message => {
    let newMessages = this.state.messages
    newMessages.unshift(message)
    this.setState({newMessages})
  }

  handleLoginLocal = () => {
    const { emailField, password } = this.state

    attemptLogin(val=>this.setState(val), emailField, password)
  }

  componentDidMount = () => {
    const cookies = new Cookies()
    const oldJwt = cookies.get('jwt')
    const oldEmail = cookies.get('email')

    if(oldJwt){
      attemptLogin(val=>this.setState(val), oldEmail, null, oldJwt, 'refreshlogin')
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
          <button onClick={()=>endPointPing(this.appendToMessages)}>End point ping...</button>
          <SocketComponent
            socketAddress={DOMAIN}
            listeners={listeners}
            render={({socket}) => (
              <Fragment>
                <button onClick={()=>socket.emit('message')}>Socket ping...</button>
                <button disabled={token ? false : true} onClick={()=>trySecureEndpoint(token, socket, this.appendToMessages)}>Secure End point</button>
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
