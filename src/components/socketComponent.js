import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import openSocket from 'socket.io-client';

class SocketComponent extends Component {
  state = {
    listeners: [],
    socket: null,
    socketAddress: null
  };
  componentDidMount() {
    const { onConnect, socketAddress } = this.props;
    const socket = openSocket(socketAddress);
    const listeners = {};

    if (onConnect) {
      const [event, val] = onConnect;
      listeners[event] = socket.on('connect', () => socket.emit(event, val));
    }
    this.props.listeners.forEach(listener => {
      listener.name.forEach(name => {
        listeners[name] = socket.on(name, val => listener.onEvent(val, socket)); // socket sent in as second argument so that you can make emit another event
      });
    });
    this.setState({ socket, listeners, socketAddress });
  }
  componentWillUnmount() {
    const { listeners, socket } = this.state;
    for (const eventName in listeners) {
      socket.removeListener(eventName, listeners[eventName]);
    }
    socket.disconnect(true);
  }

  render() {
    return (
      <Fragment>
        {this.props.render(this.state)}
        {this.props.children}
      </Fragment>
    );
  }
}
SocketComponent.propTypes = {
  listeners: PropTypes.array.isRequired,
  onConnect: PropTypes.array,
  render: PropTypes.func.isRequired,
  socketAddress: PropTypes.string.isRequired
};

export default SocketComponent;
