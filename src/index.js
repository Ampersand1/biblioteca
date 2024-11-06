const parser = require("body-parser");
const express = require('express');
const app = express();
const port = 3000;
const authRoutes = require("./routes/authentication");
const usuarioRoutes = require("./routes/usuario");
const mongoose = require("mongoose");
const inventarioRoutes = require("./routes/inventario");
require('dotenv').config();

app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use("/api", authRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", inventarioRoutes)
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Conexión exitosa"))
    .catch((error) => console.log(error));

app.listen(port, () => {
    console.log(`Escuchando desde el puerto ${port}`)
});
