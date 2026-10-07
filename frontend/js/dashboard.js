verificarLogin();

const usuario = obterUsuario();

const boasVindas =
    document.getElementById('boasVindas');

const dadosUsuario =
    document.getElementById('dadosUsuario');

const menuUsuarios =
    document.getElementById('menuUsuarios');

const cardUsuarios =
    document.getElementById('cardUsuarios');

const cardCadastrarMedico =
    document.getElementById('cardCadastrarMedico');


if (usuario) {

    boasVindas.textContent =
        `Olá, ${usuario.nome}!`;

    dadosUsuario.textContent =
        `Perfil: ${usuario.perfil}`;

    /*
    Esconde opções administrativas
    para usuários que não são admin.
    */
    if (usuario.perfil !== 'admin') {

        menuUsuarios.classList.add(
            'hidden'
        );

        cardUsuarios.classList.add(
            'hidden'
        );

        if (cardCadastrarMedico) {

            cardCadastrarMedico.classList.add(
                'hidden'
            );

        }

    }

}


function mostrarMinhaConta() {

    const minhaConta =
        document.getElementById(
            'minhaConta'
        );

    const dadosConta =
        document.getElementById(
            'dadosConta'
        );

    dadosConta.innerHTML = `

        <strong>Nome:</strong>
        ${usuario.nome}

        <br><br>

        <strong>E-mail:</strong>
        ${usuario.email}

        <br><br>

        <strong>Perfil:</strong>
        ${usuario.perfil}

    `;

    minhaConta.classList.toggle(
        'hidden'
    );

}