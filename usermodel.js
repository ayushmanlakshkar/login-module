const mongoose = require('mongoose');
// Define a schema
const usersdetails = new mongoose.Schema({
  username: { type: String, required: true},
  phoneno: { type: Number , required: true,unique: true},
  password: { type: String, required: true}
});

// Create a model based on the schema
module.exports= mongoose.model('users', usersdetails);

