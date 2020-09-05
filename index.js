//importing

const express = require('express');
const mongoose = require('mongoose');
const Messages = require('./dbMessages');

const cors = require('cors');
//app config
const app = express();
const Port = 8000;
const Pusher = require('pusher');
const db = mongoose.connection;

//middleware
app.use(express.json());

app.use(cors());

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.set("Access-Control-Allow-Headers", "*");
//     next();
// });

const pusher = new Pusher({
    appId: '1067346',
    key: 'c2e77945a521ffbf0f45',
    secret: '4c68af2e08bb94478bde',
    cluster: 'ap2',
    encrypted: true
});

// pusher.trigger('my-channel', 'my-event', {
//     'message': 'hello world'
// });


//db config
const connection_url = 'mongodb+srv://whatsapp:VAJuVIsGrf60pBPX@cluster0.enhdn.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});


db.once('open', () => {
    console.log('Db is connected!');

    const msgCollection = db.collection("whatsapps");
    const changeStream = msgCollection.watch();

    changeStream.on('change', (change) => {
        console.log(change);

        if (change.operationType === 'insert') {
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',
                {
                    name: messageDetails.name,
                    message: messageDetails.message,
                    received:messageDetails.received
                }
            );
        } else {
            console.log('Error triggering Pusher');
        }

    })
})


//api routes
app.get('/', (req, res) => res.status(200).send('hello World'))

app.get('/api/v1/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.post('/api/v1/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(`new message created: \n ${data}`)
        }
    })
})



//listen
app.listen(Port, (err) => {
    if (err) { console.log('Error occured'); return; }

    console.log(`Server is running ${Port}`);
})