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
