const express = require("express");
const router = express.Router();
const inventarioSchema = require("../models/inventario");
const inventario = require("../models/inventario");

// Método para obtener todos los libros -SOLO PARA EL DESARROLLO-
router.get("/inventario", (req, res) => {
    inventarioSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
//Método para obtener libro por Nombre del libro o Autor
router.get("/inventario/buscar", verifyAdmin, verifyToken, async (req, res) => {
    const { nombre, autor } = req.query; // Usamos query params para que pueda buscar por ambos campos

    try {
        // Buscamos en la base de datos por 'nombre' o 'autor' 
        const libro = await inventarioSchema.findOne({
            $or: [{ nombre }, { autor }]
        });

        if (!inventario) {
            return res.status(404).json({ message: "Libro u articulo no encontrado" });
        }

        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//Nuevo Libro
router.post("/inventario",verifyAdmin, verifyToken, (req, res) => {
    const inventario = inventarioSchema(req.body);
    inventario
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
// Método para cambiar información de la referencia
router.put("/inventario", verifyAdmin, verifyToken, async (req, res) => {
    const { Nombre, GeneroPrincipal, GeneroSecundario, Autor, AñoPubli, Editorial, ISBN } = req.body;

    try {
        // Usamos el id del usuario desde el token
        const inventario = await inventarioSchema.findById(req.libro.id);
        if (!inventario) {
            return res.status(404).json({ error: "Referencia no encontrada" });
        }
        // Actualizamos los campos solo si se envían en la solicitud
        if (Nombre) inventario.Nombre = Nombre;
        if (GeneroPrincipal) inventario.GeneroPrincipal = GeneroPrincipal;
        if (GeneroSecundario) inventario.GeneroSecundario = GeneroSecundario;
        if (Autor) inventario.Autor = Autor;
        if (AñoPubli) inventario.AñoPubli = AñoPubli;
        if (Editorial) inventario.Editorial = Editorial;
        if (ISBN) inventario.ISBN = ISBN;
        // Guardamos los cambios en la base de datos
        await inventario.save();
        res.json({ message: "Datos del libro en el inventario actualizados con éxito", inventario });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el inventario" });
    }
});
// Método -SOLO DESARROLLO- para borrar a un libro por su ID 
router.delete("/inventario/borrar/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const inventario = await inventarioSchema.findById(id);
        if (!inventario) {
            return res.status(404).json({ error: "Referencia no encontrada" });
        }

        await inventarioSchema.findByIdAndDelete(id);
        res.json({ message: "Referencia eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el libro o articulo" });
    }
});

module.exports = router;