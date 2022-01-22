const axios = require("axios").default;

async function getExchangeRate(value, from, to) {
    return new Promise(async (resolve, reject) => {
        try {
            const key = "932c9b9369824a619176694881bd76ad";
            const response = await axios.get(
                `https://openexchangerates.org/api/convert/${value}/${from}/${to}?app_id=${key}`
            );
            // console.log(response);
            resolve(response.data.items);
        } catch (error) {
            console.log(error);
            reject("Failed to fetch exchange rates");
        }
    });
}

module.exports = {
    getExchangeRate,
};
