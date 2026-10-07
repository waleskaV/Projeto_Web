verificarLogin();

const usuario =
    obterUsuario();

const menuUsuarios =
    document.getElementById('menuUsuarios');

const cardAgendamento =
    document.getElementById('cardAgendamento');

const formConsulta =
    document.getElementById('formConsulta');

const listaConsultas =
    document.getElementById('listaConsultas');

const mensagem =
    document.getElementById('mensagem');

const selectMedico =
    document.getElementById('medicoId');

const selectEspecialidade =
    document.getElementById('especialidadeId');


if (usuario.perfil !== 'admin') {
    menuUsuarios.classList.add('hidden');
}


/*
Formulário de agendamento
somente para pacientes.
*/
if (usuario.perfil !== 'paciente') {
    cardAgendamento.classList.add('hidden');
}


/*
Carregar médicos cadastrados.
*/
async function carregarMedicos() {

    try {

        const resposta =
            await requisicaoAutenticada(
                '/medicos'
            );

        const medicos =
            await resposta.json();

        if (!resposta.ok) {

            console.error(
                medicos.mensagem ||
                'Erro ao carregar médicos.'
            );

            return;
        }

        selectMedico.innerHTML = `
            <option value="">
                Selecione um médico
            </option>
        `;

        medicos.forEach(
            medico => {

                const option =
                    document.createElement(
                        'option'
                    );

                /*
                O paciente vê o nome,
                mas o sistema guarda o ID.
                */
                option.value =
                    medico._id;

                option.textContent =
                    medico.nome;

                /*
                Guardamos as especialidades
                do médico dentro da option.
                */
                option.dataset.especialidades =
                    JSON.stringify(
                        medico.medico
                            ?.especialidades || []
                    );

                selectMedico.appendChild(
                    option
                );

            }
        );

    } catch (erro) {

        console.error(
            'Erro ao carregar médicos:',
            erro
        );

    }

}


/*
Quando o paciente selecionar um médico,
carregar apenas as especialidades dele.
*/
selectMedico.addEventListener(
    'change',
    function () {

        selectEspecialidade.innerHTML = `
            <option value="">
                Selecione uma especialidade
            </option>
        `;

        if (!this.value) {

            selectEspecialidade.innerHTML = `
                <option value="">
                    Selecione primeiro um médico
                </option>
            `;

            return;
        }

        const optionSelecionada =
            this.options[
                this.selectedIndex
            ];

        const especialidades =
            JSON.parse(
                optionSelecionada
                    .dataset
                    .especialidades || '[]'
            );

        if (
            especialidades.length === 0
        ) {

            selectEspecialidade.innerHTML = `
                <option value="">
                    Médico sem especialidades cadastradas
                </option>
            `;

            return;
        }

        especialidades.forEach(
            especialidade => {

                const option =
                    document.createElement(
                        'option'
                    );

                /*
                Enviamos o ID da especialidade.
                */
                option.value =
                    especialidade._id;

                /*
                O paciente vê apenas o nome.
                */
                option.textContent =
                    especialidade.nome;

                selectEspecialidade
                    .appendChild(
                        option
                    );

            }
        );

    }
);


