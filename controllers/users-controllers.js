import HttpError from '../model/http-error.js';
import { v4 as uuid } from 'uuid';
import { validationResult } from 'express-validator';
import User from '../model/user.js';
import bcrypt from 'bcrypt';
import fileUpload from '../middlewear/file-upload.js';
import jwt from 'jsonwebtoken';
const getUsers = async (req, res, next) => {
    // console.log('GET /api/users hit'); // ✅ this will prove route is being hit

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError("Fetching users failed", 500));
    }

    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};



const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check the data", 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email });
    } catch (err) {
        return next(new HttpError("Signup failed, please try again later.", 500));
    }

    if (existingUser) {
        return next(new HttpError("User exists already, please login instead.", 422));
    }


    let hashedPassword;
    try {
        console.log("Hashing password...");
        console.log("Raw password:", password);
        hashedPassword = await bcrypt.hash(password, 12);
        console.log("Hashed:", hashedPassword);
    } catch (err) {
        console.error("Error hashing password:", err);

        return next(new HttpError("Could not create user, please try again.", 500));
    }
    const createdUser = new User({
        name,
        email,
        password: hashedPassword, // ✅ store hashed password
        // image: req.file.path,
        image: req.file.path,
        places: [] // always starts empty
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log(err, 'error0')
        return next(new HttpError("Creating user failed, please try again later.", 500));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_TOKENKEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token: token });
    // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError("Logging in failed, please try again later.", 500));
    }

    if (!existingUser) {
        return next(new HttpError("Invalid credentials, user not found", 401));
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        return next(new HttpError("Could not log you in, please try again later.", 500));
    }

    if (!isValidPassword) {
        return next(new HttpError("Invalid credentials, wrong password", 401));
    }

    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_TOKENKEY,
            { expiresIn: '1h' }
        );
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    res.json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });

    // res.status(200).json({ message: 'Logged in!', user: existingUser.toObject({ getters: true }) });
};


export { getUsers, signup, login };
