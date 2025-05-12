// Variáveis
let userName = 'Exemplo';
let pendingCount = 99;

// Elementos do DOM
const userNameElement = document.getElementById('userName');
const pendingCountElement = document.getElementById('pendingCount');
const pendingButton = document.getElementById('pendingButton');
const completedButton = document.getElementById('completedButton');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualiza os elementos com os valores iniciais
    userNameElement.textContent = userName;
    pendingCountElement.textContent = pendingCount;
    
    // Simulação de obter o nome do usuário
    // Em uma implementação real, isso viria da autenticação/API
    // fetchUserData();
    
    // Adiciona event listeners aos botões
    pendingButton.addEventListener('click', navigateToPending);
    completedButton.addEventListener('click', navigateToCompleted);
});

// Funções
function navigateToPending() {
    // Navegação para a página de pendentes
    console.log("Navegando para a página de pendentes");
    // Implementação real usaria navegação
    // window.location.href = '/pendentes';
}

function navigateToCompleted() {
    // Navegação para a página de encerrados
    console.log("Navegando para a página de encerrados");
    // window.location.href = '/encerrados';
}

// Função para buscar dados do usuário (simulação)
function fetchUserData() {
    // Simulação de uma chamada de API
    setTimeout(() => {
        userName = "Usuário Real";
        userNameElement.textContent = userName;
    }, 1000);
}
