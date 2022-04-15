const express = require('express');
const bcrypt = require('bcrypt-nodejs'); // this is to store passwords securely as hashes. https://www.npmjs.com/package/bcrypt-nodejs
const cors = require('cors');
const knex = require('knex');

const db = knex({ // run knex() and save it as a variable
    client: 'pg', // pg for postgres (knex can be used with other db too)
    connection: {
      host : '127.0.0.1', // localhost
    //   port : 3306,
      user : 'postgres', // owner of the db displayed when using \d command in psql
      password : 'test', // user password
      database : 'brainiac' // name of the db
    }
  });

db.select('*').from('users').then(data => console.log(data));
// if we used a variable to store our data instead of a database, it'd get reset every time the server 
// restarts. that's why we use databases for this.

const app = express();

app.use(express.json()); // this is so that everything in the body is parsed, so that it's js instead of json.
                         // we use it like this bc it's a middleware.

app.use(cors()) // what is cors?

app.get('/', (req, res) => {
    res.send('success');
})

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash) // compare the input password with 
                                                                // the hash from our database, which we get 
                                                                // from the query above.
        if (isValid) {
            return db.select('*')
                .from('users')
                .where('email', '=', req.body.email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
    
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]); // res.json() is almost the same as res.send(), but it sends a json string between "".
    } else {
        res.status(400).json('failed to sign in.')
    }
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body; // destructuring from the request's body
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => { // so that if one operation inside of it fails, they all fail. this is good so that 
                            // there are no inconsistencies between tables if it failed to upload the data to 
                            // one of them but if it loaded it successfully to the other one. this is used
                            // only when u wanna do 2 or more operations (changes to tables).
        trx.insert({ // we now use trx instead of db to do these operations. if it was only one operation,
                     // we could just use db.insert without making a transaction.
            hash: hash,
            email: email
        })
        .into('login') // insert it into the login table
        .returning('email') // return just the email (as a response?)
        .then(loginEmail => { // using the returned email:
            return trx('users') // do another transaction, access our database's users table
                .returning('*') // return all the columns after inserting the new user into the table
                .insert({ // insert into our users table in our database
                    name: name,
                    email: loginEmail[0].email,
                    joined: new Date() 
                })
                .then(user => {
                    res.json(user[0]) // always send a response or the server won't return anything visible
                })
        })
        .then(trx.commit) // if they all work well, make them effective
        .catch(trx.rollback) // if anything fails, roll back the changes
    }) 
})

app.get('/profile/:id', (req, res) => { // : means id is a parameter
    const { id } = req.params; // destructuring from the request's parameters
    db.select('*').from('users').where({
        id: id
    })
        .then(user => {
            if (user.length) { // if that user exists. bc otherwise it'll return an empty array.
                res.json(user[0]) // respond with the user. [0] bc it's an array with the user object inside,
                                  // so to access it we use [0].
            } else {
                res.status(404).json('not found');
            }            
        })
        .catch(err => res.status(400).json('error getting the user'))
})

app.put('/image', (req, res) => {
    const { id } = req.body; // get id from the body
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, () => {
    console.log('running')
})