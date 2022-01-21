const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	contact: {
		type: String,
		required: true
	},
	type: {
		type: String,
		enum: ['buyer', 'vendor'],
		required: true
	}
});

module.exports = User = mongoose.model("User", UserSchema);
