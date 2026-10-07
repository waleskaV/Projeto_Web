const formLogin =
    document.getElementById('formLogin');

const mensagem =
    document.getElementById('mensagem');

formLogin.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const email =
            document.getElementById('email').value;

        const senha =
            document.getElementById('senha').value;

        mensagem.className = 'mensagem';
        mensagem.textContent = '';

        try {

            const resposta = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email,
                        senha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {

                mensagem.className =
                    'mensagem erro';

                mensagem.textContent =
                    dados.mensagem ||
                    'E-mail ou senha incorretos.';

                return;
            }

            localStorage.setItem(
                'token',
                dados.token
            );

            localStorage.setItem(
                'usuario',
                JSON.stringify(dados.usuario)
            );

            mensagem.className =
                'mensagem sucesso';

            mensagem.textContent =
                'Login realizado com sucesso!';

            window.location.href =
                'dashboard.html';

        } catch (erro) {

            console.error(erro);

            mensagem.className =
                'mensagem erro';

            mensagem.textContent =
                'Não foi possível conectar ao servidor.';
        }
    }
);