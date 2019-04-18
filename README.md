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
    * https://mlab.com/ is a decent place to get a database up and running quickly
    * https://console.developers.google.com/ 
        * whitelist Authorized JavaScript origins and Authorized JavaScript callback URIs for `http://localhost:8080` AND `http://whatever.your.url.is` respectively)
* `yarn install`
* `yarn build`
* `yarn start`

## Project Scripts

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
const SkyShip = ({ DOMAIN }) => {
  const [ location, setLocation ] = useState('home')

  return (
    <SocketComponent
      socketAddress={DOMAIN}
      listeners={[ 
        // these get iterated over to become dynamic event listeners, normally
        // they look like `socket.on('someEvent', ()=>console.log('hello world'))`
        {
          name: ['changeLocation'],
          onEvent: place => setLocation(place)
        }
	  ]}
      render={ 
        // the parent component has total control over the presentation of the socket-connected components
        ({ socket }) => (
          <div> {/* any UI you want */}
            <h3>Ship's current location: {location}</h3>
            // like normal sockets, whatever you `emit` will trigger a server event where you respond however you want
            <button onClick={() => socket.emit('moveShip', 'Store')}>Store</button>
            <button onClick={() => socket.emit('moveShip', 'Disneyland')}>Disneyland</button>
            <button onClick={() => socket.emit('moveShip', 'Universal Studios')}>Universal Studios</button>
          </div>
        )
      }
    />
  )
}
```