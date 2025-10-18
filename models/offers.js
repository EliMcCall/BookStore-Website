const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
  amount: {
    type: Number,
    required: [true, 'Offer amount is required'],
    min: [0.01, 'Offer amount must be at least 0.01']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Item is required']
  }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
