import React, { useState, useEffect, useRef } from 'react'

import styled from 'styled-components'

import Grid from './grid'
import SocketComponent from './socketComponent'

const MessageContainer = styled.div`
  bottom: 5px;
  width: 100%;
  padding: 10px;
`

const Responses = styled.div`
  height: 250px;
  max-height: 250px;
  width: 100%;
  overflow: scroll;
  border: solid 1px white;
  border-radius: 3px;
  font-size: 15px;
`

const MessageCenter = ({ messages, appendToMessages, email, DOMAIN }) => {
  const [ chatText, setChatText ] = useState('')
  const [ chatHistory, setChatHistory ] = useState([])
  const [ room, setRoom ] = useState('room2')
  const chatHistoryRef = useRef(chatHistory)

  useEffect(()=>{
    // without this the previous value of chatHistory that `appendToChat()` uses is an empty array,
    // perhaps this can be solved otherwise, but normal chat features won't rely purely on the front end
    chatHistoryRef.current = chatHistory
  }, [chatHistory])

  const joinRoom = (room, socket) => {
    socket.emit('join', {room, email})
    appendToMessages('joined '+room)
    setRoom(room)
  }

  const chatKeyPressed = (event, socket) => {
    var code = event.keyCode || event.which;
    if(code === 13) { // 13 is the `enter` keycode
        socket.emit('chat', email+': '+chatText)
        appendToChat(email+': '+chatText)
        setChatText('')
    }
  }

  const appendToChat = chat => { 
    // Billy doesn't save his chat history in a database.
    // not saving your real chat history in the database would be a silly thing.
    // dont' be like Billy.
    let newChatHistory = chatHistoryRef.current.slice()
    newChatHistory.unshift(chat)
    setChatHistory(newChatHistory)
  }

  const rooms = ['room1', 'room2', 'room3'] // this list should probably come from the server but ¯\_(ツ)_/¯ 

  return (
    <MessageContainer>
      {email &&
        <SocketComponent
          socketAddress={DOMAIN}
          onConnect={['connectClient', email]}
          listeners={[
            {
              name: ['connectedClient', 'chat', 'someoneJoined', 'someoneLeft'],
              onEvent: appendToChat
            },
            {
              name: ['newRoom'],
              onEvent: () => setChatHistory([])
            }
          ]}
          render={({ socket }) => (
            <Grid numColumns={2}>
              <Responses>
                <div>
                  {rooms.map(room=>
                    <JoinRoomButton handleClick={()=>joinRoom(room, socket)} room={room} key={room} />
                  )}
                </div>
                Room: {room}
                <input
                  value={chatText}
                  placeholder='chat...'
                  onKeyPress={(e)=>chatKeyPressed(e, socket)}
                  onChange={(e)=>setChatText(e.target.value)}
                />
                {chatHistory.map((mes, i)=><div key={i}>{mes}</div>)}
              </Responses>
              <Responses>
                {messages.map((mes, i)=><div key={i}>{mes}</div>)}
              </Responses>
            </Grid>
          )}
        />
      }
    </MessageContainer>
  )
}

export default MessageCenter

const JoinRoomButton = ({ room, handleClick }) => <button onClick={handleClick}>Join {room}</button>