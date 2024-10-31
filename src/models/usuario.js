const mongoose = require("mongoose"); 
const bcrypt = require("bcrypt"); 
const userSchema = mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true
    },
    clave: {
        type: String,
        required: true
    }
});
userSchema.methods.encryptClave = async (clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
}
userSchema.methods.compareClave = async function(clave) {
    return bcrypt.compare(clave, this.clave);
};
module.exports = mongoose.model('Usuario', userSchema);
