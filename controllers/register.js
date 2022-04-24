const handleRegister = (req, res, db, bcrypt) => { // receive the dependencies injected, and then the whole function
    const { email, name, password } = req.body; // destructuring from the request's body
    
    if (!email || !name || !password) {
        return res.status(400).json('incorrect field submission');
    } // bc of the return, the next part won't be logged in.
    
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
}

module.exports = {
    handleRegister: handleRegister
}