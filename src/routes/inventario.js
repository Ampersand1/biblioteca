const express = require("express");
const router = express.Router();
const userSchema = require("../models/inventario");

// Método para obtener libro -SOLO PARA EL DESARROLLO-
router.get("/inventario", (req, res) => {
    inventarioSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

module.exports = router;