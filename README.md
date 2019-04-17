This is my MERN stack boilerplate, complete with a few extra additions for your projects:

#### Core:
* Mongo/Mongoose
* Express
* React
* Node.js

#### Extras:
* sample mongoose models and routes
* local auth using express-jwt
* google oauth2 also using JWT
* socket.io for live server updates with access to database
* (SocketComponent features solid inversion of control using render props)
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
