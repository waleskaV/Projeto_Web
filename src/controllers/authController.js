const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');


const cadastrarUsuario = async (req, res) => {

    try {

        const {
            nome,
            email,
            senha,
            paciente
        } = req.body;


        if (
            !nome ||
            !email ||
            !senha
        ) {

            return res.status(400).json({
                mensagem:
                    'Nome, email e senha são obrigatórios'
            });

        }


        const emailNormalizado =
            email.toLowerCase().trim();


        const usuarioExistente =
            await Usuario.findOne({
                email: emailNormalizado
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

                nome:
                    nome.trim(),

                email:
                    emailNormalizado,

                senha:
                    senhaCriptografada,

                /*
                Cadastro público sempre cria paciente.
                O usuário não pode escolher o perfil.
                */
                perfil:
                    'paciente',

                paciente:
                    paciente || {},

                medico:
                    {},

                consultas:
                    [],

                notificacoes:
                    []

            });


        const usuarioSalvo =
            await usuario.save();


        return res.status(201).json({

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
                    usuarioSalvo.paciente

            }

        });


    } catch (error) {

        console.error(
            'Erro ao cadastrar usuário:',
            error
        );


        return res.status(500).json({

            mensagem:
                'Erro ao cadastrar usuário',

            erro:
                error.message

        });

    }

};


const login = async (req, res) => {

    try {

        const {
            email,
            senha
        } = req.body;


        if (
            !email ||
            !senha
        ) {

            return res.status(400).json({
                mensagem:
                    'Email e senha são obrigatórios'
            });

        }


        const emailNormalizado =
            email.toLowerCase().trim();


        const usuario =
            await Usuario.findOne({
                email:
                    emailNormalizado
            });


        if (!usuario) {

            return res.status(401).json({
                mensagem:
                    'Email ou senha inválidos'
            });

        }


        const senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha
            );


        if (!senhaValida) {

            return res.status(401).json({
                mensagem:
                    'Email ou senha inválidos'
            });

        }


        const token =
            jwt.sign(

                {
                    id:
                        usuario._id,

                    email:
                        usuario.email,

                    perfil:
                        usuario.perfil
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        '1h'
                }

            );


        return res.status(200).json({

            mensagem:
                'Login realizado com sucesso',

            token,

            usuario: {

                id:
                    usuario._id,

                nome:
                    usuario.nome,

                email:
                    usuario.email,

                perfil:
                    usuario.perfil

            }

        });


    } catch (error) {

        console.error(
            'Erro ao realizar login:',
            error
        );


        return res.status(500).json({

            mensagem:
                'Erro ao realizar login',

            erro:
                error.message

        });

    }

};


module.exports = {
    cadastrarUsuario,
    login
};