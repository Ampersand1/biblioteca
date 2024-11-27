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

router.post("/logout", verifyToken, async (req, res) => {

    res.status(200).json({ message: 'Se ha cerrado la sesión, hasta luego' });
});

//Método -SOLO PARA EL DESARROLLO- para obtener a TODOS los usuarios (NO USAR EN LA APP)
router.get("/usuariostodos", async (req, res) => {
    try {
        const usuarios = await userSchema.find(); // Obtiene todos los usuarios de la base de datos
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los usuarios" });
    }
});
//Método -SOLO PARA EL DESARROLLO- para borrar a TODOS los usuarios ADMIN (NO USAR EN LA APP)
// Método para eliminar todos los usuarios con rol de admin (accesible solo para administradores)
router.delete("/usuarios/admins", async (req, res) => {
    try {
        const resultado = await userSchema.deleteMany({ rol: 'admin' }); // Elimina todos los usuarios con rol 'admin'
        
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios administradores para eliminar." });
        }

        res.json({ message: "Todos los usuarios administradores han sido eliminados con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuarios administradores." });
    }
});
//Método -SOLO PARA EL DESARROLLO- para borrar a TODOS los usuarios USUARIO (NO USAR EN LA APP)
router.delete("/usuarios/usuarios", async (req, res) => {
    try {
        const resultado = await userSchema.deleteMany({ rol: 'usuario' }); // Elimina todos los usuarios con rol 'admin'
        
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios para eliminar." });
        }

        res.json({ message: "Todos los usuarios han sido eliminados con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuarios." });
    }
});
//Método -SOLO PARA EL DESARROLLO- para borrar a TODOS los usuarios (NO USAR EN LA APP)
router.delete("/usuariostodos", async (req, res) => {
    try {
        const resultado = await userSchema.deleteMany({}); // Elimina todos los usuarios

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: "No se encontraron usuarios para eliminar." });
        }

        res.json({ message: "Todos los usuarios han sido eliminados con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar usuarios." });
    }
});

// Método -SOLO DESARROLLO- para borrar a un administrador por su ID 
router.delete("/usuarios/borrar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await userSchema.findById(id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        await userSchema.findByIdAndDelete(id);
        res.json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
});
  
  
module.exports = router;