This is my MERN stack boilerplate, complete with a few extra additions for your projects:

#### Core:
* Mongo/Mongoose
* Express
* React
* Node.js

#### Extras:
* sample mongoose models and routes
* authentication using express-jwt
    * local auth
    * google oauth2
* socket.io for live server updates with access to database
    * sample chat features
    * SocketComponent features inversion of control using render props
* React Router

### Getting Started:
* rename or copy `.env.template` to `.env`
* fill in appropriate variables in `.env`
* `yarn install`
* `yarn build`
* `yarn start`

## Available Scripts

(See package.json for more details)

### `yarn start`

Runs the node.js server, listens on port 8080 during development. `http://localhost:8080`
Serves up build files (won't work if you haven't ran `yarn build`). For development run the 
React Environment instead.

### `yarn watch`

Launches react development environment on port 3000. `http://localhost:3000`

### `yarn build`

Creates static build files for front end. Only necessary in production environment and if you're testing google oauth, the redirect _must_ take you to `http://localhost:8080/`, so you'll need to run `yarn build` and restart the nodemon server if you've made any changes to the front end that you're expecting to see.

### Procfile is for deployment on Heroku, don't forget to add the necessary `config vars` found in `.env`

The front end was initially bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

SocketComponent sample usage:

```
const LocationSetter = ({ DOMAIN }) => {
	const [ location, setLocation ] = useState('home')

	return (
		<SocketComponent
			socketAddress={DOMAIN}
			listeners={[ 
				// these get iterated over to become dynamic event listeners `socket.on('someEvent', ()=>{})`
				{
					name: ['changeLocation'], // an array in case you have multiple events where you want the same event fired off
					onEvent: place => setLocation(place)
				}
		]}
			render={ 
				// the parent component has total control over the presentation of the socket-connected components
				// most emit calls happen in the render prop
				({ socket }) => ( // destructured state, could just have `state => (`
					<div> {/* any UI you create */}
						// like normal sockets, whatever you `emit` will trigger a server event where you respond however you want
						<button onClick={() => socket.emit('changeLocation', 'Store')}>Store</button>
						<button onClick={() => socket.emit('changeLocation', 'Disneyland')}>Disneyland</button>
						<button onClick={() => socket.emit('changeLocation', 'Universal Studios')}>Universal Studios</button>
					</div>
				)
			}
		/>
	)
}
````