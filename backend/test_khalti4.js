import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkValidation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Booking = (await import('./models/Booking.js')).default;
        const { validatePayment, lookupPayment } = await import('./utils/khaltiService.js');
        
        const booking = await Booking.findOne({ khaltiStatus: 'failed' }).sort({ createdAt: -1 });
        if (!booking) return;

        const lookup = await lookupPayment(booking.khaltiPaymentId);
        const expectedPaisa = (booking.amount + 50) * 100;
        const validation = await validatePayment(
            booking.khaltiPaymentId,
            expectedPaisa,
            booking.bookingId
        );
        
        fs.writeFileSync('debug4.json', JSON.stringify({
             bookingId: booking.bookingId,
             dbAmount: booking.amount,
             khaltiId: booking.khaltiPaymentId,
             lookupResult: lookup,
             expectedPaisa,
             validationResult: validation
        }, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

checkValidation();
