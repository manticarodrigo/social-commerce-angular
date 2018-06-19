/*
 |--------------------------------------
 | User Model
 |--------------------------------------
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	business: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dni: { type: String, required: true },
	ruc: String,
	bankAccountNumber: String,
	logisticProvider: String,
	businessLogo: String,
});

module.exports = mongoose.model('User', userSchema);
