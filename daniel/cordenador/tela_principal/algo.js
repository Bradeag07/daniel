// Variáveis
let userName = 'Exemplo';
let pendingCount = 99;

// Elementos do DOM
const userNameElement = document.getElementById('userName');
const pendingCountElement = document.getElementById('pendingCount');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualiza os elementos com os valores iniciais
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    if (pendingCountElement) {
        pendingCountElement.textContent = pendingCount;
    }

    // Botões da página principal (main.html)
    const pendingButton = document.getElementById('pendingButton');
    const completedButton = document.getElementById('completedButton');

    if (pendingButton) {
        pendingButton.addEventListener('click', function() {
            // Redireciona para pendentes.html dentro da pasta pendentes
            window.location.href = '../pendentes/pendentes.html';
        });
    }

    if (completedButton) {
        completedButton.addEventListener('click', function() {
            // Redireciona para encerrados.html dentro da pasta encerrados
            window.location.href = '../encerrados/encerrados.html';
        });
    }

    // Botão de Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Volta para a tela principal
            window.location.href = './main.html';
        });
    }
});

// Função para expandir/recolher seções
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const isVisible = section.style.display !== 'none';
        section.style.display = isVisible ? 'none' : 'block';

        // Atualiza o ícone de toggle
        const toggleIcon = document.querySelector(`[onclick="toggleSection('${sectionId}')"] .toggle-icon`);
        if (toggleIcon) {
            toggleIcon.textContent = isVisible ? '▼' : '▲';
        }
    }
}

// Função para buscar dados do usuário (simulação)
function fetchUserData() {
    // Simulação de uma chamada de API
    setTimeout(() => {
        userName = "Usuário Real";
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }, 1000);
}
