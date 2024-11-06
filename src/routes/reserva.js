const express = require("express");
const router = express.Router();
const reservaSchema = require("../models/reserva");
const { verifyToken, verifyAdmin } = require('./authorization').default;
const libroRouter = require("./libro");

//Un usuario hace una reserva eligiendo un libro (dos libros máximo), el endpoint debe tener como parametro el id de un libro

//El usuario elimina un reserva segun su id

//El usuario ve el tiempo 

//El administrador ve todas las reservas de todos los usuarios
router.get("/reservas", verifyAdmin, verifyToken, (req, res) => {
    reservaSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.status(500).json({ message: error.message }));
});

//El administrador ve las reservas de un usuario (máximo dos libros por usuario) por su nombre

//El administrador pone la reserva como cumplida
