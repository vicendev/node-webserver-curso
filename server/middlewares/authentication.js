const jwt = require('jsonwebtoken');

//====================
// Verificar Token
//====================

let verificarToken = ( req, res, next ) => {

    let token = req.get('Authorization'); // Token

    jwt.verify( token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();

    });

};

//====================
// Verificar Admin Rol
//====================

let verificarAdmin_Role = ( req, res, next ) => {

    let usuario = req.usuario;
    
    if (usuario.role === 'ADMIN_ROLE') {

        next();
    } else {

        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }

};




module.exports = {
    verificarToken,
    verificarAdmin_Role
}