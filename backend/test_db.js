import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const searchBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Booking = (await import('./models/Booking.js')).default;
        
        const latestBooking = await Booking.findOne().sort({ createdAt: -1 });
        console.log(JSON.stringify(latestBooking, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

searchBookings();
