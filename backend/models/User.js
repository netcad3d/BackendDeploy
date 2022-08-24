const mongoose = require("mongoose");



const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
	index: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    minlength: 5,
    maxlength: 255,
	index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
	index: true
  },
  verified: {
	type: Boolean,
	default: false,
	index: true
  },
  deactivatedOn: {
	type: Date,
	index: true },
});

const User = mongoose.model("User", UserSchema);

exports.User = User;
