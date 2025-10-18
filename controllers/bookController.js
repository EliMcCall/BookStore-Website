const Book = require('../models/book');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

exports.index = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const searchRegex = new RegExp(searchTerm, 'i');

        let books = await Book.find()
            .sort({ price: 1 })
            .populate('seller', 'firstName lastName');

        books = books.filter(book => {
            const matchInTitle = searchRegex.test(book.title);
            const matchInCondition = searchRegex.test(book.condition);
            const matchInDetails = searchRegex.test(book.details);
            const matchInPrice = searchRegex.test(String(book.price));
            const matchInSellerFirst = searchRegex.test(book.seller.firstName);
            const matchInSellerLast = searchRegex.test(book.seller.lastName);
            return matchInTitle || matchInCondition || matchInDetails || matchInPrice || matchInSellerFirst || matchInSellerLast;
        });

        res.render('./book/items', { books, searchTerm });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.new = (req, res) => {
    res.render('./book/new', {
        errors: [],
        searchTerm: req.query.search || ''
    });
};

exports.create = [
    upload.single('image'),
    async (req, res, next) => {
        try {
            let bookData = req.body;

            if (req.file) {
                bookData.image = '/images/' + req.file.filename;
            }

            bookData.seller = req.session.user;

            const book = new Book(bookData);
            await book.save();
            res.redirect('/books');
        } catch (err) {
            let errorMessages = [];
            if (err.name === 'ValidationError') {
                errorMessages = Object.values(err.errors).map(e => e.message);
                return res.status(400).render('./book/new', {
                    errors: errorMessages,
                    searchTerm: req.query.search || ''
                });
            }
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
];

exports.item = async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(id).populate('seller', 'firstName lastName');
        if (!book) return res.status(404).send('Book not found');

        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.render('./book/item', { book });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.edit = async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(id);
        if (!book) return res.status(404).send('Book not found');

        res.render('./book/edit', { book, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.update = async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).send('Invalid book ID');
    }

    console.log('Updating book with ID:', id);
    console.log('Request body:', req.body);

    try {
        const book = await Book.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        });

        if (!book) {
            console.log('No book found with that ID');
            return res.status(404).send('Book not found');
        }

        console.log('Book updated:', book);
        res.redirect('/books/' + id);
    } catch (err) {
        console.log('Error during update:', err);
        let errorMessages = [];
        if (err.name === 'ValidationError') {
            errorMessages = Object.values(err.errors).map(e => e.message);
            const book = await Book.findById(id);
            return res.status(400).render('./book/edit', {
                book,
                errors: errorMessages
            });
        }

        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

exports.delete = async (req, res) => {
    const id = req.params.id;
    if (!isValidObjectId(id)) {
        return res.status(400).send('Invalid book ID');
    }

    try {
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send('Book not found');
        }

        await book.deleteOne(); 
        res.redirect('/books');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

