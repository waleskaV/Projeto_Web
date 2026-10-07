verificarLogin();

const usuario =
    obterUsuario();

const formMedico =
    document.getElementById(
        'formMedico'
    );

const mensagem =
    document.getElementById(
        'mensagem'
    );


/*
Somente administrador
pode acessar esta página.
*/
if (
    !usuario ||
    usuario.perfil !== 'admin'
) {

    alert(
        'Você não possui permissão para acessar esta página.'
    );

    window.location.href =
        'dashboard.html';
}


/*
Cadastro do médico.
*/
formMedico.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();


        const nome =
            document.getElementById(
                'nome'
            ).value;

        const email =
            document.getElementById(
                'email'
            ).value;

        const senha =
            document.getElementById(
                'senha'
            ).value;

        const crm =
            document.getElementById(
                'crm'
            ).value;

        const especialidade =
            document.getElementById(
                'especialidade'
            ).value;

        const descricao =
            document.getElementById(
                'descricao'
            ).value;


        try {

            const resposta =
                await requisicaoAutenticada(
                    '/usuarios',
                    {
                        method: 'POST',

                        body:
                            JSON.stringify({

                                nome,

                                email,

                                senha,

                                perfil:
                                    'medico',

                                medico: {

                                    crm,

                                    especialidades: [
                                        {
                                            nome:
                                                especialidade,

                                            descricao:
                                                descricao || ''
                                        }
                                    ]
                                }

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
                    'Erro ao cadastrar médico.';

                return;
            }


            mensagem.className =
                'mensagem sucesso';

            mensagem.textContent =
                'Médico cadastrado com sucesso!';


            formMedico.reset();


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