import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types';

import openSocket from 'socket.io-client';

class SocketComponent extends Component {
	constructor(props){
		super(props)
		const socket = openSocket(props.socketAddress)
		const listeners = {}
		
		if(props.onConnect){
			const [ ev, val ] = props.onConnect
			listeners[ev] = socket.on('connect', () => socket.emit(ev, val))
		}

		props.listeners.forEach(listener => {
			listener.name.forEach(name => {
				listeners[name] = socket.on(name, val => listener.onEvent(val, socket)) // socket sent in as second argument so that you can make emit another event
			})
		})
		this.state = {socket, ...listeners}
	}

	render(){
		return (
			<Fragment>
				{this.props.render(this.state)}
				{this.props.children}
			</Fragment>
		)
	}
}
SocketComponent.propTypes = {
	listeners: PropTypes.array.isRequired,
	onConnect: PropTypes.array,
	render: PropTypes.func.isRequired,
	socketAddress: PropTypes.string.isRequired
};

export default SocketComponent
