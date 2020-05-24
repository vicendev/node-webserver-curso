const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/authentication')

const app = express();


app.get('/usuario', verificarToken, (req, res) => {

    let filtro = { estado: true }

    let desde = req.query.desde || 0
    desde = Number(desde)

    let limite = req.query.limite || 5;
    limite = Number(limite)
   
    Usuario.find( filtro, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {

                if ( err ) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                Usuario.count( filtro , (err, conteo) => {

                    res.json({
                        ok: true,
                        usuarios,
                        cuantos: conteo
                    });

                });
            });

});
   
app.post('/usuario', [verificarToken, verificarAdmin_Role], (req, res) => {

    let body = req.body

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save( (err, usuarioDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });

});

app.put('/usuario/:id',  [verificarToken, verificarAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = _.pick( req.body, ['nombre','email','img','role','estado'] );

    Usuario.findByIdAndUpdate( id, body, {new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});


app.delete('/usuario/:id',  [verificarToken, verificarAdmin_Role], (req, res) => {
    
    let id = req.params.id;

    let cambioEstado = {
        estado: false
    };

    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    Usuario.findByIdAndUpdate(id, cambioEstado, { new: true } , (err, usuarioBorrado) => {
        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        })

    });

});
  

  module.exports = app;