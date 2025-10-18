const Book = require('../models/book');
const User = require('../models/user');


exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
        return next();
    } else {
        req.flash('error', 'You have already logged in');
        res.redirect('/users/profile');
    }
};

exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You need to login first');
        res.redirect('/users/login');
    }
};

exports.isSeller = async (req, res, next) => {
    try {
      const userId = req.session.user;
      const bookId = req.params.id;
  
      if (!userId) {
        return res.status(401).send("User is not logged in or session data is incomplete.");
      }
  
      const book = await Book.findById(bookId).exec();
  
      if (!book) {
        return res.status(404).send("Book not found.");
      }
  
      if (book.seller.toString() !== userId) {
        return res.status(403).send("User does not have the necessary role.");
      }
  
      next();
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error.");
    }
  };