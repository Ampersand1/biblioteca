const express = require("express");
const router = express.Router();
const Reserva = require("../models/reserva");
const Usuario = require("../models/usuario");
const Inventario = require("../models/inventario");
const { verifyToken, verifyAdmin } = require('./authorization');
const inventario = require("../models/inventario");

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

        // Verificar que el libro no esté ya reservado por el usuario
        const reservaExistente = await Reserva.findOne({
            usuario: usuarioId,
            libros: inventarioId,
        });
        if (reservaExistente) {
            return res.status(400).json({ message: "Ya tienes este libro reservado." });
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
            if (articulo.cantidadDisponible > 0) {
                // Restar uno a la cantidad disponible
                const nuevaCantidad = articulo.cantidadDisponible - 1;

                // Actualizar el inventario con la nueva cantidad y agregar usuario al campo 'reservado'
                await Inventario.findByIdAndUpdate(
                    inventarioId,
                    {
                        $set: { cantidadDisponible: nuevaCantidad },
                        $push: { reservado: usuarioId },
                    },
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
        res.status(500).json({ message: "Error interno del servidor.", error: error.message });
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
router.get("/reservas", verifyAdmin, verifyToken, async (req, res) => {
    try {
        // Buscar todas las reservas y poblar la información del usuario y los libros
        const reservas = await Reserva.find()
            .populate("usuario", "usuario") // Solo traer el campo 'usuario' del modelo Usuario
            .populate("libros", "Nombre") // Solo traer el campo 'Nombre' del modelo Inventario
            .exec();

        // Procesar las reservas para devolver información detallada
        const reservasConDetalles = reservas.map(reserva => {
            const tiempoRestante = reserva.calcularTiempoRestante();
            return {
                id: reserva._id,
                usuario: reserva.usuario?.usuario || "Usuario no encontrado", // Nombre del usuario o mensaje por defecto
                libro: reserva.libros[0] ? reserva.libros[0].Nombre : null, // Nombre del primer libro de la reserva
                tiempoRestante: tiempoRestante, // Tiempo restante de la reserva
                estado: reserva.reservaCumplida ? "Cumplida" : "No cumplida" // Estado de la reserva
            };
        });

        // Responder con las reservas detalladas
        res.status(200).json(reservasConDetalles);
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

// 5. Ver reservas según el nombre del usuario
router.get("/reservas/usuario/:nombreUsuario", verifyAdmin, verifyToken, async (req, res) => {
    try {
        const { nombreUsuario } = req.params; // Obtener el término de búsqueda

        // Usar una expresión regular para buscar coincidencias parciales e ignorar mayúsculas/minúsculas
        const regex = new RegExp(nombreUsuario, "i"); // "i" para que no distinga entre mayúsculas y minúsculas

        // Buscar usuarios cuyo nombre coincida parcial o completamente con la expresión regular
        const usuarios = await Usuario.find({ usuario: { $regex: regex } }); 

        if (usuarios.length === 0) {
            return res.status(404).json({ message: `No se encontraron usuarios que coincidan con '${nombreUsuario}'.` });
        }

        // Obtener los IDs de los usuarios encontrados
        const usuariosIds = usuarios.map(user => user._id);

        // Buscar reservas relacionadas con los usuarios encontrados
        const reservas = await Reserva.find({ usuario: { $in: usuariosIds } })
            .populate("usuario", "usuario") // Poblar el campo 'usuario' para obtener los nombres
            .populate("libros", "Nombre") // Poblar el campo 'libros' para obtener los nombres de los libros
            .exec();

        if (reservas.length === 0) {
            return res.status(404).json({ message: `No se encontraron reservas para la búsqueda '${nombreUsuario}'.` });
        }

        // Mapear las reservas para mostrar detalles relevantes
        const reservasConDetalles = reservas.map(reserva => ({
            id: reserva._id,
            usuario: reserva.usuario?.usuario || "Usuario desconocido",
            libro: reserva.libros[0] ? reserva.libros[0].Nombre : null,
            tiempoRestante: reserva.calcularTiempoRestante(),
            estado: reserva.reservaCumplida ? "Cumplida" : "No cumplida",
        }));

        // Responder con las reservas encontradas
        res.status(200).json(reservasConDetalles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Obtener "mis" reservas
router.get("/reservas/mis-reservas", verifyToken, async (req, res) => {
    try {
        const usuarioId = req.user.id; // Obtener el ID del usuario desde el token JWT

        // Buscar las reservas relacionadas con este usuario
        const reservas = await Reserva.find({ usuario: usuarioId })
            .populate('usuario', 'usuario') // Poblamos el nombre del usuario
            .populate('libros', 'Nombre') // Poblamos el nombre del libro
            .exec();

        // Verificar si hay reservas encontradas
        if (reservas.length === 0) {
            return res.status(404).json({ message: `No se encontraron reservas para el usuario con ID ${usuarioId}.` });
        }

        // Mapear las reservas para incluir solo la información relevante
        const reservasConDetalles = reservas.map(reserva => ({
            id: reserva._id,
            usuario: reserva.usuario.usuario, // Nombre del usuario
            libro: reserva.libros[0] ? reserva.libros[0].Nombre : null, // Nombre del libro
            tiempoRestante: reserva.calcularTiempoRestante(),
            estado: reserva.reservaCumplida ? "Cumplida" : "No cumplida" // Estado de la reserva
        }));

        // Responder con las reservas encontradas
        res.status(200).json(reservasConDetalles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
