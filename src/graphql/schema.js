const { gql } = require('graphql-tag');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

const typeDefs = gql`

type Usuario {
    id: ID!
    nome: String
    email: String
    perfil: String
}

type Query {
    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario
}

type Mutation {
    cadastrarUsuario(
        nome: String!
        email: String!
        senha: String!
        perfil: String
    ): Usuario!

    atualizarUsuario(
        id: ID!
        nome: String
        email: String
        senha: String
        perfil: String
    ): Usuario!

    excluirUsuario(id: ID!): String!
}

`;

const resolvers = {

    Query: {

        usuarios: async () => {
            return await Usuario.find();
        },

        usuario: async (_, { id }) => {
            return await Usuario.findById(id);
        }

    },

    Mutation: {

        cadastrarUsuario: async (
            _,
            { nome, email, senha, perfil }
        ) => {

            const senhaCriptografada =
            await bcrypt.hash(senha, 10);

            const usuario = new Usuario({
                nome,
                email,
                senha: senhaCriptografada,
                perfil
            });

            return await usuario.save();

        },

        atualizarUsuario: async (
            _,
            { id, nome, email, senha, perfil }
        ) => {

            const dados = {};

            if (nome) {
                dados.nome = nome;
            }

            if (email) {
                dados.email = email;
            }

            if (perfil) {
                dados.perfil = perfil;
            }

            if (senha) {
                dados.senha =
                await bcrypt.hash(senha, 10);
            }

            const usuario =
            await Usuario.findByIdAndUpdate(
                id,
                dados,
                { new: true }
            );

            if (!usuario) {
                throw new Error(
                    'Usuário não encontrado'
                );
            }

            return usuario;

        },

        excluirUsuario: async (_, { id }) => {

            const usuario =
            await Usuario.findByIdAndDelete(id);

            if (!usuario) {

                throw new Error(
                    'Usuário não encontrado'
                );

            }

            return 'Usuário excluído com sucesso';

        }

    }

};

module.exports = {
    typeDefs,
    resolvers
};