import React from 'react'

import styled from 'styled-components'

const Container = styled.button`
	margin: 10px;
`

const LogoutButton = ({ name, handleClick }) => (
	<Container onClick={handleClick}>
    	<span className="button-label">Logout of {name}</span>
	</Container>
)

export default LogoutButton
