const express = require('express');
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require('express-rate-limit');

const app = express();

const db = monk(process.env.MONGO_URI || 'localhost:27017/meower');

const mews = db.get('mews');

const filter = new Filter();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Meower! 🤣🐈'
    });
});

app.get('/mews', (req, res) => {
    mews
        .find()
        .then(mews => {
            res.json(mews);
        });
});

function isValidMew(mew) {
    return mew.name && mew.name.toString().trim() != '' &&
        mew.name && mew.name.toString().trim() != '';
}

app.use(rateLimit({
    windowMs: 30*1000,
    max: 1
}));

app.post('/mews', (req, res) => {
    if(isValidMew(req.body)){
        //insert into db..
        const mew = {
            name: filter.clean(req.body.name.toString()),
            content: filter.clean(req.body.name.toString()),
            created: new Date()
        };

        console.log(mew);
        mews
            .insert(mew)
            .then(createdMew => {
                res.json(createdMew);
            });
    }else{
        res.status(422);
        res.json({
            message: 'Hey! name and content are required!'
        });
    }
});

app.listen(5000, () => {
    console.log('listening on http://localhost:5000');
});