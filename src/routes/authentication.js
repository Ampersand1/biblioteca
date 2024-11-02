const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const userSchema = require("../models/usuario");
const usuario = require("../models/usuario");

//singup para usuario 
router.post('/signup', async (req, res) => {
    const { usuario, correo, clave, confirmacionClave } = req.body;


    if (clave !== confirmacionClave) {
        return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const user = new userSchema({
        usuario: usuario,
        correo: correo,
        clave: clave
    });

    // Encriptar la contraseña
    user.clave = await user.encryptClave(user.clave);

    try {
        await user.save();
        res.json({ message: "Usuario registrado con éxito", user });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar el usuario" });
    }

});

//singup para administrador (con un método para )

//login para todos los usuarios (evalua si es admin o usuario)

router.post("/login", async (req, res) => {
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

