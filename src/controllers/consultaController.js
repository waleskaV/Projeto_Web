const Usuario = require('../models/Usuario');


/*
Criar nova consulta
Somente paciente.
*/
const criarConsulta = async (req, res) => {

    try {

        const {
            medicoId,
            especialidadeId,
            dataHora,
            motivo
        } = req.body;


        if (
            !medicoId ||
            !especialidadeId ||
            !dataHora
        ) {

            return res.status(400).json({
                mensagem:
                    'Médico, especialidade e data/hora são obrigatórios.'
            });

        }


        const pacienteId =
            req.usuario.id;


        const paciente =
            await Usuario.findById(
                pacienteId
            );


        if (!paciente) {

            return res.status(404).json({
                mensagem:
                    'Paciente não encontrado.'
            });

        }


        if (
            paciente.perfil !==
            'paciente'
        ) {

            return res.status(403).json({
                mensagem:
                    'Somente pacientes podem agendar consultas.'
            });

        }


        const medico =
            await Usuario.findById(
                medicoId
            );


        if (!medico) {

            return res.status(404).json({
                mensagem:
                    'Médico não encontrado.'
            });

        }


        if (
            medico.perfil !==
            'medico'
        ) {

            return res.status(400).json({
                mensagem:
                    'O usuário informado não é médico.'
            });

        }


        /*
        Verifica se a especialidade
        pertence ao médico selecionado.
        */
        const especialidadeExiste =
            medico.medico.especialidades.some(
                especialidade =>
                    especialidade._id.toString() ===
                    especialidadeId.toString()
            );


        if (!especialidadeExiste) {

            return res.status(400).json({
                mensagem:
                    'A especialidade selecionada não pertence ao médico.'
            });

        }


        const novaConsulta = {

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
        };


        paciente.consultas.push(
            novaConsulta
        );


        await paciente.save();


        const consultaCriada =
            paciente.consultas[
                paciente.consultas.length - 1
            ];


        return res.status(201).json({

            mensagem:
                'Consulta agendada com sucesso.',

            consulta:
                consultaCriada

        });


    } catch (error) {

        console.error(
            'Erro ao criar consulta:',
            error
        );


        return res.status(500).json({
            mensagem:
                'Erro interno ao criar consulta.',
            erro:
                error.message
        });

    }

};



/*
Listar consultas
Paciente: próprias
Médico: destinadas a ele
Admin: todas
*/
const listarConsultas = async (req, res) => {

    try {

        const usuarioLogado =
            req.usuario;


        if (
            usuarioLogado.perfil ===
            'paciente'
        ) {

            const paciente =
                await Usuario.findById(
                    usuarioLogado.id
                );


            if (!paciente) {

                return res.status(404).json({
                    mensagem:
                        'Paciente não encontrado.'
                });

            }


            return res.status(200).json(
                paciente.consultas || []
            );

        }


        if (
            usuarioLogado.perfil ===
            'medico'
        ) {

            const pacientes =
                await Usuario.find({
                    perfil: 'paciente',
                    'consultas.medicoId':
                        usuarioLogado.id
                });


            const consultas = [];


            pacientes.forEach(
                paciente => {

                    paciente.consultas.forEach(
                        consulta => {

                            if (
                                consulta.medicoId ===
                                usuarioLogado.id
                            ) {

                                consultas.push({

                                    ...consulta.toObject(),

                                    pacienteNome:
                                        paciente.nome

                                });

                            }

                        }
                    );

                }
            );


            return res.status(200).json(
                consultas
            );

        }


        if (
            usuarioLogado.perfil ===
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

                            consultas.push({

                                ...consulta.toObject(),

                                pacienteNome:
                                    paciente.nome

                            });

                        }
                    );

                }
            );


            return res.status(200).json(
                consultas
            );

        }


        return res.status(403).json({
            mensagem:
                'Perfil sem permissão.'
        });


    } catch (error) {

        console.error(
            'Erro ao listar consultas:',
            error
        );


        return res.status(500).json({
            mensagem:
                'Erro interno ao listar consultas.',
            erro:
                error.message
        });

    }

};



