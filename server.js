const express = require("express");
const cors = require("cors");
const session = require('express-session')
const moment = require('moment-timezone');
const cron = require('node-cron');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const version = require('./version');
const fetch = require('node-fetch');
const db = require("./app/models");
const axios = require('axios');
const { documentLogs } = require('./app/functions/documentLogFunctions');

require('dotenv').config();
const app = express();

const user_account = db.user_account;
const document_log = db.document_log;

const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;

const allowedIPs = ['http://localhost:4200', 'http://localhost:4201', 'https://cloud.mongodb.com'];

db.mongoose.set('strictQuery', false);

const corsOptions = {
    origin: allowedIPs,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Konfigurasi express-session
app.use(session({
    secret: 'sm139pfjfalf20nva', // Kunci rahasia untuk sesi
    resave: false,        // Paksa simpan ulang sesi yang tidak berubah
    saveUninitialized: true, // Simpan sesi yang belum diinisialisasi
    cookie: { secure: false } // Opsi cookie (secure harus true jika dalam produksi dengan HTTPS)
}));

app.set('trust proxy', true);

app.use('/login', async (req, res) => {
    try {
        const condition = {
            username: req.body.username,
        }

        const password = req.body.password
        console.log("req.body", req.body)

        const dataUserCheck = await user_account.findOne(condition);

        // Hapus token lama dari user yang masuk
        if (dataUserCheck && dataUserCheck['token']) {
            dataUserCheck['token'] = null;
            await user_account.updateOne(condition, { token: null });
        }

        console.log("dataUserCheck", dataUserCheck)

        if (dataUserCheck) {
            const checkPassword = await bcrypt.compare(password, dataUserCheck['password']);

            if (checkPassword) {
                console.log("checkPassword", checkPassword)
                const payload = {
                    username: dataUserCheck.username,
                    role: dataUserCheck.role,
                    document_id: dataUserCheck.document_id
                };

                const token = jwt.sign(payload, JWT_SECRET_TOKEN);
                dataUserCheck['token'] = token;

                //=======================
                const dataUser = _.pick(dataUserCheck, ['createdAt', 'remark', 'role', 'token', 'updatedAt', 'user_data', 'username']); // tambahkan properti lain yang ingin disalin

                const createDocumentLog = {
                    document_id: "LOGIN-LOGS",
                    document_type: 998,  //LOGIN
                    payload: payload,
                    response: dataUser,
                    requester: {
                        username: condition.username // Ambil username dari middleware auth
                    },
                };
        
                const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);
        
                user_account.updateOne(condition, { token: token }, (err, raw) => {
                    res.json({
                        payload: dataUser,
                        statusCode: 1,
                        message: "Login Berhasil!"
                    });
                });

            } else {
                res.json({
                    statusCode: 0,
                    message: "Password Salah!"
                });
            }
        } else {
            res.json({ statusCode: 0, message: "Error User" })
        }

    } catch (err) {
        // Tangani error disini
        res.json({ statusCode: 0, message: err })
    }
});

app.use('/logout', async (req, res) => {
    try {

        console.log("req", req.body);

        const condition = {
            username: req.body.username,
        }

        const dataUserCheck = await user_account.findOne(condition);

        if (dataUserCheck) {
            const options = { new: true };

            const updateUserAccount = await user_account.updateOne(condition, { last_logout: moment(), token: null }, options);

            const createDocumentLog = {
                document_id: "LOGOUT-LOGS",
                document_type: 999,  //logouts
                payload: req.body,
                response: updateUserAccount,
                requester: {
                    username: condition.username // Ambil username dari middleware auth
                },
            };
    
            const savedDocumentLog = await documentLogs(createDocumentLog.document_id, createDocumentLog.document_type, createDocumentLog.payload, createDocumentLog.response, createDocumentLog.requester);
    
            res.json({
                statusCode: 1,
                message: "Berhasil Logout!"
            })
        } else {
            res.json({
                statusCode: 0,
                message: "User Salah / tidak di temukan!"
            })
        }

    } catch (error) {
        res.json({ statusCode: 0, message: "Error, Please Call Admin!" })
    }
});

app.use('/changelog', async (req, res) => {
    try {
        console.log("req.body", req.body);

        const condition_log = {
            // version: req.body['condition']['version'],
        }

        const versionList = await changelog.find(condition_log).sort({ version: -1 });

        // Send the response
        res.json({
            statusCode: 1,
            data: versionList,
        });

    } catch (error) {
        // Send error response
        res.json({
            statusCode: 0,
            message: [error.message]
        });
    }
});

app.get("/", (req, res) => {
    res.json({ message: "Welcome to application." });
});

const approute = require('./app/index');

app.use('/app', approute);

// set port, listen for requests
const PORT = process.env.PORT || 4201;
app.listen(PORT, () => {
console.log(`
 __  __   __  __   ______   ______   ______   __  __    
/\\ \\_\\ \\ /\\ \\/\\ \\ /\\  ___\\ /\\  __ \\ /\\  ___\\ /\\ \\_\\ \\   
\\ \\____ \\\\ \\ \\_\\ \\\\ \\ \\__ \\\\ \\ \\/\\ \\\\ \\___  \\\\ \\  __ \\  
 \\/\\_____\\\\ \\_____\\\\ \\_____\\\\ \\_____\\\\/\\_____\\\\ \\_\\ \\_\\ 
  \\/_____/ \\/_____/ \\/_____/ \\/_____/ \\/_____/ \\/_/\\/_/\n    \n\t\t\t\tCreated by: yugoshlim\n
`);
    console.log(`
    \n====================================\nSystem\t: BACKEND NodeJS\t\t\t \nEmail\t : me@yugosh.dev \nInstagram : @yugosh\t\t\t \nYear  \t: 2023\t\t\t\t\n====================================\n
    `);
    console.log('[SYSTEM] : Version server is ' + version['version_1'] + '.' + version['version_2'] + '.' + version['version_3'] + '!');
    console.log(`[SYSTEM] : Server is running on port ${PORT}.`);
});

db.mongoose
    .connect(db.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("[SYSTEM] : Connected to the database!\n");
    })
    .catch(err => {
        console.log("[SYSTEM] : Cannot connect to the database!", err);
        process.exit();
    });