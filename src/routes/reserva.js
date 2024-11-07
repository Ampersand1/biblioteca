const express = require("express");
const router = express.Router();
const Reserva = require("../models/reserva");
const Inventario = require("../models/inventario");
const { verifyToken, verifyAdmin } = require('./authorization');

//Obtener todas las reservas solo para el desarrollo
router.get("/reservas/todas", (req, res) => {
    Reserva.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
        res.json(data)
});
// Función para verificar la cantidad de reservas activas de un usuario (máximo 2)
async function verificarCantidadReservados(usuarioId) {
    try {
        const reservasActivas = await Reserva.countDocuments({ usuario: usuarioId, reservaCumplida: false });
        return reservasActivas < 2;
    } catch (error) {
        throw new Error("Error al verificar la cantidad de libros reservados.");
    }
}

async function libroNoReservado(inventarioId) {
    try {
        // Buscar el libro en el inventario por su ID
        const libro = await Inventario.findById(inventarioId);
        
        // Verificar si hay ejemplares disponibles (cantidad > 0)
        if (libro && libro.cantidadDisponible > 0) {
            return true;  // Hay libros disponibles para reservar
        } else {
            return false; // No hay libros disponibles
        }
    } catch (error) {
        throw new Error("Error al verificar si el libro está disponible para la reserva.");
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
            // Obtener el libro actual y decrementar la cantidad disponible manualmente
            const libro = await Inventario.findById(inventarioId);
            if (libro && libro.cantidadDisponible > 0) {
                // Restar uno a la cantidad disponible
                const nuevaCantidad = libro.cantidadDisponible - 1;

                // Actualizar el inventario con la nueva cantidad
                await Inventario.findByIdAndUpdate(
                    inventarioId,
                    { $set: { cantidadDisponible: nuevaCantidad } }, // Establecer la nueva cantidad
                    { new: true }
                );

                // Agregar el usuario al campo 'reservado' del libro
                await Inventario.findByIdAndUpdate(
                    inventarioId,
                    { $push: { reservado: usuarioId } }, // Agregar el ID del usuario al arreglo de 'reservado'
                    { new: true }
                );
            } else {
                return res.status(400).json({ message: "No hay ejemplares disponibles para reservar." });
            }
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
        const usuarioId = req.user.id;
        // Encontrar la reserva y eliminarla
        const reservaEliminada = await Reserva.findByIdAndDelete(req.params.id);
        if (!reservaEliminada) {
            return res.status(404).json({ message: "Reserva no encontrada." });
        }

        // Obtener el ID del libro asociado a la reserva eliminada
        const libroId = reservaEliminada.libros[0]; 

        // Obtener el libro actual
        const libro = await Inventario.findById(libroId);
        if (!libro) {
            return res.status(404).json({ message: "Libro no encontrado en el inventario." });
        }

        // Aumentar la cantidad disponible en el inventario (decrementar reserva)
        const nuevaCantidad = libro.cantidadDisponible + 1;

        // Actualizar el inventario con la nueva cantidad
        const libroActualizado = await Inventario.findByIdAndUpdate(
            libroId,
            { $set: { cantidadDisponible: nuevaCantidad } }, // Establecer la nueva cantidad
            { new: true }
        );

        // Eliminar el usuario del campo 'reservado' del libro
        await Inventario.findByIdAndUpdate(
            libroId,
            { $pull: { reservado: reservaEliminada.usuario } }, // Eliminar el ID del usuario del arreglo de 'reservado'
            { new: true }
        );

        // Responder con éxito
        res.status(200).json({
            message: "Reserva eliminada con éxito y cantidad disponible actualizada.",
            libro: libroActualizado
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Ver todas las reservas (para el administrador)
// Mostrar lista de libros reservados con su usuario respectivo
router.get("/reservas", verifyAdmin, verifyToken, async (req, res) => {
    try {
        // Buscar los libros en el inventario, solo los que tienen reservas
        const libros = await Inventario.find({ reservado: { $ne: [] } }) // Solo los libros con reservas
            .populate('reservado', 'nombre') // Poblar el campo 'reservado' con el nombre del usuario
            .exec();

        const librosConUsuariosReservados = libros.map(libro => {
            // Mapear para devolver el resultado en el formato correcto
            return {
                Nombre: libro.Nombre,
                Autor: libro.Autor,
                ISBN: libro.ISBN,
                UsuariosReservados: libro.reservado.map(usuario => usuario._id) // Mostrar solo el ID del usuario
            };
        });

        res.status(200).json(librosConUsuariosReservados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Marcar una reserva como cumplida
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
