const User = require('../models/user');
const Book = require('../models/book');
const Offer = require('../models/offers');

exports.new = (req, res) => {
    res.render('./user/newU');
};

exports.create = (req, res, next) => {
    let user = new User(req.body);
    user.save()
    .then(() => {
        req.flash('success', 'Your account has been created successfully. Please log in.');
        res.redirect('/users/login');
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('/users/newU');
        }
        if (err.code === 11000) {
            req.flash('error', 'Email has already been registered.');
            return res.redirect('/users/newU');
        }
        next(err);
    });
};

exports.getUserLogin = (req, res) => {
    res.render('./user/login');
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    User.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');
            return res.redirect('/users/login');
        }
        user.comparePassword(password)
        .then(result => {
            if (result) {
                req.session.user = user._id;
                req.session.save(err => {
                    if (err) return next(err);
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
                });
            } else {
                req.flash('error', 'Wrong password');
                res.redirect('/users/login');
            }
        });
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    const userId = req.session.user;

    Promise.all([
        User.findById(userId),
        Book.find({ seller: userId }),
        Offer.find({ buyer: userId }).populate('item')
    ])
    .then(([user, books, offers]) => {
        res.render('./user/profile', { user, books, offers });
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
    req.flash('success', 'You have successfully logged out!');
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/');
    });
};

