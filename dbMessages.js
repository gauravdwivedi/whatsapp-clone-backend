const mongoose = require('mongoose');

const whatsappSchema = new mongoose.Schema({
    message: String,
    name: String,
    received: Boolean,

}, { timestamps: true });

const Whatsapp = mongoose.model('Whatsapp', whatsappSchema);

module.exports = Whatsapp;

