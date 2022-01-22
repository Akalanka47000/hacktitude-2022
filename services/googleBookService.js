const googleBookRepository = require("../repositories/googleBookRepository");

async function getBooksByTitle(title) {
    return await googleBookRepository.getBooksByTitle(title);
}

module.exports = {
  getBooksByTitle,
};
