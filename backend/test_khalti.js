import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkKhalti = async () => {
    try {
        const { lookupPayment } = await import('./utils/khaltiService.js');
        const pidx = "viksR5VAmx2w25r3omZbaE"; // from output
        const result = await lookupPayment(pidx);
        
        fs.writeFileSync('khalti_debug.json', JSON.stringify({
             lookupResult: result
        }, null, 2));
        console.log("Written to khalti_debug.json");
    } catch (err) {
        console.error(err);
    }
};

checkKhalti();
