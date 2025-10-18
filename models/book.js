const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    title: { type: String, required: [true, 'Title is required'] },
    condition: { type: String, required: [true, 'Condition is required'], enum: ['new', 'like-new', 'used', 'fair', 'poor'] },
    price: { type: Number, required: [true, 'Price is required'], min: [0.01, 'Price must be at least 0.01'] },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: [true, "Seller is required"] },
    details: { type: String, required: [true, 'Details are required'], minLength: [10, 'Details should have at least 10 characters'] },
    image: { type: String, required: [true, "Image is required"] },
    active: { type: Boolean, default: true },
    totalOffers: { type: Number, default: 0 },
    highestOffer: { type: Number, default: 0 }
});

bookSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        await mongoose.model('Offer').deleteMany({ item: this._id });
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Book', bookSchema);
