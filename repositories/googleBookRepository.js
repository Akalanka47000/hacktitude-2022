const axios = require("axios").default;

async function getBooksByTitle(title) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${title}`
      );
      resolve(response.data.items);
    } catch (error) {
      reject("Failed to fetch books");
    }
  });
}

module.exports = {
  getBooksByTitle,
};
