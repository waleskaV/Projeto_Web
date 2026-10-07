const { gql } = require('graphql-tag');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');


const typeDefs = gql`

type Especialidade {
    id: ID!
    nome: String
    descricao: String
}

type Medico {
    crm: String
    especialidades: [Especialidade]
}

type Consulta {
    id: ID!
    pacienteId: String
    medicoId: String
    especialidadeId: String
    dataHora: String
    status: String
    motivo: String
    criadoPor: String
    canceladoEm: String
    motivoCancelamento: String
}

type Usuario {
    id: ID!
    nome: String
    email: String
    perfil: String
    medico: Medico
    consultas: [Consulta]
}

type Query {

    usuarios: [Usuario!]!

    usuario(
        id: ID!
    ): Usuario

    medicos: [Usuario!]!

    minhasConsultas: [Consulta!]!
}

type Mutation {

    cadastrarUsuario(
        nome: String!
        email: String!
        senha: String!
        perfil: String!
    ): Usuario!

    atualizarUsuario(
        id: ID!
        nome: String
        email: String
        senha: String
        perfil: String
    ): Usuario!

    excluirUsuario(
        id: ID!
    ): String!

    agendarConsulta(
        medicoId: ID!
        especialidadeId: ID!
        dataHora: String!
        motivo: String
    ): Consulta!

    cancelarConsulta(
        id: ID!
        motivoCancelamento: String
    ): Consulta!
}

`;


