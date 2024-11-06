const express = require("express");
const router = express.Router();
const Reserva = require("../models/reserva");
const Inventario = require("../models/inventario");
const { verifyToken, verifyAdmin } = require('./authorization');
const inventario = require("../models/inventario");
const reserva = require("../models/reserva");


// Función para verificar la cantidad de reservas activas de un usuario (máximo 2)
async function verificarCantidadReservados(usuarioId) {
    try {
        const reservasActivas = await Reserva.countDocuments({ usuario: usuarioId, reservaCumplida: false });
        return reservasActivas < 2;
    } catch (error) {
        throw new Error("Error al verificar la cantidad de libros reservados.");
    }
}

async function libroNoReservado(){
    try{
        const cantidadDisponible = inventario.find({cantidadDisponible});
            return cantidadDisponible > 0
    }catch{
        throw new Error("Error al verificar si el libro esta disponible para la reserva.");
    }
 
}

// 1. Crear una reserva para un artículo del inventario usando el JWT del usuario
router.post("/reservas/:inventarioId", verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user.id; // ID del usuario extraído del JWT
        const { inventarioId } = req.params;

        // Verificar que el usuario no tenga ya dos reservas activas
        const puedeReservar = await verificarCantidadReservados(usuarioId);
        if (!puedeReservar) {
            return res.status(400).json({ message: "Ya tienes el máximo de dos libros reservados." });
        }

        // Verificar que el libro esté disponible para reserva
        const libroDisponible = await libroNoReservado(inventarioId);
        if (!libroDisponible) {
            return res.status(400).json({ message: "No hay ejemplares disponibles para reservar." });
        }

        // Buscar el artículo en el inventario por su ID
        const articulo = await Inventario.findById(inventarioId);
        if (!articulo) {
            return res.status(404).json({ message: "Artículo no encontrado en el inventario." });
        }

        // Crear una nueva reserva con los datos del artículo
        const nuevaReserva = new Reserva({
            usuario: usuarioId,
            libros: [articulo._id], // Solo un libro por reserva
            fecha: new Date(), // Fecha actual
            tiempoRestante: "48 horas", // Se actualizará automáticamente
        });

        // Guardar la reserva en la base de datos
        await nuevaReserva.save();

        // Actualizar la cantidad de ejemplares disponibles
        try {
            // Decrementar la cantidad en inventario
            await Inventario.findByIdAndUpdate(
                inventarioId,
                { $inc: { cantidadDisponible: -1 } }, // Decrecer la cantidad en 1
                { new: true }
            );

            // Agregar el usuario al campo 'reservado' del libro
            await Inventario.findByIdAndUpdate(
                inventarioId,
                { $push: { reservado: usuarioId } }, // Agregar el ID del usuario al arreglo de 'reservado'
                { new: true }
            );
        } catch (error) {
            return res.status(500).json({ message: "No se pudo actualizar el inventario. Error interno.", error: error.message });
        }

        // Responder con la información del libro reservado y el mensaje de éxito
        res.status(201).json({
            message: "Reserva creada con éxito.",
            reserva: {
                usuario: usuarioId,
                libro: {
                    Nombre: articulo.Nombre,
                    Autor: articulo.Autor,
                    GeneroPrincipal: articulo.GeneroPrincipal,
                    AñoPubli: articulo.AñoPubli,
                    Editorial: articulo.Editorial,
                    ISBN: articulo.ISBN,
                },
                tiempoRestante: nuevaReserva.tiempoRestante,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Eliminar una reserva según su ID
router.delete("/reservas/:id", verifyToken, async (req, res) => {
    try {
        const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
        if (!reservaEliminada) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }
        res.status(200).json({ message: "Reserva eliminada con éxito." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Ver el tiempo restante de una reserva
router.get("/reservas/:id/tiempo-restante", verifyToken, async (req, res) => {
    try {
        const reserva = await Reserva.findById(req.params.id);
        if (!reserva) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }

        const tiempoRestante = reserva.calcularTiempoRestante();
        res.status(200).json({ tiempoRestante });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Ver todas las reservas (para el administrador)
router.get("/reservas", verifyAdmin, verifyToken, async (req, res) => {
    try {
        const reservas = await Reserva.find();
        res.status(200).json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Ver reservas de un usuario específico (máximo dos artículos por usuario)
router.get("/reservas/usuario/:nombre", verifyAdmin, verifyToken, async (req, res) => {
    try {
        const reservas = await Reserva.find({ usuario: req.params.nombre });
        if (reservas.length === 0) {
            return res.status(404).json({ message: "No se encontraron reservas para este usuario." });
        }
        res.status(200).json(reservas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Marcar una reserva como cumplida
router.patch("/reservas/:id/cumplida", verifyAdmin, verifyToken, async (req, res) => {
    try {
        const reservaActualizada = await Reserva.findByIdAndUpdate(
            req.params.id,
            { reservaCumplida: true },
            { new: true }
        );
        if (!reservaActualizada) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }
        res.status(200).json({ message: "Reserva marcada como cumplida.", reserva: reservaActualizada });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
