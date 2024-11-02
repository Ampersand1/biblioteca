const jwt = require('jsonwebtoken')
//función para verificar que el token sea válido
//y si el usuario tiene permiso para acceder
//En el servidor se va a recibir así:
//access-token
//metodo verifyToken
const verifyToken = (req, res, next) => {
    const token = req.header('access-token')
    if (!token) return res.status(401).json({ error: '¡Lo sentimos!, pero no tiene permisos para acceder a esta ruta.' })
    try {
        const verified = jwt.verify(token, process.env.SECRET)
        req.user = verified
        next() // Si en token es correcto, se puede continuar
    } catch (error) {
        res.status(400).json({ error: 'El token no es válido' })
    }
}

//metodo verifyAdmin

module.exports = verifyToken;