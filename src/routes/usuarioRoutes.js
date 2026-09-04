const express = require('express');

const {
    cadastrarUsuario,
    listarUsuarios,
    atualizarUsuario,
    excluirUsuario
} = require('../controllers/usuarioController');

const {
    autenticar,
    autorizar
} = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/usuarios',
    autenticar,
    cadastrarUsuario
);

router.get(
    '/usuarios',
    autenticar,
    listarUsuarios
);

router.put(
    '/usuarios/:id',
    autenticar,
    atualizarUsuario
);

router.delete(
    '/usuarios/:id',
    autenticar,
    autorizar('admin'),
    excluirUsuario
);

module.exports = router;