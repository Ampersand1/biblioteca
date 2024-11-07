const express = require("express");
const router = express.Router();
const inventarioSchema = require("../models/inventario");
const inventario = require("../models/inventario");
const { verifyToken, verifyAdmin } = require('./authorization');

// Método para obtener todos los libros -SOLO PARA EL DESARROLLO-
router.get("/inventario", (req, res) => {
    inventarioSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

//Obtener todos los libros
router.get("/inventario/todos", (req, res) => {
    inventarioSchema.find()
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
//Método para obtener libro por Nombre del libro o Autor (Admin)
router.get("/inventario/buscar", verifyAdmin, verifyToken, async (req, res) => {
    const { nombre, autor } = req.query; // Usamos query params para que pueda buscar por ambos campos

    try {
        // Buscamos en la base de datos por 'nombre' o 'autor' 
        const inventario = await inventarioSchema.findOne({
            $or: [{ Nombre: nombre }, { Autor: autor }]
        });

        if (!inventario) {
            return res.status(404).json({ message: "Libro u articulo no encontrado" });
        }

        res.json(inventario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
//Método para obtener libro por Nombre del libro o Autor (Usuario)
router.get("/inventario/buscar", verifyToken, async (req, res) => {
    const { nombre, autor } = req.query; // Usamos query params para que pueda buscar por ambos campos

    try {
        // Buscamos en la base de datos por 'nombre' o 'autor' 
        const inventario = await inventarioSchema.findOne({
            $or: [{ Nombre: nombre }, { Autor: autor }]
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
router.post("/inventario", verifyAdmin, verifyToken, async (req, res) => {
    const { Nombre, GeneroPrincipal, GeneroSecundario, Autor, AñoPubli, Editorial, ISBN, cantidadDisponible } = req.body;

    try {
        // Verificamos si el libro con el mismo ISBN o nombre ya existe
        const libroExistente = await inventarioSchema.findOne({ $or: [{ ISBN }, { Nombre }] });

        if (libroExistente) {
            return res.status(400).json({ message: "El libro ya existe en el inventario." });
        }

        // Si el libro no existe, lo creamos
        const inventario = new inventarioSchema({
            Nombre,
            GeneroPrincipal,
            GeneroSecundario,
            Autor,
            AñoPubli,
            Editorial,
            ISBN,
            cantidadDisponible: cantidadDisponible || 1 // Utiliza el valor proporcionado o el valor por defecto
        });

        const nuevoLibro = await inventario.save();
        res.status(201).json(nuevoLibro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Método para cambiar información de la referencia
router.put("/inventario/:id", verifyAdmin, verifyToken, async (req, res) => {
    const { id } = req.params;
    const { Nombre, GeneroPrincipal, GeneroSecundario, Autor, AñoPubli, Editorial, ISBN, cantidadDisponible } = req.body;

    try {
        const inventario = await inventarioSchema.findById(id);
        if (!inventario) {
            return res.status(404).json({ error: "Referencia no encontrada" });
        }

        // Actualiza los campos solo si están presentes en el body
        if (Nombre) inventario.Nombre = Nombre;
        if (GeneroPrincipal) inventario.GeneroPrincipal = GeneroPrincipal;
        if (GeneroSecundario) inventario.GeneroSecundario = GeneroSecundario;
        if (Autor) inventario.Autor = Autor;
        if (AñoPubli) inventario.AñoPubli = AñoPubli;
        if (Editorial) inventario.Editorial = Editorial;
        if (ISBN) inventario.ISBN = ISBN;
        if (cantidadDisponible !== undefined) inventario.cantidadDisponible = cantidadDisponible;

        await inventario.save();
        res.json({ message: "Datos del libro en el inventario actualizados con éxito", inventario });
    } catch (error) {
        console.error(error);
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