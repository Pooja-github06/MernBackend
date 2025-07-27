import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import placesRoutes from './routes/places-routes.js';
import usersRoutes from './routes/users-routes.js';
import HttpError from './model/http-error.js';
import mongoose from 'mongoose';
import uploadRoute from './routes/image-upload.js'; // ✅ importing route
import cors from 'cors';
const app = express();

app.use(bodyParser.json());
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use(cors());
app.use(express.json());

// app.use('/uploads/images', express.static(path.join('uploads', 'images')));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin ,X-Requested-With,Content-Type,Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');
    next();
})
app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', usersRoutes);
// Route from external file
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});


// app.use('/api/upload', uploadRoute);

app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err, 'error---');

        })
    }

    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An unknown error occurred!' });
});
console.log('👀 ENV CHECK:', process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);

// mongoose.connect(`mongodb+srv://Pooju:Test1234@cluster0.athhtu0.mongodb.net/mern?retryWrites=true&w=majority&appName=Cluster0`).then(() => {

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.athhtu0.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
    // app.listen(5000);
    app.listen(process.env.PORT || 5000, () => {
        console.log('Server running');
    });

}).catch((err) => {
    console.log(err)
})