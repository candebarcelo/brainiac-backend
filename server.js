const express = require('express');
const bcrypt = require('bcrypt-nodejs'); // this is to store passwords securely as hashes. 
                                         // https://www.npmjs.com/package/bcrypt-nodejs
const cors = require('cors');
const knex = require('knex'); 

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

const db = knex({ // run knex() and save it as a variable
    client: 'pg', // pg for postgres (knex can be used with other db too)
    connection: {
      connection: {
        connectionString : process.env.DATABASE_URL, // dynamic environment variable
        ssl: true
      }
    }
  });

db.select('*').from('users').then(data => console.log(data));
// if we used a variable to store our data instead of a database, it'd get reset every time the server 
// restarts. that's why we use databases for this.

const app = express();

app.use(express.json()); // this is so that everything in the body is parsed, so that it's js instead of json.
                         // we use it like this bc it's a middleware.


app.use(cors()) // cors is to allow remote access control. bc otherwise Chrome doesn't trust our server 


app.get('/', (req, res) => {
    res.send('success'); 
})


app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) }) /* this is dependency injection. bc the 
                                                    handleSignin function needs the req, res, db and bcrypt, we need to 
                                                    pass them down like this. sort of like props, but it's dependency 
                                                    injection. */

app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) }) 
            // : means id is a parameter

app.put('/image', image.handleImage(db)) /* we can also do it like this. not as an arrow function here, but u only pass 
                                        the dependencies to the handleImage, and then inside the image.js file u make it 
                                        two consecutive arrow functions, one to import db and immediately another to use 
                                        (req, res) to run the whole function. */

app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) }) 


app.listen(process.env.PORT || 3000, () => { // if running on Heroku, use the port they give us, otherwise use 3000.
    console.log(`running on port ${process.env.PORT}`)
})