/*
Buscar consulta por ID
*/
const buscarConsultaPorId = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const usuario =
            await Usuario.findOne({
                'consultas._id': id
            });


        if (!usuario) {

            return res.status(404).json({
                mensagem:
                    'Consulta não encontrada.'
            });

        }


        const consulta =
            usuario.consultas.id(id);


        if (
            req.usuario.perfil ===
            'paciente' &&
            usuario._id.toString() !==
            req.usuario.id
        ) {

            return res.status(403).json({
                mensagem:
                    'Você não possui permissão para visualizar esta consulta.'
            });

        }


        if (
            req.usuario.perfil ===
            'medico' &&
            consulta.medicoId !==
            req.usuario.id
        ) {

            return res.status(403).json({
                mensagem:
                    'Você não possui permissão para visualizar esta consulta.'
            });

        }


        return res.status(200).json(
            consulta
        );


    } catch (error) {

        console.error(
            'Erro ao buscar consulta:',
            error
        );


        return res.status(500).json({
            mensagem:
                'Erro interno ao buscar consulta.',
            erro:
                error.message
        });

    }

};



/*
Atualizar consulta
Paciente: cancelar
Médico: confirmar, concluir, cancelar
Admin: alterar
*/
const atualizarConsulta = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const {
            status,
            dataHora,
            motivo,
            motivoCancelamento
        } = req.body;


        const usuario =
            await Usuario.findOne({
                'consultas._id': id
            });


        if (!usuario) {

            return res.status(404).json({
                mensagem:
                    'Consulta não encontrada.'
            });

        }


        const consulta =
            usuario.consultas.id(id);


        if (
            req.usuario.perfil ===
            'paciente'
        ) {

            if (
                usuario._id.toString() !==
                req.usuario.id
            ) {

                return res.status(403).json({
                    mensagem:
                        'Você não possui permissão.'
                });

            }


            if (
                status !==
                'cancelada'
            ) {

                return res.status(403).json({
                    mensagem:
                        'Paciente pode apenas cancelar a consulta.'
                });

            }


            consulta.status =
                'cancelada';

            consulta.canceladoEm =
                new Date();

            consulta.motivoCancelamento =
                motivoCancelamento || '';

        }


        else if (
            req.usuario.perfil ===
            'medico'
        ) {

            if (
                consulta.medicoId !==
                req.usuario.id
            ) {

                return res.status(403).json({
                    mensagem:
                        'Você não possui permissão.'
                });

            }


            const statusPermitidos = [
                'confirmada',
                'concluida',
                'cancelada'
            ];


            if (
                !status ||
                !statusPermitidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        'Status inválido para médico.'
                });

            }


            consulta.status =
                status;


            if (
                status ===
                'cancelada'
            ) {

                consulta.canceladoEm =
                    new Date();

                consulta.motivoCancelamento =
                    motivoCancelamento || '';

            }

        }


        else if (
            req.usuario.perfil ===
            'admin'
        ) {

            const statusPermitidos = [
                'agendada',
                'confirmada',
                'cancelada',
                'concluida'
            ];


            if (
                status &&
                !statusPermitidos.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    mensagem:
                        'Status inválido.'
                });

            }


            if (status) {

                consulta.status =
                    status;

            }


            if (dataHora) {

                consulta.dataHora =
                    new Date(dataHora);

            }


            if (
                motivo !== undefined
            ) {

                consulta.motivo =
                    motivo;

            }


            if (
                status ===
                'cancelada'
            ) {

                consulta.canceladoEm =
                    new Date();

                consulta.motivoCancelamento =
                    motivoCancelamento || '';

            }

        }


        else {

            return res.status(403).json({
                mensagem:
                    'Perfil sem permissão.'
            });

        }


        await usuario.save();


        return res.status(200).json({

            mensagem:
                'Consulta atualizada com sucesso.',

            consulta

        });


    } catch (error) {

        console.error(
            'Erro ao atualizar consulta:',
            error
        );


        return res.status(500).json({
            mensagem:
                'Erro interno ao atualizar consulta.',
            erro:
                error.message
        });

    }

};



/*
Excluir consulta
Somente admin
*/
const excluirConsulta = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const usuario =
            await Usuario.findOne({
                'consultas._id': id
            });


        if (!usuario) {

            return res.status(404).json({
                mensagem:
                    'Consulta não encontrada.'
            });

        }


        usuario.consultas.pull({
            _id: id
        });


        await usuario.save();


        return res.status(200).json({
            mensagem:
                'Consulta excluída com sucesso.'
        });


    } catch (error) {

        console.error(
            'Erro ao excluir consulta:',
            error
        );


        return res.status(500).json({
            mensagem:
                'Erro interno ao excluir consulta.',
            erro:
                error.message
        });

    }

};



module.exports = {
    criarConsulta,
    listarConsultas,
    buscarConsultaPorId,
    atualizarConsulta,
    excluirConsulta
};