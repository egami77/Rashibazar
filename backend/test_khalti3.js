import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkValidation = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const Booking = (await import('./models/Booking.js')).default;
        const { validatePayment, lookupPayment } = await import('./utils/khaltiService.js');
        
        // Find latest initiated booking
        const booking = await Booking.findOne({ khaltiStatus: 'initiated' }).sort({ createdAt: -1 });
        if (!booking) {
             console.log("No initiated booking found");
             return;
        }

        console.log("=== DB Booking ===");
        console.log("Amount:", booking.amount);
        console.log("BookingID:", booking.bookingId);
        console.log("Khalti pidx:", booking.khaltiPaymentId);

        console.log("\n=== Khalti Lookup ===");
        const lookup = await lookupPayment(booking.khaltiPaymentId);
        console.log(JSON.stringify(lookup, null, 2));

        console.log("\n=== Validation Test ===");
        const expectedPaisa = (booking.amount + 50) * 100;
        console.log("Expected Paisa:", expectedPaisa);
        const validation = await validatePayment(
            booking.khaltiPaymentId,
            expectedPaisa,
            booking.bookingId
        );
        console.log(JSON.stringify(validation, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

checkValidation();