/*
Carregar consultas.
*/
async function carregarConsultas() {

    try {

        const resposta =
            await requisicaoAutenticada(
                '/consultas'
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            listaConsultas.innerHTML =
                '<p>Não foi possível carregar as consultas.</p>';

            return;
        }


        /*
        Compatibilidade com dois tipos
        de resposta do backend:

        1) Array direto
        2) { consultas: [...] }
        */
        const consultas =
            Array.isArray(dados)
                ? dados
                : dados.consultas || [];


        if (
            consultas.length === 0
        ) {

            listaConsultas.innerHTML =
                '<p>Nenhuma consulta encontrada.</p>';

            return;
        }


        listaConsultas.innerHTML =
            '';


        consultas.forEach(
            consulta => {

                const card =
                    document.createElement(
                        'div'
                    );

                card.className =
                    'card consulta';


                const data =
                    new Date(
                        consulta.dataHora
                    ).toLocaleString(
                        'pt-BR'
                    );


                /*
                Se o backend já retornar
                nome do médico, usamos.
                Caso contrário, mostramos ID.
                */
                const nomeMedico =
                    consulta.medico?.nome ||
                    consulta.medicoNome ||
                    consulta.medicoId ||
                    '-';


                const especialidade =
                    consulta.especialidade ||
                    consulta.especialidadeNome ||
                    consulta.especialidadeId ||
                    '-';


                card.innerHTML = `

                    <p>
                        <strong>Médico:</strong>
                        ${nomeMedico}
                    </p>

                    <p>
                        <strong>Especialidade:</strong>
                        ${especialidade}
                    </p>

                    <p>
                        <strong>Data:</strong>
                        ${data}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${consulta.status}
                    </p>

                    <p>
                        <strong>Motivo:</strong>
                        ${consulta.motivo || '-'}
                    </p>

                    ${
                        consulta.status ===
                        'agendada'
                        &&
                        usuario.perfil ===
                        'paciente'
                        ?
                        `
                        <button
                            class="btn-danger"
                            onclick="cancelarConsulta(
                                '${consulta._id || consulta.id}'
                            )"
                        >
                            Cancelar
                        </button>
                        `
                        :
                        ''
                    }

                `;

                listaConsultas
                    .appendChild(
                        card
                    );

            }
        );

    } catch (erro) {

        console.error(
            erro
        );

        listaConsultas.innerHTML =
            '<p>Erro ao conectar com o servidor.</p>';

    }

}


/*
Cadastrar consulta.
*/
if (formConsulta) {

    formConsulta.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const medicoId =
                selectMedico.value;


            const especialidadeId =
                selectEspecialidade.value;


            const dataHora =
                document.getElementById(
                    'dataHora'
                ).value;


            const motivo =
                document.getElementById(
                    'motivo'
                ).value;


            if (
                !medicoId ||
                !especialidadeId ||
                !dataHora
            ) {

                mensagem.className =
                    'mensagem erro';

                mensagem.textContent =
                    'Selecione médico, especialidade e data.';

                return;
            }


            try {

                const resposta =
                    await requisicaoAutenticada(
                        '/consultas',
                        {

                            method:
                                'POST',

                            body:
                                JSON.stringify({

                                    medicoId,

                                    especialidadeId,

                                    dataHora,

                                    motivo

                                })

                        }
                    );


                const dados =
                    await resposta.json();


                if (
                    !resposta.ok
                ) {

                    mensagem.className =
                        'mensagem erro';

                    mensagem.textContent =
                        dados.mensagem ||
                        'Erro ao agendar consulta.';

                    return;
                }


                mensagem.className =
                    'mensagem sucesso';


                mensagem.textContent =
                    'Consulta agendada com sucesso!';


                formConsulta.reset();


                /*
                Depois do reset,
                voltamos a especialidade
                para o estado inicial.
                */
                selectEspecialidade.innerHTML = `
                    <option value="">
                        Selecione primeiro um médico
                    </option>
                `;


                carregarConsultas();


            } catch (erro) {

                console.error(
                    erro
                );


                mensagem.className =
                    'mensagem erro';


                mensagem.textContent =
                    'Erro ao conectar com o servidor.';

            }

        }
    );

}


/*
Cancelar consulta.
*/
async function cancelarConsulta(
    id
) {

    const confirmar =
        confirm(
            'Deseja realmente cancelar essa consulta?'
        );


    if (!confirmar) {
        return;
    }


    const motivoCancelamento =
        prompt(
            'Informe o motivo do cancelamento:'
        );


    try {

        const resposta =
            await requisicaoAutenticada(
                `/consultas/${id}`,
                {

                    method:
                        'PUT',

                    body:
                        JSON.stringify({

                            status:
                                'cancelada',

                            motivoCancelamento:
                                motivoCancelamento || ''

                        })

                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok
        ) {

            alert(
                dados.mensagem ||
                'Não foi possível cancelar.'
            );

            return;
        }


        alert(
            'Consulta cancelada com sucesso.'
        );


        carregarConsultas();


    } catch (erro) {

        console.error(
            erro
        );


        alert(
            'Erro ao conectar com o servidor.'
        );

    }

}


/*
Inicialização da página.
*/
if (
    usuario.perfil ===
    'paciente'
) {

    carregarMedicos();

}


carregarConsultas();