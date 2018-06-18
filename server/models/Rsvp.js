/*
 |--------------------------------------
 | Order Model
 |--------------------------------------
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  productId: { type: String, required: true },
  attending: { type: Boolean, required: true },
  guests: Number,
  comments: String
});

module.exports = mongoose.model('Order', orderSchema);
