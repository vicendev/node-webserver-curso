const express = require('express');

const Categoria = require('../models/categoria');
const { verificarToken, verificarAdmin_Role } = require('../middlewares/authentication');

const app = express();

// =============================
//  Mostrar todas las categorias
// =============================
app.get('/categoria', verificarToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
    });

});

// =============================
//  Mostrar una categoria por ID
// =============================
app.get('/categoria/:id', verificarToken, (req, res) => {
    
    let id = req.params.id;

    Categoria.findById( id, (err, categoria) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });

});

// =============================
//  Crear nueva categoria
// =============================
app.post('/categoria', [verificarToken, verificarAdmin_Role], (req, res) => {

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// =============================
//  Actualizar una categoria
// =============================
app.put('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    
    let id = req.params.id;

    let body = req.body;
    
    Categoria.findByIdAndUpdate( id, body, {new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        

        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});


// =============================
//  Eliminar una categoria
// =============================
app.delete('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {

    let id = req.params.id;
    
    Categoria.findByIdAndRemove(id, (err, categoriaEliminada) => {

        if ( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if ( !categoriaEliminada ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria eliminada',
            categoria: categoriaEliminada
        });

    });

});

module.exports = app;