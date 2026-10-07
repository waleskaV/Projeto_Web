const express = require('express');

const router = express.Router();

const {
    autenticar,
    autorizar
} = require('../middlewares/authMiddleware');

const {
    criarConsulta,
    listarConsultas,
    buscarConsultaPorId,
    atualizarConsulta,
    excluirConsulta
} = require('../controllers/consultaController');


/*
Criar consulta
Somente paciente.
*/
router.post(
    '/consultas',
    autenticar,
    autorizar('paciente'),
    criarConsulta
);


/*
Listar consultas
Paciente: vê as próprias.
Médico: vê as destinadas a ele.
Admin: vê todas.
*/
router.get(
    '/consultas',
    autenticar,
    listarConsultas
);


/*
Buscar consulta por ID.
*/
router.get(
    '/consultas/:id',
    autenticar,
    buscarConsultaPorId
);


/*
Atualizar consulta
Paciente, médico e admin podem usar,
mas o controller controla o que cada perfil pode fazer.
*/
router.put(
    '/consultas/:id',
    autenticar,
    atualizarConsulta
);


/*
Excluir consulta
Somente admin.
*/
router.delete(
    '/consultas/:id',
    autenticar,
    autorizar('admin'),
    excluirConsulta
);


module.exports = router;