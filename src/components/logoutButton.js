import React from 'react'

import styled from 'styled-components'

const Container = styled.a`

`

const LogoutButton = ({ name, handleClick }) => (
	<Container href='' onClick={handleClick}>
	  <div>
	    <span className="button-label">Logout of {name}</span>
	  </div>
	</Container>
)

export default LogoutButton
