const fetch = require("node-fetch");

const handleApiCall = (req, res) => {
    const PAT = process.env.PAT;
    const USER_ID = process.env.USER_ID;       
    const APP_ID = process.env.APP_ID;
    const MODEL_ID = process.env.MODEL_ID;
    const MODEL_VERSION_ID = process.env.MODEL_VERSION_ID;
    const IMAGE_URL = req.body.input;

    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": IMAGE_URL
                    }
                }
            }
        ]
    });

    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    };

    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
        .then(response => response.text())
        .then(result => {res.json(JSON.parse(result))})
        .catch(error => res.status(400).json('unable to work with API'));
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