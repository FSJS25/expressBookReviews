const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const books = require("./booksdb.js"); // Ensure this is correctly defined
let users = [];

const isValid = (username) => {
  if (typeof username !== 'string' || username.trim() === '') {
    return false;
  }
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(username) && !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// User login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (authenticatedUser(username, password)) {
    let token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    req.session.authorization = { username, accessToken: token }; // Store username
    return res.status(200).json({ accessToken: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.post("/auth/review/:isbn", (req, res) => {
  if (req.session.authorization) {
    const username = req.session.authorization.username; // Access username from session
    const isbn = req.params.isbn;
    const review = req.body.review; // Ensure this matches your client request format

    // Check if the ISBN exists in the books object
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Ensure reviews array is initialized
    if (!Array.isArray(books[isbn].reviews)) {
      books[isbn].reviews = [];
    }

    // Check if the user has already reviewed the book
    const existingReview = books[isbn].reviews.find((r) => r.username === username);
    if (existingReview) {
      existingReview.review = review; // Update the review
    } else {
      books[isbn].reviews.push({ username, review }); // Add new review
    }

    return res.status(200).json({ message: "Review added or updated successfully" });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  if (req.session.authorization) {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    const reviewIndex = books[isbn].reviews.findIndex((r) => r.username === username);
    if (reviewIndex !== -1) {
      books[isbn].reviews.splice(reviewIndex, 1); // Remove the review
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
