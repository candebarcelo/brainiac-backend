const handleSignin = (req, res, db, bcrypt) => {
    const { email, password } = req.body; // destructuring from the request's body
    
    if (!email || !password) {
        return res.status(400).json('incorrect field submission');
    }

    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash) // compare the input password with 
                                                                // the hash from our database, which we get 
                                                                // from the query above.
        if (isValid) {
            return db.select('*')
                .from('users')
                .where('email', '=', email)
                .then(user => {
                    res.json(user[0])
                })
                .catch(err => res.status(400).json('unable to get user'))
        } else {
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))
}

module.exports = {
    handleSignin: handleSignin
}