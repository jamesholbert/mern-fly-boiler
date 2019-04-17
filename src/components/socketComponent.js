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

const ExampleUsage = ({ DOMAIN, messages, addMessage }) => {
	return (
		<SocketComponent
			socketAddress={DOMAIN}
			listeners={[ // these get iterated over to become dynamic event listeners `socket.emit('someEvent', ()=>{})`
				{
					name: ['pong', 'message', 'userJoined'], // an array in case you have multiple events where you want the same event fired off
					onEvent: data => console.log(data)
				},
				{
					name: ['doubleAction'],
					onEvent: (data, socket) => { // the second argument is always the socket in case you need to emit more events
						console.log(data)
						socket.emit('someOtherEvent', data.someValue)
					}
				}
		]}
			render={ // the parent component has total control over the presentation of the scoket-connected components
				({ socket }) => ( // destructured state, could just have `state => (`
					<MessageBlock // any chatBox UI you create
						messages={messages}
						sendMessage={newChat => socket.emit('chat', newChat)} // all emit calls happen in the render
					>
						<button onClick={()=>socket.emit('ping')}>Ping</button>
					</MessageBlock>
				)
			}
		/>
	)
}
const MessageBlock = () => <div />