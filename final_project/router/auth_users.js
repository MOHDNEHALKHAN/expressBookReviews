const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the user is valid
const isValid = (username) => {
    let userExists = users.some((user) => user.username === username);
    return userExists;
}

// Function to authenticate a user
const authenticatedUser = (username, password) => {
    let validUser = users.find((user) => user.username === username && user.password === password);
    return !!validUser;
}


// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in. Username or password missing." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    const accessToken = jwt.sign({ username }, 'access_secret', { expiresIn: 60 * 60 });

    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    };
    
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password." });
  }
});

/// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  // Ensure user is logged in
  if (!req.session.authorization) {
      return res.status(403).json({ message: "User not authenticated" });
  }

  // Get the username from the session
  const username = req.session.authorization.username;

  // Check if the book exists in the books database
  if (books[isbn]) {
      // Check if the user has already reviewed this book
      if (!books[isbn].reviews) {
          books[isbn].reviews = {};
      }

      // Add or update the user's review for this ISBN
      books[isbn].reviews[username] = review;

      return res.status(200).json({
          message: "Review added/modified successfully.",
          reviews: books[isbn].reviews
      });
  } else {
      return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
