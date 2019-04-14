import React, { useState, useEffect, useRef } from 'react'

import styled from 'styled-components'

import Grid, { Cell } from './grid'

const Responses = styled.div`
  height: 250px;
  max-height: 250px;
  width: 100%;
  overflow: scroll;
  border: solid 1px white;
  border-radius: 3px;
  font-size: 15px;
`

const MessageContainer = styled.div`
  bottom: 5px;
  width: 100%;
  padding: 10px;
`

const MessageCenter = ({ socket, messages, appendToMessages, email }) => {
  const [ chatMessage, setChatMessage ] = useState('')
  const [ chatHistory, setChatHistory ] = useState([])
  const [ room, setRoom ] = useState('room2')
  const chatHistoryRef = useRef(chatHistory)

  useEffect(()=>{
    // without this the previous value of chatHistory that `appendToChat()` uses is an empty array
    // perhaps this can be solved otherwise, but normal chat features won't rely purely on the front end
    chatHistoryRef.current = chatHistory
  }, [chatHistory])

  useEffect(()=>{
    socket.on('chat', chat => {
      appendToChat(chat)
    })
    socket.on('newRoom', newRoom => {
      setRoom(newRoom)
      setChatHistory([])
    })
  }, [])

  const joinRoom = room => {
    socket.emit('join', room)
    appendToMessages('joined '+room)
  }

  const chatKeyPressed = (event) => {
    var code = event.keyCode || event.which;
    if(code === 13) { //13 is the `enter` keycode
        socket.emit('chat', email+': '+chatMessage)
        appendToChat(email+': '+chatMessage)
        setChatMessage('')
    }
  }

  const appendToChat = chat => { 
    // Greg doesn't save his chat history in a database.
    // not saving your real chat history in the database would be a silly thing.
    // dont' be like Greg.
    let newChatHistory = chatHistoryRef.current.slice()
    newChatHistory.unshift(chat)
    setChatHistory(newChatHistory)
  }

  return (
    <MessageContainer>
      <Grid numColumns={2}>
        <Responses>
          {messages.map((mes, i)=><div key={i}>{mes}</div>)}
        </Responses>
        <Responses>
          <div>
            <button onClick={()=>joinRoom('room1')}>Join room1</button>
            <button onClick={()=>joinRoom('room2')}>Join room2</button>
            <button onClick={()=>joinRoom('room3')}>Join room3</button>
          </div>
          Room: {room}
          <input
            value={chatMessage}
            placeholder='chat...'
            onKeyPress={chatKeyPressed}
            onChange={(e)=>setChatMessage(e.target.value)}
          />
          {chatHistory.map((chat, i)=><div key={i}>{chat}</div>)}
        </Responses>
      </Grid>
    </MessageContainer>
  )
}

export default MessageCenter