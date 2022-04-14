const express = require('express');
const bcrypt = require('bcrypt-nodejs'); // this is to store passwords securely as hashes. https://www.npmjs.com/package/bcrypt-nodejs
const cors = require('cors');

const app = express();

app.use(express.json()); // this is so that everything in the body is parsed, so that it's js instead of json.
                         // we use it like this bc it's a middleware.

app.use(cors()) // what is cors?

const database = { // this'll get reset every time the server restarts. that's why we use databases for this.
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies', 
            entries: 0,
            joined: new Date() // this displays the date of when it was created
        }, 
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas', 
            entries: 0,
            joined: new Date() 
        }
    ]
}

app.get('/', (req, res) => {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    if (req.body.email === database.users[0].email && req.body.password === database.users[0].password) {
        res.json(database.users[0]); // res.json() is almost the same as res.send(), but it sends a json string between "".
    } else {
        res.status(400).json('failed to sign in.')
    }
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body; // destructuring from the request's body
    bcrypt.hash(password, null, null, function(err, hash) {
        console.log(hash)
    });
    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password, // **ANDREI ELIMINATED THIS LINE so that the pword isnt displayed in the network
        entries: 0,
        joined: new Date() 
    })
    res.json(database.users[database.users.length-1]); // always send a response or the server won't return anything visible
})

app.get('/profile/:id', (req, res) => { // : means id is a parameter
    const { id } = req.params; // destructuring from the request's parameters
    let found = false;
    database.users.forEach(user => {
        if (user.id === id ) { // use user.id to access the id
            found = true;
            return res.json(user); // return so that it stops the loop
        } 
    })
    if (!found) {
        res.status(404).json('not found');
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body; // get id from the body
    let found = false;
    database.users.forEach(user => {
        if (user.id === id ) { 
            found = true;
            user.entries ++
            return res.json(user.entries); 
        } 
    })
    if (!found) {
        res.status(404).json('not found');
    }
})

app.listen(3000, () => {
    console.log('running')
})