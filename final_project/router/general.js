const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();
public_users.use(express.json());


public_users.post("/register", (req,res) => {
  //Write your code here
  // Obtain the username and password from the request body
  const username = req.body.username;
  const password = req.body.password;
  // Check if the username is already taken
  if (users[username]) {
    // Return an error message if the username is already taken
    return res.status(400).json({message: "Username already taken"});
  } else {
    // Add the user to the users object
    users[username] = username;
    // Add the user to the users array
    users.push({username: username, password: password});
    // Return a success message
    return res.status(200).json({message: "User registered successfully"});
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(books);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(books[isbn]);
    if (response.data) {
      return res.status(200).json(response.data);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book details" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    // Obtain all keys from the books object
    let keys = Object.keys(books);
    // Create an empty array to store the books with the specified author
    let author_books = [];
    // Iterate through the keys
    for (let i = 0; i < keys.length; i++) {
      // Check if the author of the book matches the author in the request
      if (books[keys[i]].author === req.params.author) {
        // Add the book to the array
        author_books.push(books[keys[i]]);
      }
    }
    // Check if any books were found
    if (author_books.length > 0) {
      // Return the array of books
      return res.status(200).json(author_books);
    } else {
      // Return a message indicating that no books were found
      return res.status(404).json({ message: "No books found for the specified author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    // Obtain all keys from the books object
    let keys = Object.keys(books);
    // Create an empty array to store the books with the specified title
    let title_books = [];
    // Iterate through the keys
    for (let i = 0; i < keys.length; i++) {
      // Check if the title of the book matches the title in the request
      if (books[keys[i]].title === req.params.title) {
        // Add the book to the array
        title_books.push(books[keys[i]]);
      }
    }
    // Check if any books were found
    if (title_books.length > 0) {
      // Return the array of books
      return res.status(200).json(title_books);
    } else {
      // Return a message indicating that no books were found
      return res.status(404).json({ message: "No books found with the specified title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  // Obtain the ISBN from the request parameters
  const isbn = req.params.isbn;
  // Check if the book exists in the books object
  if (books[isbn]) {
    // Check if the book has any reviews
    if (books[isbn].reviews) {
      // Return the reviews for the book
      return res.status(200).json(books[isbn].reviews);
    } else {
      // Return a message indicating that there are no reviews for the book
      return res.status(404).json({message: "No reviews found for the book"});
    }
  } else {
    // Return a message indicating that the book was not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
