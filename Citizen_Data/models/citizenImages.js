const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Citizen Data must be provided"],
        unique: true
    },
  images: [{
    type: String
  }]
});

const ImageModel = mongoose.model('Image', ImageSchema);

module.exports = ImageModel;