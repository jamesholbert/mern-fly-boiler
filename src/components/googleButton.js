import React from 'react'

import styled from 'styled-components'

const Container = styled.a`
	-webkit-tap-highlight-color: transparent;
	text-decoration: none;
	display: inline-block;
	max-width: 200px;
	margin-top: 50px;
	border: 1px solid white;
	padding: 0 18px;
	text-align: left;
	width: 100%;
	height: 37px;
	border-radius: 4px;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	-moz-font-feature-settings: "liga" on;
	color: white !important;
	fill: rgba(0, 0, 0, 0.84) !important;
	box-shadow: 0 1px 7px rgba(0, 0, 0, 0.05);
	font: inherit;
	outline: none;
	font-size: 20px;
`

const SvgIcon = styled.span`
	vertical-align: middle;
	fill: rgba(0, 0, 0, 0.54);
	padding-right: 4px;
	height: 37px;
	display: inline-block;
`

const GoogleButton = () => (
	<Container href="http://localhost:8080/api/google/auth/google" className="button">
	  <div>
	    <SvgIcon className="svgIcon t-popup-svg">
	      <svg
	        className="svgIcon-use"
	        width="25"
	        height="37"
	        viewBox="0 0 25 25"
	      >
	        <g fill="none" fillRule="evenodd">
	          <path
	            d="M20.66 12.693c0-.603-.054-1.182-.155-1.738H12.5v3.287h4.575a3.91 3.91 0 0 1-1.697 2.566v2.133h2.747c1.608-1.48 2.535-3.65 2.535-6.24z"
	            fill="#4285F4"
	          />
	          <path
	            d="M12.5 21c2.295 0 4.22-.76 5.625-2.06l-2.747-2.132c-.76.51-1.734.81-2.878.81-2.214 0-4.088-1.494-4.756-3.503h-2.84v2.202A8.498 8.498 0 0 0 12.5 21z"
	            fill="#34A853"
	          />
	          <path
	            d="M7.744 14.115c-.17-.51-.267-1.055-.267-1.615s.097-1.105.267-1.615V8.683h-2.84A8.488 8.488 0 0 0 4 12.5c0 1.372.328 2.67.904 3.817l2.84-2.202z"
	            fill="#FBBC05"
	          />
	          <path
	            d="M12.5 7.38c1.248 0 2.368.43 3.25 1.272l2.437-2.438C16.715 4.842 14.79 4 12.5 4a8.497 8.497 0 0 0-7.596 4.683l2.84 2.202c.668-2.01 2.542-3.504 4.756-3.504z"
	            fill="#EA4335"
	          />
	        </g>
	      </svg>
       	</SvgIcon>
	     <span className="button-label">Sign in with Google</span>
	   </div>
	</Container>
)

export default GoogleButton
