const openExchangeRatesRepository = require("../repositories/openExchangeRatesRepository");

async function openExchangeRates(value, from, to) {
    return await openExchangeRatesRepository.getExchangeRate(value, from, to);
}

module.exports = {
  openExchangeRates,
};
