const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

const cadastrarUsuario = async (req, res) => {

    try {

        const senhaCriptografada = await bcrypt.hash(req.body.senha, 10);

        const usuario = new Usuario({

            nome: req.body.nome,

            email: req.body.email,

            senha: senhaCriptografada,

            perfil: req.body.perfil,

            paciente: req.body.paciente,

            medico: req.body.medico,

            consultas: req.body.consultas,

            notificacoes: req.body.notificacoes

        });

        const usuarioSalvo = await usuario.save();

        res.status(201).json(usuarioSalvo);

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao cadastrar usuário',

            erro: error.message

        });

    }

};

const listarUsuarios = async (req, res) => {

    try {

        const usuarios = await Usuario.find();

        res.status(200).json(usuarios);

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao buscar usuários',

            erro: error.message

        });

    }

};

const atualizarUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        if (req.body.senha) {

            req.body.senha = await bcrypt.hash(
                req.body.senha,
                10
            );

        }

        const usuario = await Usuario.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!usuario) {

            return res.status(404).json({

                mensagem: 'Usuário não encontrado'

            });

        }

        res.status(200).json(usuario);

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao atualizar usuário',

            erro: error.message

        });

    }

};

const excluirUsuario = async (req, res) => {

    try {

        const { id } = req.params;

        const usuario = await Usuario.findByIdAndDelete(id);

        if (!usuario) {

            return res.status(404).json({

                mensagem: 'Usuário não encontrado'

            });

        }

        res.status(200).json({

            mensagem: 'Usuário excluído com sucesso'

        });

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao excluir usuário',

            erro: error.message

        });

    }

};

module.exports = {

    cadastrarUsuario,

    listarUsuarios,

    atualizarUsuario,

    excluirUsuario

};