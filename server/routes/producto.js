const express = require('express');

const { verificarToken } = require('../middlewares/authentication');

const app = express();
const Producto = require('../models/producto');

// ==========================
// Obtener productos
//===========================
app.get('/productos', verificarToken, (req, res) => {

    let filtro = { disponible: true }

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find( filtro )
    .skip(desde)
    .limit(limite)
    .sort('nombre')
    .populate('categoria')
    .populate('usuario', 'nombre email')
    .exec( (err, productos) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        Producto.count ( filtro , ( err, conteo) => {
            res.json({
                ok: true,
                productos,
                cuantos: conteo
            });
        });

    });

});

// ==========================
//  Buscar productos
// ==========================
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria')
        .exec( (err, productos) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });


    });
})

// ==========================
// Obtener un producto por ID
//===========================
app.get('/productos/:id', verificarToken, (req, res) => {

    let id = req.params.id;

    Producto.findById( id )
        .populate('categoria')
        .populate('usuario', 'nombre email')
        .exec( (err, productoDB) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if ( !productoDB ) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

// ==========================
// Crear un nuevo producto
//===========================
app.post('/productos', verificarToken, (req, res) => {

    let body = req.body;
    
    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save( (err, productoDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });

});

// ==========================
// Actualizar un producto
//===========================
app.put('/productos/:id', (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById( id, (err, productoDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save( (err, productoGuardado) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });
        });
    });

});

// ==========================
// Eliminar un producto
//===========================
app.delete('/productos/:id', verificarToken, (req, res) => {
    // cambiar el estado disponible
    let id = req.params.id;

    let cambioDisponible = {
        disponible: false
    };

    Producto.findById(id, (err, productoDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save( (err, productoDB) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
                message: 'Producto Borrado'
            });
        });

    });

});




module.exports = app;