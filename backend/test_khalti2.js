import axios from 'axios';

const testLookup = async () => {
    try {
        const response = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', {
            pidx: "viksR5VAmx2w25r3omZbaE"
        }, {
            headers: {
                'Authorization': `Key 69cf0449a6b54f70b862fd3dc8210ff4`,
                'Content-Type': 'application/json'
            }
        });
        console.log("SUCCESS!", response.data);
    } catch(e) {
        console.error("FAILED!", e.response?.status, e.response?.data);
    }
}
testLookup();
