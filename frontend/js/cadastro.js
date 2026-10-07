const formCadastro =
    document.getElementById('formCadastro');

const mensagem =
    document.getElementById('mensagem');

formCadastro.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const nome =
            document.getElementById('nome').value;

        const email =
            document.getElementById('email').value;

        const senha =
            document.getElementById('senha').value;

        const documento =
            document.getElementById('documento').value;

        const telefone =
            document.getElementById('telefone').value;

        try {

            const resposta = await fetch(
                `${API_URL}/auth/cadastro`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        nome,
                        email,
                        senha,
                        perfil: 'paciente',

                        paciente: {
                            documento,
                            telefone
                        }
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                mensagem.className =
                    'mensagem erro';

                mensagem.textContent =
                    dados.mensagem ||
                    'Erro ao realizar cadastro.';

                return;
            }

            mensagem.className =
                'mensagem sucesso';

            mensagem.textContent =
                'Cadastro realizado com sucesso!';

            formCadastro.reset();

            setTimeout(() => {

                window.location.href =
                    'index.html';

            }, 1200);

        } catch (erro) {

            console.error(erro);

            mensagem.className =
                'mensagem erro';

            mensagem.textContent =
                'Erro ao conectar com o servidor.';
        }
    }
);