const resolvers = {

    Query: {

        /*
        Somente admin lista todos os usuários.
        */
        usuarios: async (
            _,
            __,
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'admin'
            ) {
                throw new Error(
                    'Usuário sem permissão'
                );
            }

            return await Usuario.find()
                .select('-senha');
        },


        /*
        Somente admin consulta qualquer usuário.
        */
        usuario: async (
            _,
            { id },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'admin'
            ) {
                throw new Error(
                    'Usuário sem permissão'
                );
            }

            return await Usuario
                .findById(id)
                .select('-senha');
        },


        /*
        Qualquer usuário autenticado
        pode listar médicos.
        */
        medicos: async (
            _,
            __,
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            return await Usuario.find({
                perfil: 'medico'
            })
            .select(
                'nome email perfil medico'
            );
        },


        /*
        Paciente vê suas próprias consultas.
        Médico vê consultas destinadas a ele.
        Admin vê todas.
        */
        minhasConsultas: async (
            _,
            __,
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }


            if (
                context.usuario.perfil ===
                'paciente'
            ) {

                const paciente =
                    await Usuario.findById(
                        context.usuario.id
                    );

                if (!paciente) {
                    throw new Error(
                        'Paciente não encontrado'
                    );
                }

                return paciente.consultas || [];
            }


            if (
                context.usuario.perfil ===
                'medico'
            ) {

                const pacientes =
                    await Usuario.find({
                        perfil: 'paciente',
                        'consultas.medicoId':
                            context.usuario.id
                    });

                const consultas = [];

                pacientes.forEach(
                    paciente => {

                        paciente.consultas.forEach(
                            consulta => {

                                if (
                                    consulta.medicoId ===
                                    context.usuario.id
                                ) {
                                    consultas.push(
                                        consulta
                                    );
                                }

                            }
                        );

                    }
                );

                return consultas;
            }


            if (
                context.usuario.perfil ===
                'admin'
            ) {

                const pacientes =
                    await Usuario.find({
                        perfil: 'paciente'
                    });

                const consultas = [];

                pacientes.forEach(
                    paciente => {

                        paciente.consultas.forEach(
                            consulta => {

                                consultas.push(
                                    consulta
                                );

                            }
                        );

                    }
                );

                return consultas;
            }


            throw new Error(
                'Perfil sem permissão'
            );
        }

    },


    Mutation: {

        /*
        Somente admin cadastra usuários
        via GraphQL.
        */
        cadastrarUsuario: async (
            _,
            {
                nome,
                email,
                senha,
                perfil
            },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'admin'
            ) {
                throw new Error(
                    'Usuário sem permissão'
                );
            }


            const usuarioExistente =
                await Usuario.findOne({
                    email
                });


            if (usuarioExistente) {
                throw new Error(
                    'Email já cadastrado'
                );
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

                    perfil

                });


            return await usuario.save();

        },


        /*
        Somente admin atualiza usuários.
        */
        atualizarUsuario: async (
            _,
            {
                id,
                nome,
                email,
                senha,
                perfil
            },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'admin'
            ) {
                throw new Error(
                    'Usuário sem permissão'
                );
            }


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
                    await bcrypt.hash(
                        senha,
                        10
                    );

            }


            const usuario =
                await Usuario.findByIdAndUpdate(

                    id,

                    dados,

                    {
                        new: true,
                        runValidators: true
                    }

                ).select('-senha');


            if (!usuario) {
                throw new Error(
                    'Usuário não encontrado'
                );
            }


            return usuario;

        },


        /*
        Somente admin exclui usuários.
        */
        excluirUsuario: async (
            _,
            { id },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'admin'
            ) {
                throw new Error(
                    'Usuário sem permissão'
                );
            }


            const usuario =
                await Usuario.findByIdAndDelete(
                    id
                );


            if (!usuario) {
                throw new Error(
                    'Usuário não encontrado'
                );
            }


            return 'Usuário excluído com sucesso';

        },


        /*
        Somente paciente agenda consulta.
        */
        agendarConsulta: async (
            _,
            {
                medicoId,
                especialidadeId,
                dataHora,
                motivo
            },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }

            if (
                context.usuario.perfil !==
                'paciente'
            ) {
                throw new Error(
                    'Somente pacientes podem agendar consultas'
                );
            }


            const paciente =
                await Usuario.findById(
                    context.usuario.id
                );


            if (!paciente) {
                throw new Error(
                    'Paciente não encontrado'
                );
            }


            const medico =
                await Usuario.findById(
                    medicoId
                );


            if (!medico) {
                throw new Error(
                    'Médico não encontrado'
                );
            }


            if (
                medico.perfil !==
                'medico'
            ) {
                throw new Error(
                    'Usuário informado não é médico'
                );
            }


            const especialidadeExiste =
                medico.medico.especialidades.some(
                    especialidade =>
                        especialidade._id.toString() ===
                        especialidadeId.toString()
                );


            if (!especialidadeExiste) {
                throw new Error(
                    'Especialidade não pertence ao médico'
                );
            }


            paciente.consultas.push({

                pacienteId:
                    paciente._id.toString(),

                medicoId:
                    medico._id.toString(),

                especialidadeId:
                    especialidadeId.toString(),

                dataHora:
                    new Date(dataHora),

                status:
                    'agendada',

                motivo:
                    motivo || '',

                criadoPor:
                    paciente._id.toString(),

                canceladoEm:
                    null,

                motivoCancelamento:
                    ''

            });


            await paciente.save();


            return paciente.consultas[
                paciente.consultas.length - 1
            ];

        },


        /*
        Paciente cancela apenas a própria consulta.
        */
        cancelarConsulta: async (
            _,
            {
                id,
                motivoCancelamento
            },
            context
        ) => {

            if (!context.usuario) {
                throw new Error(
                    'Usuário não autenticado'
                );
            }


            const paciente =
                await Usuario.findOne({
                    'consultas._id': id
                });


            if (!paciente) {
                throw new Error(
                    'Consulta não encontrada'
                );
            }


            const consulta =
                paciente.consultas.id(id);


            if (
                context.usuario.perfil ===
                'paciente'
            ) {

                if (
                    paciente._id.toString() !==
                    context.usuario.id
                ) {
                    throw new Error(
                        'Você não possui permissão'
                    );
                }

            } else if (
                context.usuario.perfil !==
                'admin'
            ) {

                throw new Error(
                    'Usuário sem permissão'
                );

            }


            consulta.status =
                'cancelada';

            consulta.canceladoEm =
                new Date();

            consulta.motivoCancelamento =
                motivoCancelamento || '';


            await paciente.save();


            return consulta;

        }

    },


    /*
    Resolve _id do MongoDB para id do GraphQL.
    */
    Usuario: {

        id: (usuario) =>
            usuario._id.toString()

    },


    Especialidade: {

        id: (especialidade) =>
            especialidade._id.toString()

    },


    Consulta: {

        id: (consulta) =>
            consulta._id.toString(),

        dataHora: (consulta) =>
            consulta.dataHora
                ? consulta.dataHora.toISOString()
                : null,

        canceladoEm: (consulta) =>
            consulta.canceladoEm
                ? consulta.canceladoEm.toISOString()
                : null

    }

};


module.exports = {
    typeDefs,
    resolvers
};