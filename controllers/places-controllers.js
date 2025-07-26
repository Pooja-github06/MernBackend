// import with .js extension (important in ESM)
import HttpError from '../model/http-error.js';
import { v4 as uuid } from 'uuid';
import { validationResult } from 'express-validator';
import getCoordsForAddress from '../util/location.js';
import Place from '../model/place.js'
import User from '../model/user.js';
import mongoose from 'mongoose';
import fs from 'fs'

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);

    } catch (err) {
        const error = new HttpError('Something went wrong. could not find place  ')
        return next(error);
    }
    if (!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error)
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    // let places;
    let userWithPlaces;
    try {
        // places = await Place.find({ creator: userId });
        userWithPlaces = await User.findById(userId).populate('places')
    } catch (err) {
        const error = new HttpError("Something went wrong could not find user");
        return next(error);
    }
    // if (!places || places.length === 0) {
    //     const error = new HttpError('Could not find a place for the provided user id.', 404)
    //     return next(error);
    // }

    if (!userWithPlaces || userWithPlaces.length === 0) {
        const error = new HttpError('Could not find a place for the provided user id.', 404)
        return next(error);
    }
    res.json({ places: userWithPlaces.places.map(place => place.toObject({ getters: true })) });
    // res.json({ places: userWithPlaces.map(place => place.toObject({ getters: true })) });

    // res.json({ places: places.map(place => place.toObject({ getters: true })) });
};


const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError("Invalid inputs passed, please check the data", 422);
    }
    const { title, description, address } = req.body;
    // const title = req.body.title;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    })

    let user;
    try {
        user = await User.findById(req.userData.userId)
    } catch (err) {
        const error = new HttpError("Creating place failed, please try again", 500)
        return next(error)
    }
    if (!user) {
        const error = new HttpError("could not find user for provided id", 500);
        return next(error);
    }

    try {
        // await createdPlace.save();
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();

    } catch (err) {
        const error = new HttpError("Creating place failed, please try again", 500);
        return next(error)
    }
    // DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    // console.log('Calling updatePlace ------------------');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError("Invalid inputs passed, please check the data", 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    // let place;
    // try {
    //     place = await Place.findById(placeId);
    //     console.log('Fetched Place:', place);
    // } catch (err) {
    //     return next(new HttpError("Something went wrong, could not find place", 500));
    // }
    let place;
    try {
        place = await Place.findById(placeId);
        console.log('Fetched Place:', place);
    } catch (err) {
        return next(new HttpError("Something went wrong, could not find place", 500));
    }

    // ✅ ADD THIS CHECK (required!)
    if (!place) {
        return next(new HttpError("Could not find a place for the provided id.", 404));
    }

    // ✅ Check if user is owner
    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError("You are not allowed to edit this place.", 401));
    }

    // ✅ Now safe to modify
    place.title = title;
    place.description = description;

    try {
        await place.save();
        console.log('Updated Place:', place);
    } catch (err) {
        return next(new HttpError("Something went wrong, could not update place", 500));
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};


const deletePlace = async (req, res, next) => {
    console.log('deketee')
    const placeId = req.params.pid;
    console.log(placeId, 'place0dddd')
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
        console.log(place, 'place-------')
        if (!place) {
            return next(new HttpError('Could not find place with that ID.', 404));
        }
        if (place.creator.id !== req.userData.userId) {
            return next(new HttpError("You are not allowed to edit this place.", 401));

        }

    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }
    const imagePath = place.image
    try {
        // await Place.findByIdAndDelete(placeId);
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });

        // await place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess })
        await sess.commitTransaction()


    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }
    fs.unlink(imagePath, err => {
        console.log(err)
    });
    res.status(200).json({ message: 'Deleted place.' });
}
// Export functions (named export)
export { getPlaceById, getPlacesByUserId, createPlace, updatePlace, deletePlace };
