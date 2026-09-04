require('dotenv').config();

const express = require('express');

const {
    expressMiddleware
} = require('@as-integrations/express5');

const {
    ApolloServer
} = require('@apollo/server');

const conectarBanco =
require('./database');

const usuarioRoutes =
require('./routes/usuarioRoutes');

const authRoutes =
require('./routes/authRoutes');

const {
    typeDefs,
    resolvers
} = require('./graphql/schema');

const app = express();

app.use(express.json());

conectarBanco();

app.use(authRoutes);

app.use(usuarioRoutes);

const iniciarServidor = async () => {

    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers
    });

    await apolloServer.start();

    app.use(
        '/graphql',
        expressMiddleware(apolloServer, {
            context: async ({ req }) => {

                const usuario =
                obterUsuarioDoToken(req);

                return {
                    usuario
                };

            }
        })
    );

    const PORT =
    process.env.PORT || 3000;

    app.listen(PORT, () => {

        console.log(
            `Servidor rodando na porta ${PORT}`
        );

        console.log(
            `GraphQL disponível em http://localhost:${PORT}/graphql`
        );

    });

};

const obterUsuarioDoToken = (req) => {

    const authorization =
    req.headers.authorization;

    if (!authorization) {
        return null;
    }

    const [tipo, token] =
    authorization.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return null;
    }

    try {

        const jwt = require('jsonwebtoken');

        return jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (error) {

        return null;

    }

};

iniciarServidor();