const { verify } = require('jsonwebtoken');
//función para verificar que el token sea válido
//y si el usuario tiene permiso para acceder
//En el servidor se va a recibir así:
//access-token
//Middleware verifyToken
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: '¡Lo sentimos!, pero no tiene permisos para acceder a esta ruta.' })
    try {
        const verified = verify(token, process.env.SECRET)
        req.user = verified
        next() // Si en token es correcto, se puede continuar
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido' })
    }
}

// Middleware verifyAdmin para verificar el rol de administrador
const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No tiene permisos para acceder a esta ruta' });

    try {
        const verified = verify(token, process.env.SECRET);
        if (verified.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado. Solo administradores pueden acceder a esta ruta' });
        }
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token no válido' });
    }
};

module.exports = { verifyToken, verifyAdmin };
