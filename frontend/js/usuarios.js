verificarLogin();

const usuarioLogado = obterUsuario();

if (
    !usuarioLogado ||
    usuarioLogado.perfil !== 'admin'
) {
    alert(
        'Você não possui permissão para acessar esta página.'
    );

    window.location.href =
        'dashboard.html';
}

const tabelaUsuarios =
    document.getElementById('tabelaUsuarios');

const mensagem =
    document.getElementById('mensagem');

async function carregarUsuarios() {

    try {

        const resposta =
            await requisicaoAutenticada(
                '/usuarios'
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            mensagem.className =
                'mensagem erro';

            mensagem.textContent =
                dados.mensagem ||
                'Erro ao carregar usuários.';

            return;
        }

        tabelaUsuarios.innerHTML = '';

        dados.forEach(usuario => {

            const linha =
                document.createElement('tr');

            linha.innerHTML = `
                <td>${usuario.nome}</td>

                <td>${usuario.email}</td>

                <td>${usuario.perfil}</td>

                <td class="acoes">

                    <button
                        class="btn-danger"
                        onclick="excluirUsuario('${usuario._id}')"
                    >
                        Excluir
                    </button>

                </td>
            `;

            tabelaUsuarios.appendChild(linha);
        });

    } catch (erro) {

        console.error(erro);

        mensagem.className =
            'mensagem erro';

        mensagem.textContent =
            'Erro ao conectar com o servidor.';
    }
}

async function excluirUsuario(id) {

    const confirmar =
        confirm(
            'Tem certeza que deseja excluir este usuário?'
        );

    if (!confirmar) {
        return;
    }

    try {

        const resposta =
            await requisicaoAutenticada(
                `/usuarios/${id}`,
                {
                    method: 'DELETE'
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {

            alert(
                dados.mensagem ||
                'Não foi possível excluir.'
            );

            return;
        }

        alert('Usuário excluído com sucesso.');

        carregarUsuarios();

    } catch (erro) {

        console.error(erro);

        alert(
            'Erro ao conectar com o servidor.'
        );
    }
}

carregarUsuarios();