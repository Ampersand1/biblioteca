const mongoose = require("mongoose");
const inventarioSchema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: true
    },
    GeneroPrincipal: {
        type: String,
        required: true
    },
    GeneroSecundario: {
        type: String,
        required: true
    },
    Autor: { 
        type: String, 
        required: true
    },
    AñoPubli:{
        type: Date,
        required: true
    },
    Editorial:{
        type: String,
        required: true
    },
    ISBN:{
        type: Number,
        required: true
    }
});
module.exports = mongoose.model('Inventario', inventarioSchema);