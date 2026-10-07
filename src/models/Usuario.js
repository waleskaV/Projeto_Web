const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
{
    nome: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    senha: {
        type: String,
        required: true
    },

    perfil: {
        type: String,
        enum: [
            'admin',
            'medico',
            'paciente'
        ],
        default: 'paciente'
    },

    paciente: {

        documento: {
            type: String,
            trim: true
        },

        dataNascimento: Date,

        telefone: {
            type: String,
            trim: true
        },

        planoSaude: {
            type: String,
            trim: true
        },

        contatoEmergencia: {
            type: String,
            trim: true
        }
    },

    medico: {

        crm: {
            type: String,
            trim: true
        },

        especialidades: [
            {
                nome: {
                    type: String,
                    trim: true
                },

                descricao: {
                    type: String,
                    trim: true
                }
            }
        ],

        disponibilidades: [
            {
                data: Date,

                horaInicio: String,

                horaFim: String,

                status: {
                    type: String,
                    enum: [
                        'disponivel',
                        'ocupado',
                        'indisponivel'
                    ],
                    default: 'disponivel'
                }
            }
        ]
    },

    consultas: [
        {
            pacienteId: {
                type: String,
                required: true
            },

            medicoId: {
                type: String,
                required: true
            },

            especialidadeId: {
                type: String,
                required: true
            },

            dataHora: {
                type: Date,
                required: true
            },

            status: {
                type: String,
                enum: [
                    'agendada',
                    'confirmada',
                    'cancelada',
                    'concluida'
                ],
                default: 'agendada'
            },

            motivo: {
                type: String,
                default: '',
                trim: true
            },

            criadoPor: {
                type: String
            },

            canceladoEm: {
                type: Date,
                default: null
            },

            motivoCancelamento: {
                type: String,
                default: '',
                trim: true
            }
        }
    ],

    notificacoes: [
        {
            destinatarioId: String,

            consultaId: String,

            tipo: String,

            mensagem: {
                type: String,
                trim: true
            },

            lida: {
                type: Boolean,
                default: false
            },

            criadaEm: {
                type: Date,
                default: Date.now
            }
        }
    ]
},
{
    timestamps: true
}
);

const Usuario =
    mongoose.model(
        'Usuario',
        usuarioSchema
    );

module.exports = Usuario;