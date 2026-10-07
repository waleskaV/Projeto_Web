const API_URL = 'http://localhost:3000';

function obterToken() {
    return localStorage.getItem('token');
}

function obterUsuario() {
    const usuario = localStorage.getItem('usuario');

    if (!usuario) {
        return null;
    }

    return JSON.parse(usuario);
}

function usuarioEstaLogado() {
    return !!obterToken();
}

function verificarLogin() {
    if (!usuarioEstaLogado()) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    window.location.href = 'index.html';
}

async function requisicaoAutenticada(url, opcoes = {}) {
    const token = obterToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(opcoes.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const resposta = await fetch(`${API_URL}${url}`, {
        ...opcoes,
        headers
    });

    if (resposta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        alert('Sua sessão expirou. Faça login novamente.');

        window.location.href = 'index.html';
    }

    return resposta;
}