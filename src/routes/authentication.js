const express = require("express");
const router = express.Router(); 
const userSchema = require("../models/user");

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

module.exports = router;

