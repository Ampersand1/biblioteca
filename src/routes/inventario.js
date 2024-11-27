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
router.get("/inventario/buscar/admin", verifyAdmin, verifyToken, async (req, res) => {
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
router.get("/inventario/buscar", async (req, res) => {
    const { query } = req.query;  // Extraemos el parámetro de búsqueda

    // Validación del parámetro
    if (!query) {
        return res.status(400).json({ message: "Debe proporcionar un término de búsqueda." });
    }

    try {
        let queryObj = {};

        // Si el término de búsqueda está presente, se busca tanto en nombre como en autor
        if (query) {
            queryObj = {
                $or: [
                    { Nombre: { $regex: query, $options: 'i' } },
                    { Autor: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const libros = await inventarioSchema.find(queryObj).limit(10);

        if (libros.length === 0) {
            return res.status(404).json({ message: "No se encontraron libros." });
        }

        res.json(libros);  // Devolvemos los libros encontrados
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Nuevo Libro
router.post('/inventario', verifyToken, verifyAdmin, async (req, res) => {
    const { Nombre, Autor, ISBN, Editorial, imagen, GeneroPrincipal, GeneroSecundario, AnoPubli, cantidadDisponible } = req.body;

    try {
        // Verificar si ya existe un libro con el mismo ISBN o Nombre
        const libroExistente = await inventarioSchema.findOne({
            $or: [{ ISBN }, { Nombre }]
        });

        if (libroExistente) {
            return res.status(400).json({ message: 'El libro ya existe en el inventario.' });
        }

        // Crear el nuevo libro
        const nuevoLibro = new inventarioSchema({
            Nombre,
            Autor,
            ISBN,
            Editorial,
            GeneroPrincipal,
            GeneroSecundario,
            AnoPubli,
            cantidadDisponible,
            imagen
        });

        // Guardar el libro en la base de datos
        await nuevoLibro.save();

        // Responder con el nuevo libro
        res.status(201).json(nuevoLibro);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Método para cambiar información de la referencia
router.put("/inventario/:id", verifyAdmin, verifyToken, async (req, res) => {
    const { id } = req.params; // Obtener el ID desde los parámetros de la URL
    const { Nombre, GeneroPrincipal, GeneroSecundario, Autor, AnoPubli, Editorial, ISBN, imagen, cantidadDisponible } = req.body;

    try {
        // Buscamos el libro en el inventario por su id
        const inventario = await inventarioSchema.findById(id);
        if (!inventario) {
            console.log("prueba de que no coge el libro")
            return res.status(404).json({ error: "Referencia no encontrada" });
        }

        // Actualizamos los campos solo si se envían en la solicitud
        if (Nombre) inventario.Nombre = Nombre;
        if (GeneroPrincipal) inventario.GeneroPrincipal = GeneroPrincipal;
        if (GeneroSecundario) inventario.GeneroSecundario = GeneroSecundario;
        if (Autor) inventario.Autor = Autor;
        if (AnoPubli) inventario.AñoPubli = AnoPubli;
        if (Editorial) inventario.Editorial = Editorial;
        if (ISBN) inventario.ISBN = ISBN;
        if (imagen) inventario.imagen = imagen;
        if (cantidadDisponible) inventario.cantidadDisponible = cantidadDisponible;

        console.log("prueba de que los datos llegan")

        // Guardamos los cambios en la base de datos
        await inventario.save();
        res.json({ message: "Datos del libro en el inventario actualizados con éxito", inventario });
    } catch (error) {
        console.error(error); // Log para ver el error en la consola
        res.status(500).json({ error: "Error al actualizar el inventario" });
    }
});

// Método -SOLO DESARROLLO- para borrar a un libro por su ID 
router.delete("/inventario/:id", async (req, res) => {
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

// Obtener 4 libros al azar
router.get("/inventario/random", async (req, res) => {
    try {
        const librosAleatorios = await inventarioSchema.aggregate([
            { $sample: { size: 4 } } // Selecciona aleatoriamente 3 documentos
        ]);

        res.json(librosAleatorios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;