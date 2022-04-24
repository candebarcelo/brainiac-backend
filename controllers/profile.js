const handleProfileGet = (req, res, db) => { 
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
}

module.exports = {
   handleProfileGet // we don't need to use it twice like 1: 1 bc with ES6 if it's the same value, that's not necessary.
}