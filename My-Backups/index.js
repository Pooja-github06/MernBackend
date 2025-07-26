import express from "express"
import cors from "cors"
import sql from 'mssql';

import Jwt from 'jsonwebtoken';
// const { Jwt } = pkg;
// import { Jwt } from "jsonwebtoken";
import dotenv from 'dotenv'
// const bodyParser = require('body-parser');
import bodyParser from 'body-parser';
// import { Jwt } from "jsonwebtoken";



var app = express();
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cors())


// ----------new api 
app.post("/RegisterUserwithToken", async (req, res) => {
    var Formtype = req.body.Formtype;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
        // time: Date(),
        // userId: 12,
    }

    // var email = req.body.email;
    // var password = req.body.password;
    // var username = req.body.username;
    var sqlConfig = {
        "user": 'pooja',
        "password": 'shreeja@0606',
        "server": 'LAPTOP-HGSJPNOP\\SQLEXPRESS',
        "database": 'UserLogin',
        "port": 1433, // make sure to change port
        "dialect": "mssql",
        "options": {
            encrypt: false,
            useUTC: true,
        },
        "pool": {
            // max: 100,
            // min: 0,
            // idleTimeoutMillis: 3600000,
            // connectionTimeout: 3600000,
            // requestTimeout: 3600000,
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        "dialectOptions": {
            "instanceName": "SQLEXPRESS"
        }
    };

    const pool = new sql.ConnectionPool(sqlConfig);
    pool
        .connect()
        .then(async function () {
            var request = new sql.Request(pool);
            await request
                .query("INSERT INTO UserDetails(Name,Email,Password,Date)VALUES('" + data.username + "','" + data.email + "', '" + data.password + "',CURRENT_TIMESTAMP);")
                .then(async function (recordSets) {
                    // console.log(recordSets, "----data----");
                    if (recordSets.rowsAffected[0] > 0) {
                        const token = Jwt.sign(data, jwtSecretKey);

                        // res.json({
                        //     "Token": token
                        // });
                        res.json({

                            "Token": token
                            , status: "User Added Successfully", data: recordSets.recordset
                        });
                        // res.json(recordSets.recordset[0]);

                        // res.json(recordSets.recordset)
                    } else {
                        res.send("Data not found");
                        // res.json({ message: 'Recordset not found' })
                    }
                });
        })
        .catch(function (err) {
            sql.close();
        });
});


// login api


app.post("/isUserLogin", async (req, res) => {
    var sqlConfig = {
        "user": 'pooja',
        "password": 'shreeja@0606',
        "server": 'LAPTOP-HGSJPNOP\\SQLEXPRESS',
        "database": 'UserLogin',
        "port": 1433, // make sure to change port
        "dialect": "mssql",
        "options": {
            encrypt: false,
            useUTC: true,
        },
        "pool": {
            // max: 100,
            // min: 0,
            // idleTimeoutMillis: 3600000,
            // connectionTimeout: 3600000,
            // requestTimeout: 3600000,
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        },
        "dialectOptions": {
            "instanceName": "SQLEXPRESS"
        }
    };

    const pool = new sql.ConnectionPool(sqlConfig);
    pool
        .connect()
        .then(async function () {
            var request = new sql.Request(pool);
            await request.query(" select * from UserDetails where  Email='" + req.body.email + "' and Password='" + req.body.password + "'").then(async function (recordSets) {
                // console.log(recordSets, "----data----");
                if (recordSets.rowsAffected[0] > 0) {
                    res.json({ Data: recordSets.recordsets[0] })
                } else {
                    res.json({ Data: "No Record Found" })
                }
            }).catch((err) => {
                res.json({ Data: "No Record Found" })

                console.log(err)
            })
        }).catch((err) => {

            console.log(err)
            res.send(err)
        })
})


app.post('/verify-token', (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).send({ message: 'Token is required' });
    }

    Jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Invalid token' });
        }

        res.send({ message: 'Token is valid', decoded });
    });

})

app.listen(8080, function () {
    console.log('Server-- is running..');
});











// ----------------------------------- my code

// const fs = require('fs');
// import fs from 'fs';
import http from 'http';
import express from "express";
// const Username = "alice";


// const server = http.createServer((req, res) => {
//   console.log('Incoming Request');
//   console.log(req.method, req.url);

//   if (req.method === 'POST') {
//     let body = '';

//     req.on('end', () => {

//       const userName = body.split('=')[1];
//       res.end('<h1>' + userName + '</h1>')
//     })

//     req.on('data', (chunk) => {
//       body += chunk
//     })

//   } else {

//     res.setHeader('Content-type', 'text/html')
//     res.end('<form method="POST"><input type="text" name="username"/><button type="submit">Create user</button></form>');
//   }

// })

// server.listen(5000);
// fs.writeFile('user-data.txt', 'Name:' + Username, (err) => {
//   if (err) {
//     console.log(err)
//     return;
//   }
//   console.log('Wrote file')
// })

const app = express();

app.use((req, res, next) => {
    let body = '';

    req.on('end', () => {
        const userName = body.split('=')[1];
        if (userName) {
            req.body = { name: userName }
        }
        next();
    })
    req.on('data', (chunk) => {
        body += chunk
    })

})

app.use((req, res, nex) => {
    if (req.body) {
        return res.send('<h1' + req.body.name + '</h1>')
    }
    res.send('<form><input type="text" name="username"/><button type="submit">Create User</button></form>')
})
app.listen(5000)



// ----------------------------------my code 


app.use((req, res, next) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk
    })
    req.on('end', () => {
        const userName = body.split('=')[1];
        if (userName) {
            req.body = { name: userName }
        }
        next();
    })

    req.on('error', (err) => {
        console.error('Error parsing body:', err);
        next(); // Continue anyway
    });


})

app.use((req, res, nex) => {
    if (req.body) {
        return res.send('<h1> User is :' + req.body.name + '</h1>')
    }
    res.send('<form method="POST"><input type="text" name="username"/><button type="submit">Create User</button></form>')
})
app.listen(5000)

// -------------my code


app.use(express.urlencoded({ extended: false }));
app.post('/user', (req, res, next) => {
    res.send('<h1>' + req.body.username + '</h1>')
})

app.get('/', (req, res, next) => {
    res.send('<form action="/user" method="POST"><input type="text" name="username" /><button type="submit">Create USer</button></form>')
})

app.listen(5000);

// /mycode ======================
import express from 'express';
import bodyParser from 'body-parser';
import placesRoutes from './routes/places-routes.js';
import usersRoutes from './routes/users-routes.js';
import HttpError from './model/http-error.js';
const app = express();

// Middleware to parse incoming JSON
app.use(bodyParser.json());

// Routes with base path
app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not fint this route', 404);
    throw error;
})

// Fallback route for unmatched paths
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
