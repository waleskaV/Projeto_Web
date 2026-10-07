require('dotenv').config();

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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

const consultaRoutes =
    require('./routes/consultaRoutes');

const {
    typeDefs,
    resolvers
} = require('./graphql/schema');

const app = express();


/*
Validação das variáveis de ambiente.
*/
if (!process.env.JWT_SECRET) {

    console.error(
        'JWT_SECRET não configurado no arquivo .env'
    );

    process.exit(1);
}


/*
Middlewares globais.
*/
app.use(cors());

app.use(express.json());


/*
Lê o usuário a partir do token JWT.
Usado pelo GraphQL.
*/
const obterUsuarioDoToken = (req) => {

    const authorization =
        req.headers.authorization;

    if (!authorization) {
        return null;
    }


    const [tipo, token] =
        authorization.split(' ');


    if (
        tipo !== 'Bearer' ||
        !token
    ) {
        return null;
    }


    try {

        return jwt.verify(
            token,
            process.env.JWT_SECRET
        );

    } catch (error) {

        return null;

    }

};


/*
Inicialização do servidor.
*/
const iniciarServidor = async () => {

    try {

        /*
        Primeiro conecta ao MongoDB.
        */
        await conectarBanco();


        /*
        Rotas REST.
        */
        app.use(authRoutes);

        app.use(usuarioRoutes);

        app.use(consultaRoutes);


        /*
        Servidor GraphQL.
        */
        const apolloServer =
            new ApolloServer({
                typeDefs,
                resolvers
            });


        await apolloServer.start();


        app.use(
            '/graphql',

            expressMiddleware(
                apolloServer,
                {

                    context:
                    async ({ req }) => {

                        const usuario =
                            obterUsuarioDoToken(
                                req
                            );

                        return {
                            usuario
                        };

                    }

                }
            )
        );


        const PORT =
            process.env.PORT || 3000;


        app.listen(
            PORT,
            () => {

                console.log(
                    `Servidor rodando na porta ${PORT}`
                );

                console.log(
                    `REST: http://localhost:${PORT}`
                );

                console.log(
                    `GraphQL: http://localhost:${PORT}/graphql`
                );

            }
        );


    } catch (error) {

        console.error(
            'Erro ao iniciar o servidor:',
            error.message
        );

        process.exit(1);

    }

};


iniciarServidor();