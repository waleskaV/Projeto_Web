const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const Usuario = require('../models/Usuario');

const cadastrarUsuario = async (req, res) => {

    try {

        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {

            return res.status(400).json({

                mensagem: 'Nome, email e senha são obrigatórios'

            });

        }

        const usuarioExistente = await Usuario.findOne({ email });

        if (usuarioExistente) {

            return res.status(409).json({

                mensagem: 'Email já cadastrado'

            });

        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const usuario = new Usuario({

            nome,

            email,

            senha: senhaCriptografada,

            perfil: 'paciente'

        });

        const usuarioSalvo = await usuario.save();

        res.status(201).json({

            mensagem: 'Usuário cadastrado com sucesso',

            usuario: {

                id: usuarioSalvo._id,

                nome: usuarioSalvo.nome,

                email: usuarioSalvo.email,

                perfil: usuarioSalvo.perfil

            }

        });

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao cadastrar usuário',

            erro: error.message

        });

    }

};

const login = async (req, res) => {

    try {

        const { email, senha } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {

            return res.status(401).json({

                mensagem: 'Email ou senha inválidos'

            });

        }

        const senhaValida = await bcrypt.compare(

            senha,

            usuario.senha

        );

        if (!senhaValida) {

            return res.status(401).json({

                mensagem: 'Email ou senha inválidos'

            });

        }

        const token = jwt.sign(

            {

                id: usuario._id,

                email: usuario.email,

                perfil: usuario.perfil

            },

            process.env.JWT_SECRET,

            {

                expiresIn: '1h'

            }

        );

        res.status(200).json({

            mensagem: 'Login realizado com sucesso',

            token,

            usuario: {

                id: usuario._id,

                nome: usuario.nome,

                email: usuario.email,

                perfil: usuario.perfil

            }

        });

    } catch (error) {

        res.status(500).json({

            mensagem: 'Erro ao realizar login',

            erro: error.message

        });

    }

};

module.exports = {

    cadastrarUsuario,

    login

};