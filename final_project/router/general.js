const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// User Registration
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered" });
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
            const allBooks = await new Promise((resolve, reject) => {
                    resolve(JSON.stringify(books));
            });
            return res.status(200).send(allBooks);
    } catch (error) {
            return res.status(500).json({ message: "Error retrieving books" });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  return new Promise((resolve, reject) => {
      if (books[isbn]) {
          resolve(books[isbn]);
      } else {
          reject("Book not found");
      }
  })
  .then(book => res.status(200).json(book))
  .catch(err => res.status(404).json({ message: err }));
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  return new Promise((resolve, reject) => {
      let bookList = [];
      for (let key in books) {
          if (books[key].author.toLowerCase() === author.toLowerCase()) {
              bookList.push(books[key]);
          }
      }
      if (bookList.length > 0) {
          resolve(bookList);
      } else {
          reject("No books found for this author");
      }
  })
  .then(books => res.status(200).json(books))
  .catch(err => res.status(404).json({ message: err }));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  return new Promise((resolve, reject) => {
      let bookList = [];
      for (let key in books) {
          if (books[key].title.toLowerCase().includes(title.toLowerCase())) {
              bookList.push(books[key]);
          }
      }
      if (bookList.length > 0) {
          resolve(bookList);
      } else {
          reject("No books found with this title");
      }
  })
  .then(books => res.status(200).json(books))
  .catch(err => res.status(404).json({ message: err }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.general = public_users;
