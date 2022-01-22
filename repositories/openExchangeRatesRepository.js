const axios = require("axios").default;

async function getExchangeRate(value, from, to) {
    return new Promise(async (resolve, reject) => {
        try {
            const key = "e7a6483e79a444baa23d773d128ac3d9";
            const response = await axios.get(
                `https://openexchangerates.org/api/historical/2022-01-01.json?app_id=${key}`
            );
            const currencies = response.data.rates;
            let convertedValue = ''
            for (let [key, rate] of Object.entries(currencies)) {
                if (key === to) {
                    convertedValue = value*rate
                }
            }
            resolve(convertedValue);
        } catch (error) {
            console.log(error)
            reject("Failed to fetch exchange rates");
        }
    });
}

module.exports = {
    getExchangeRate,
};
