const parser = require("body-parser");
const express = require('express');
const cors = require('cors'); // Importa el paquete cors
const app = express();
const port = 3000;
const authRoutes = require("./routes/authentication");
const usuarioRoutes = require("./routes/usuario");
const inventarioRoutes = require("./routes/inventario");
const reservaRoutes = require("./routes/reserva");

const mongoose = require("mongoose");
require('dotenv').config();

// Habilitar CORS
app.use(cors({
    origin: '*',  // Permitir solicitudes solo desde tu frontend (Angular en localhost:4200)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],        // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization']  // Headers permitidos
}));

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
