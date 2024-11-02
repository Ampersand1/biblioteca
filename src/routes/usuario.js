const express = require("express");
const router = express.Router();
const userSchema = require("../models/usuario");
const { verifyToken, verifyAdmin } = require('./authorization');

// Método para obtener solo los usuarios con rol de 'usuario' (accesible solo para administradores)
router.get("/usuarios", verifyAdmin, verifyToken, (req, res) => {
    userSchema.find({ rol: 'usuario' })
        .then((data) => res.json(data))
        .catch((error) => res.status(500).json({ message: error.message }));
});

// Método para obtener un usuario específico por 'usuario' o 'correo' (accesible solo para administradores)
//GET /api/usuarios/buscar?usuario=johndoe 
router.get("/usuarios/buscar", verifyAdmin, verifyToken, async (req, res) => {
    const { usuario, correo } = req.query; // Usamos query params para que pueda buscar por ambos campos

    try {
        // Buscamos en la base de datos por 'usuario' o 'correo' 
        const user = await userSchema.findOne({
            $or: [{ usuario }, { correo }]
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Método para cambiar datos de una cuenta propia (Válido para todos)
router.put("/usuarios", verifyToken, async (req, res) => {
    const { usuario, correo, clave, nuevaClave } = req.body;

    try {
        // Usamos el id del usuario desde el token
        const user = await userSchema.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Verificamos la clave actual
        const coincide = await user.compareClave(clave);
        if (!coincide) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Actualizamos los campos solo si se envían en la solicitud
        if (usuario) user.usuario = usuario;
        if (correo) user.correo = correo;

        // Si hay una nueva clave, se encripta y actualiza
        if (nuevaClave) {
            user.clave = await user.encryptClave(nuevaClave);
        }

        // Guardamos los cambios en la base de datos
        await user.save();
        res.json({ message: "Datos del usuario actualizados con éxito", user });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
});

// Método para eliminar una cuenta propia (Accesible para todos)
router.delete("/usuarios", verifyToken, async (req, res) => {
    try {
        // Eliminar el usuario de la base de datos
        const result = await userSchema.findByIdAndDelete(req.user.id);

        if (!result) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});


module.exports = router;