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
        required: false
    },
    Autor: { 
        type: String, 
        required: true
    },
    AñoPubli:{
        type: Date,
        required: false
    },
    Editorial:{
        type: String,
        required: true
    },
    ISBN:{
        type: Number,
        required: true
    },
    cantidadDisponible: {
        type: Number, 
        required: true,
        default: 1
    }, 
    reservado: [{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Usuario"  
    }]
    
});
module.exports = mongoose.model('Inventario', inventarioSchema);