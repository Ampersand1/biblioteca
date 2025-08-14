const mongoose = require("mongoose");
//Hay una reserva por usuario
const reservaSchema = new mongoose.Schema({
    //Reserva relacionada a un usuario existente en la base de datos
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",  // Ref a Usuario
        required: true
        
    },
    //libros de la reserva elegidos por el usuario
    libros: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventario',  // Referencia a Inventario en lugar de "Libro"
        required: true
    }],
    fecha: {
        type: Date,
        required: true
    },
    //tiempo restante para hacer valida la reserva y pedir el libro
    tiempoRestante: {
        type: String,
        required: true
    },
    //si el usuario va por el libro dentro del tiempo estipulado, el admin marca la reserva como cumplida
    reservaCumplida: {
        type: Boolean,
        default: false,
        required: true
    }
});
reservaSchema.methods.calcularTiempoRestante = function() {
    const ahora = new Date();
    const fechaReserva = new Date(this.fecha);
    const dosDiasEnMilisegundos = 2 * 24 * 60 * 60 * 1000; // 48 horas en milisegundos

    const tiempoTranscurrido = ahora - fechaReserva;
    const tiempoRestante = dosDiasEnMilisegundos - tiempoTranscurrido;

    if (tiempoRestante <= 0) {
        return "Tiempo de reserva expirado, realice una nueva reserva.";
    } else {
        const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

        return `${horas} horas, ${minutos} minutos, ${segundos} segundos restantes`;
    }
}
module.exports = mongoose.model('Reserva', reservaSchema);
