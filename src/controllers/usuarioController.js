const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');


const cadastrarUsuario = async (req, res) => {

    try {

        const {
            nome,
            email,
            senha,
            perfil,
            paciente,
            medico,
            consultas,
            notificacoes
        } = req.body;


        if (
            !nome ||
            !email ||
            !senha ||
            !perfil
        ) {

            return res.status(400).json({

                mensagem:
                    'Nome, email, senha e perfil são obrigatórios'

            });

        }


        const usuarioExistente =
            await Usuario.findOne({
                email
            });


        if (usuarioExistente) {

            return res.status(409).json({

                mensagem:
                    'Email já cadastrado'

            });

        }


        const senhaCriptografada =
            await bcrypt.hash(
                senha,
                10
            );


        const usuario =
            new Usuario({

                nome,

                email,

                senha:
                    senhaCriptografada,

                perfil,

                paciente:
                    paciente || {},

                medico:
                    medico || {},

                consultas:
                    consultas || [],

                notificacoes:
                    notificacoes || []

            });


        const usuarioSalvo =
            await usuario.save();


        res.status(201).json({

            mensagem:
                'Usuário cadastrado com sucesso',

            usuario: {

                id:
                    usuarioSalvo._id,

                nome:
                    usuarioSalvo.nome,

                email:
                    usuarioSalvo.email,

                perfil:
                    usuarioSalvo.perfil,

                paciente:
                    usuarioSalvo.paciente,

                medico:
                    usuarioSalvo.medico

            }

        });


    } catch (error) {

        res.status(500).json({

            mensagem:
                'Erro ao cadastrar usuário',

            erro:
                error.message

        });

    }

};


const listarUsuarios = async (req, res) => {

    try {

        const usuarios =
            await Usuario.find()
                .select('-senha');

        res.status(200).json(
            usuarios
        );

    } catch (error) {

        res.status(500).json({

            mensagem:
                'Erro ao buscar usuários',

            erro:
                error.message

        });

    }

};


const listarMedicos = async (req, res) => {

    try {

        const medicos =
            await Usuario.find({
                perfil: 'medico'
            })
            .select(
                'nome email medico.especialidades medico.crm'
            );

        res.status(200).json(
            medicos
        );

    } catch (error) {

        res.status(500).json({

            mensagem:
                'Erro ao buscar médicos',

            erro:
                error.message

        });

    }

};


const atualizarUsuario = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        if (req.body.senha) {

            req.body.senha =
                await bcrypt.hash(
                    req.body.senha,
                    10
                );

        }


        const usuario =
            await Usuario.findByIdAndUpdate(

                id,

                req.body,

                {
                    new: true,
                    runValidators: true
                }

            ).select('-senha');


        if (!usuario) {

            return res.status(404).json({

                mensagem:
                    'Usuário não encontrado'

            });

        }


        res.status(200).json(
            usuario
        );


    } catch (error) {

        res.status(500).json({

            mensagem:
                'Erro ao atualizar usuário',

            erro:
                error.message

        });

    }

};


const excluirUsuario = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const usuario =
            await Usuario.findByIdAndDelete(
                id
            );


        if (!usuario) {

            return res.status(404).json({

                mensagem:
                    'Usuário não encontrado'

            });

        }


        res.status(200).json({

            mensagem:
                'Usuário excluído com sucesso'

        });


    } catch (error) {

        res.status(500).json({

            mensagem:
                'Erro ao excluir usuário',

            erro:
                error.message

        });

    }

};


module.exports = {

    cadastrarUsuario,

    listarUsuarios,

    listarMedicos,

    atualizarUsuario,

    excluirUsuario

};