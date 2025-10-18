const Offer = require('../models/offers');
const Book = require('../models/book');

exports.create = async (req, res) => {
    const bookId = req.params.id;
    const { amount } = req.body;

    if (!req.session.user) {
        req.flash('error', 'You must be logged in to make an offer.');
        return res.redirect('/users/login');
    }

    try {
        const book = await Book.findById(bookId).populate('seller');
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found.' });
        }

        if (book.seller._id.toString() === req.session.user.toString()) {
            return res.status(401).render('error', { message: 'You cannot make an offer on your own item.' });
        }

        const offer = new Offer({
            amount,
            buyer: req.session.user,
            item: bookId
        });

        await offer.save();

        book.totalOffers += 1;
        book.highestOffer = Math.max(book.highestOffer, amount);
        await book.save();

        res.redirect(`/books/${bookId}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.viewOffers = async (req, res) => {
    const bookId = req.params.id;

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found.' });
        }

        if (book.seller.toString() !== req.session.user.toString()) {
            return res.status(401).render('error', { message: 'You are not authorized to view offers for this item.' });
        }

        const offers = await Offer.find({ item: bookId }).populate('buyer', 'firstName lastName');
        res.render('./offer/offers', { offers, book });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

exports.acceptOffer = async (req, res) => {
    const bookId = req.params.id;
    const offerId = req.params.offerId;

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).render('error', { message: 'Book not found.' });
        }

        if (book.seller.toString() !== req.session.user.toString()) {
            return res.status(403).render('error', { message: 'You are not authorized to accept offers for this item.' });
        }

        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).render('error', { message: 'Offer not found.' });
        }

        offer.status = 'accepted';
        await offer.save();

        book.active = false;
        await book.save();

        await Offer.updateMany({ item: bookId, _id: { $ne: offerId }, status: 'pending' }, { status: 'rejected' });

        res.redirect(`/books/${bookId}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};
