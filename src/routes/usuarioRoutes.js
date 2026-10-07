const express = require('express');

const {
    cadastrarUsuario,
    listarUsuarios,
    listarMedicos,
    atualizarUsuario,
    excluirUsuario
} = require('../controllers/usuarioController');

const {
    autenticar,
    autorizar
} = require('../middlewares/authMiddleware');

const router =
    express.Router();


router.post(
    '/usuarios',
    autenticar,
    autorizar('admin'),
    cadastrarUsuario
);


router.get(
    '/medicos',
    autenticar,
    listarMedicos
);


router.get(
    '/usuarios',
    autenticar,
    autorizar('admin'),
    listarUsuarios
);


router.put(
    '/usuarios/:id',
    autenticar,
    autorizar('admin'),
    atualizarUsuario
);


router.delete(
    '/usuarios/:id',
    autenticar,
    autorizar('admin'),
    excluirUsuario
);


module.exports =
    router;