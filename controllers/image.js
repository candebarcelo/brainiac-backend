const Clarifai = require('clarifai');

const app = new Clarifai.App({ // we moved Clarifai to the backend so as to protect our key, bc if it's on the frontend,
                               // anyone can see it.
    apiKey: process.env.CLARIFAI_KEY
  }); // check here to see if the Clarifai servers are down https://www.clarifai.com/models/face-detection 

const handleApiCall = (req, res) => {
    app.models
        .predict('a403429f2ddf4b49b307e318f00e528b', req.body.input) 
        .then(data => {res.json(data)}) // it makes the data received be the response when using this endpoint.
        .catch(err => res.status(400).json('unable to work with API'))
}

const handleImage = (db) => (req, res) => { /* in this case, u can only receive (db) and whenever the /image endpoint is 
                                         used, it runs the function of importing db, and then it uses that function's 
                                         result to run handleImage part 2 with the (req, res) input that it 
                                         automatically receives. */
    const { id } = req.body; // get id from the body
    db('users').where('id', '=', id)
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries)
        })
        .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
}