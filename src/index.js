const parser = require("body-parser");
const express = require('express');
const app = express();
const port = 3000;
const authRoutes = require("./routes/authentication");
const usuarioRoutes = require("./routes/usuario");
const reservaRoutes = require("./routes/reserva");
const inventarioRoutes = require("./routes/inventario");
const cors = require('cors'); // Importa el paquete cors
const mongoose = require("mongoose");
require('dotenv').config();

// Habilita CORS para todas las rutas
app.use(cors())

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use("/api", authRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", inventarioRoutes);
app.use("/api", reservaRoutes);
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexión exitosa"))
    .catch((error) => console.log(error));

app.listen(port, () => {
    console.log(`Escuchando desde el puerto ${port}`)
});
