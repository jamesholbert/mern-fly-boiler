import Cookies from 'universal-cookie'
import { DOMAIN } from '../helpers'

export const endPointPing = callback => {
  fetch('/ping')
    .then(res=>res.json())
    .then(res=>callback(res))
  }

export const attemptLogin = (setState, emailField, password = null, token = null, endpoint = 'login') => {
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
	    
	    setState((state) => ({password: '', token, name: parsedName, image, email}))
	    
	    const cookies = new Cookies()
	    cookies.set("jwt", token, { path: '/', expires: new Date(Date.now()+604800000) });
	    cookies.set("email", email, { path: '/', expires: new Date(Date.now()+604800000) });
	  }
	  else if (res.errors) {
	    const keys = Object.keys(res.errors)
	    console.log('problem with: ' + keys.join(', '))
	  }
	  else {
	    console.log(res)
	    console.log('error: ' + res)
	  }
	})
	.catch((error) => {
	  console.log('request had error')
	});
}

export const trySecureEndpoint = (token, socket, callback) => {
	const { id: socketId } = socket

	fetch(DOMAIN + 'api/users/secure', {
	  method: 'GET',
	  headers: {
	    "Content-Type": "application/json; charset=utf-8",
	    authorization: token && 'Token ' + token,
	    socketId
	  }

	}).then(res=>res.json()).then(res=>{
	  callback('email: '+res.user.email)
	})
	.catch((error) => {
	  console.log('request had error')
	  callback('errorMessage: invalid endpoint attempt')
	});    
}