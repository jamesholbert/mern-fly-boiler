This is my MERN stack boilerplate, complete with a few extra additions for your projects:
* Mongo/Mongoose
** Sample model and route
* Express
* React
* Node.js

Also:
* socket.io for live server updates
* local auth using JWT
* google oauth2

#### To get started, rename `.env.template` to `.env` and replace the environment variables with your project specific values

The front end was initially bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

(See package.json for more details)

### `yarn start`

Runs the node.js server, listens on port 8080 during development. `http://localhost:8080`
Serves up build files if they exist. For development run the React Environment instead.
Also connects to mongo server.

### `yarn watch`

Launches react development environment on port 3000. `http://localhost:3000`

### `yarn build`

Creates static build files for front end.
Only necessary in production environment.

### Procfile is for deployment on Heroku