const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
{
    nome: String,
    email: String,
    senha: String,
    perfil: String,

    paciente: {
        documento: String,
        dataNascimento: Date,
        telefone: String,
        planoSaude: String,
        contatoEmergencia: String
    },

    medico: {
        crm: String,

        especialidades: [
            {
                nome: String,
                descricao: String
            }
        ],

        disponibilidades: [
            {
                data: Date,
                horaInicio: String,
                horaFim: String,
                status: String
            }
        ]
    },

    consultas: [
        {
            pacienteId: String,
            medicoId: String,
            especialidadeId: String,
            dataHora: Date,
            status: String,
            motivo: String,
            criadoPor: String,
            canceladoEm: Date,
            motivoCancelamento: String
        }
    ],

    notificacoes: [
        {
            destinatarioId: String,
            consultaId: String,
            tipo: String,
            mensagem: String,
            lida: Boolean,
            criadaEm: Date
        }
    ]
},
{
    timestamps: true
}
);

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;