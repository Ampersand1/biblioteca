const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../models/usuario");

//singup para usuario 
router.post('/signup', async (req, res) => {
    const { usuario, correo, clave, confirmacionClave } = req.body;

    if (clave !== confirmacionClave) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    try {
        // Se hace la verificación para ver si el usuario ya existe
        const usuarioExistente = await userSchema.findOne({ usuario });
        if (usuarioExistente) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
        }

        // Se hace la verificación para ver si el correo ya existe
        const correoExistente = await userSchema.findOne({ correo });
        if (correoExistente) {
            return res.status(400).json({ error: "El correo ya está en uso" });
        }

        const user = new userSchema({
            usuario,
            correo,
            clave
        });

        // Se encripta la contraseña del usuario
        user.clave = await user.encryptClave(user.clave);

        await user.save();

        return res.json({
            message: "Usuario registrado con éxito",
            auth: true,
            user
        });
    } catch (error) {
        return res.status(500).json({ error: "Error al registrar el usuario" });
    }
});


// Método signupAdmin para el registro de administradores
router.post('/signupadmin', async (req, res) => {
    const { usuario, correo, clave, confirmacionClave, adminToken } = req.body;

    if (clave !== confirmacionClave) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    // Verificación del token de administrador
    if (adminToken !== process.env.ADMIN_TOKEN) {
        return res.status(403).json({ error: "Token de administrador no válido" });
    }

    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await userSchema.findOne({ usuario });
        if (usuarioExistente) {
            return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
        }

        // Verificar si el correo ya existe
        const correoExistente = await userSchema.findOne({ correo });
        if (correoExistente) {
            return res.status(400).json({ error: "El correo ya está en uso" });
        }

        // Crear un nuevo usuario con rol de administrador
        const user = new userSchema({
            usuario,
            correo,
            clave,
            rol: "admin" // Asigna el rol de admin
        });

        // Encriptar la contraseña
        user.clave = await user.encryptClave(user.clave);

        await user.save();

        return res.json({
            message: "Administrador registrado con éxito",
            auth: true,
            user
        });
    } catch (error) {
        return res.status(500).json({ error: "Error al registrar el administrador" });
    }
});

//login para todos los usuarios 

router.post("/login", async (req, res) => {
    // Obtener usuario y clave del cuerpo de la solicitud
    const { usuario, clave } = req.body;
    const nombreUsuario = req.body.usuario;
    // Comprobar que se proporcionó al menos uno de los campos (usuario o correo) y la clave
    if (!usuario || !clave) {
        return res.status(400).json({ error: "El nombre de usuario/correo y la contraseña son requeridos." });
    }

    try {
        // Buscar el usuario en la base de datos por usuario o correo
        const user = await userSchema.findOne({
            $or: [{ usuario }, { correo: usuario }] // Verifica si el campo corresponde al usuario o al correo
        });

        if (!user) return res.status(400).json({ error: "Usuario no encontrado" });

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(clave, user.clave);
        if (!validPassword) return res.status(400).json({ error: "Contraseña incorrecta" });

        // Generar un token para el usuario
        const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.SECRET, {
            expiresIn: 60 * 60 * 24, // un día en segundos
        });

        // Respuesta exitosa con el token
        res.status(200).json({
            message: "Bienvenido(a) a la biblioteca "+nombreUsuario,
            auth: true,
            token,
        });
    } catch (error) {
        res.status(500).json({ error: "Error al iniciar sesión" });
    }
});


module.exports = router;

