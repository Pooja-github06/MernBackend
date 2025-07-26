import axios from 'axios';
import HttpError from '../model/http-error.js'; // ✅ Make sure .js is included for ESM

async function getCoordsForAddress(address) {
    const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = response.data;

    if (!data || data.length === 0) {
        throw new HttpError(
            'Could not find location for the specified address.',
            422
        );
    }

    const coordinates = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };

    return coordinates;
}

export default getCoordsForAddress;
