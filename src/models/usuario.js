const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
    usuario: {
        type: String,
        unique: true,
        required: true
    },
    correo: {
        type: String,
        unique: true,
        required: true
    },

    clave: {
        type: String,
        required: true
    },
    rol: { 
        type: String, 
        enum: ["usuario", "admin"], 
        default: "usuario" } 
});
userSchema.methods.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}
userSchema.methods.compareClave = async function (clave) {
    return bcrypt.compare(clave, this.clave);
};
module.exports = mongoose.model('Usuario', userSchema);
