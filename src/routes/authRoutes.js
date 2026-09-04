const express = require('express');
const {
cadastrarUsuario,
login
} = require('../controllers/authController');
const router = express.Router();
router.post('/auth/cadastro', cadastrarUsuario);
router.post('/auth/login', login);
module.exports = router;