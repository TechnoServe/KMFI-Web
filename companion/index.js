require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const os = require('os');
// const path = require('path');
const express = require('express');
const bodyParser = require('body-parser')
const session = require('express-session');
const cors = require('cors');
const companion = require('@uppy/companion');
const serverPort = process.env.PORT || 5020

const companionOptions = {
    debug: !isProduction,
    secret: process.env.COMPANION_SECRET,
    providerOptions: {
        drive: {
            key: process.env.GOOGLE_DRIVE_KEY,
            secret: process.env.GOOGLE_DRIVE_SECRET,
        },
    },
    server: {
        host: (isProduction ? process.env.APP_URL : process.env.DEV_APP_URL).replace(/^https?:\/\//, ''),
        protocol: isProduction ? 'https' : 'http',
        // This MUST match the path you specify in `app.use()` below:
        path: '/integration/companion',
    },
    filePath: os.tmpdir(),
    // filePath: path.resolve('./tmp'),
};

const app = express();
app.use(bodyParser.json())
app.use(cors());
app.use(session({secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true, proxy: true,}));
app.use(companionOptions.server.path, companion.app(companionOptions));
app.get('/', (req, res) => {
    res.send('Hello World!')
})
const server = app.listen(serverPort, () => {
    console.log(`Companion app listening at http://localhost:${serverPort}`)
})
companion.socket(server);
