const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const userSchema = require("../models/usuario");
const usuario = require("../models/usuario");
const { verifyToken, verifyAdmin } = require('./authorization');

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

        const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.SECRET, {
            expiresIn: 60 * 60 * 24, // un día en segundos
        });

        return res.json({
            message: "Usuario registrado con éxito",
            auth: true,
            token,
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

        const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.SECRET, {
            expiresIn: 60 * 60 * 24, // un día en segundos
        });

        return res.json({
            message: "Administrador registrado con éxito",
            auth: true,
            token,
            user
        });
    } catch (error) {
        return res.status(500).json({ error: "Error al registrar el administrador" });
    }
});

//login para todos los usuarios 

router.post("/login", verifyToken, async (req, res) => {
    const { error } = userSchema.validate(req.body.usuario, req.body.clave);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await userSchema.findOne({ usuario: req.body.usuario });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    const validPassword = await bcrypt.compare(req.body.clave, user.clave);
    if (!validPassword)
        return res.status(400).json({ error: "Contraseña incorrecta" });
    res.json({
        error: null,
        data: "Bienvenido(a) a la biblioteca",
    });
});

//login para adminsitradores
router.post("/loginAdmin", verifyToken, verifyAdmin, async (req, res) => {
    const { error } = userSchema.validate(req.body.usuario, req.body.clave);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const user = await userSchema.findOne({ usuario: req.body.usuario });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    const validPassword = await bcrypt.compare(req.body.clave, user.clave);
    if (!validPassword)
        return res.status(400).json({ error: "Contraseña incorrecta" });
    res.json({
        error: null,
        data: "Bienvenido(a) a la biblioteca",
    });
});

module.exports = router;

