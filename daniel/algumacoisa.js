// =====================================================
// Dados de exemplo para encaminhamentos e FIAP
// =====================================================
const encaminhamentosData = [
  { aluno: "João Silva", turma: "Técnico em Informática", status: "Encerrado" },
  { aluno: "Maria Santos", turma: "Mecatrônica", status: "Encerrado" },
  { aluno: "Pedro Oliveira", turma: "Eletrotécnica", status: "Em aguardo" },
  { aluno: "Ana Luiza", turma: "Logística", status: "Encerrado" },
];

const fiapData = [
  {
    aluno: "Carlos Eduardo",
    turma: "Automação Industrial",
    status: "Encerrado",
  },
  {
    aluno: "Fernanda Lima",
    turma: "Desenvolvimento de Sistemas",
    status: "Encerrado",
  },
  { aluno: "Gabriel Costa", turma: "Mecânica", status: "Em aguardo" },
  { aluno: "Juliana Mendes", turma: "Edificações", status: "Encerrado" },
];

// =====================================================
// Verificação da página atual e inicialização de funções
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  // Detectar qual página está carregada
  const currentPage = window.location.pathname.split("/").pop();

  // Iniciar funções específicas para cada página
  switch (currentPage) {
    case "index.html":
      initIndexPage();
      break;
    case "login.html":
      initLoginPage();
      break;
    case "register.html":
      initRegisterPage();
      break;
    case "dashboard.html":
      initDashboardPage();
      break;
    case "pendentes.html":
      initPendentesPage();
      break;
    case "encerrados.html":
      initEncerradosPage();
      break;
  }
});

// =====================================================
// Página Index - Redirecionamento se estiver logado
// =====================================================
function initIndexPage() {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    // Se já estiver logado, redireciona para o dashboard
    window.location.href = "dashboard.html";
  }
}

// =====================================================
// Página de Login
// =====================================================
function initLoginPage() {
  // Verificar se o usuário já está logado
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    window.location.href = "dashboard.html";
    return;
  }

  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("error-message");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Buscar usuários registrados no localStorage
      const storedUsers =
        JSON.parse(localStorage.getItem("registeredUsers")) || [];
      const user = storedUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Login bem-sucedido
        const userData = {
          id: user.id,
          name: user.name,
          email: user.email,
        };

        // Armazenar dados do usuário logado
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirecionar para o dashboard
        window.location.href = "dashboard.html";
      } else {
        // Mostrar mensagem de erro
        errorMessage.textContent =
          "Opa, parece que você errou seu email ou senha.";
        errorMessage.style.display = "block";
      }
    });
  }
}

// =====================================================
// Página de Registro
// =====================================================
function initRegisterPage() {
  const registerForm = document.getElementById("registerForm");
  const errorMessage = document.getElementById("error-message");
  const successMessage = document.getElementById("success-message");

  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Resetar mensagens
      errorMessage.style.display = "none";
      successMessage.style.display = "none";

      // Verificar se as senhas coincidem
      if (password !== confirmPassword) {
        errorMessage.textContent = "Senhas incompatíveis";
        errorMessage.style.display = "block";
        return;
      }

      // Verificar se o email já está cadastrado
      const storedUsers =
        JSON.parse(localStorage.getItem("registeredUsers")) || [];
      if (storedUsers.some((user) => user.email === email)) {
        errorMessage.textContent = "Este email já está cadastrado.";
        errorMessage.style.display = "block";
        return;
      }

      // Criar um novo usuário
      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        registerDate: new Date().toLocaleDateString(),
      };

      // Adicionar o novo usuário à lista
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));

      // Mostrar mensagem de sucesso
      successMessage.style.display = "block";

      // Limpar formulário
      registerForm.reset();

      // Redirecionar para login após 2 segundos
      setTimeout(function () {
        window.location.href = "login.html";
      }, 2000);
    });
  }
}

// =====================================================
// Página de Dashboard (se existir)
// =====================================================
function initDashboardPage() {
  // Verificar autenticação
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Atualizar nome do usuário se o elemento existir
  const userNameElement = document.getElementById("userName");
  if (userNameElement) {
    userNameElement.textContent = user.name;
  }

  // Adicionar evento de logout se o botão existir
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    });
  }
}

// =====================================================
// Página de Pendentes
// =====================================================
function initPendentesPage() {
  // Verificar autenticação
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Atualizar nome do usuário
  document.getElementById("userName").textContent = user.name;

  // Carregar dados
  loadPendentesData();

  // Event listeners
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  document
    .getElementById("search-encaminhamento-pendentes")
    .addEventListener("input", function (e) {
      filterPendentesData("encaminhamentos", e.target.value);
    });

  document
    .getElementById("search-fiap-pendentes")
    .addEventListener("input", function (e) {
      filterPendentesData("fiap", e.target.value);
    });
}

function loadPendentesData() {
  // Filtrar apenas itens pendentes (Em aguardo)
  const pendingEncaminhamentos = encaminhamentosData.filter(
    (item) => item.status === "Em aguardo"
  );
  const pendingFiap = fiapData.filter((item) => item.status === "Em aguardo");

  // Preencher conteúdo
  renderPendentesItems(
    pendingEncaminhamentos,
    "encaminhamentos-pendentes-content",
    "encaminhamentos"
  );
  renderPendentesItems(pendingFiap, "fiap-pendentes-content", "fiap");

  // Esconder loading e mostrar conteúdo
  document.getElementById("loading").style.display = "none";
  document.getElementById("dataContent").style.display = "block";
}

function renderPendentesItems(data, containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML =
      '<p class="no-data-message">Não há ' +
      (type === "encaminhamentos" ? "encaminhamentos" : "FIAPs") +
      " pendentes.</p>";
    return;
  }

  data.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "item";

    itemElement.innerHTML = `
          <div class="item-info">
              <div class="item-aluno">${item.aluno}</div>
              <div class="item-turma">${item.turma}</div>
          </div>
          <div class="item-status ${
            item.status === "Em aguardo" ? "aguardo" : "encerrado"
          }">${item.status}</div>
      `;

    // Adicionar evento de clique ao status
    const statusElement = itemElement.querySelector(".item-status");
    statusElement.addEventListener("click", function () {
      toggleItemStatus(item, type);
      // Remover o item da lista quando não estiver mais pendente
      if (item.status !== "Em aguardo") {
        itemElement.remove();

        // Verificar se há itens restantes
        if (container.children.length === 0) {
          container.innerHTML =
            '<p class="no-data-message">Não há ' +
            (type === "encaminhamentos" ? "encaminhamentos" : "FIAPs") +
            " pendentes.</p>";
        }
      }
    });

    container.appendChild(itemElement);
  });
}

function filterPendentesData(type, searchTerm) {
  searchTerm = searchTerm.toLowerCase();

  if (type === "encaminhamentos") {
    const filteredData = encaminhamentosData.filter(
      (item) =>
        item.status === "Em aguardo" &&
        (item.aluno.toLowerCase().includes(searchTerm) ||
          item.turma.toLowerCase().includes(searchTerm))
    );
    renderPendentesItems(
      filteredData,
      "encaminhamentos-pendentes-content",
      "encaminhamentos"
    );
  } else {
    const filteredData = fiapData.filter(
      (item) =>
        item.status === "Em aguardo" &&
        (item.aluno.toLowerCase().includes(searchTerm) ||
          item.turma.toLowerCase().includes(searchTerm))
    );
    renderPendentesItems(filteredData, "fiap-pendentes-content", "fiap");
  }
}

// =====================================================
// Página de Encerrados
// =====================================================
function initEncerradosPage() {
  // Verificar autenticação
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Atualizar nome do usuário
  document.getElementById("userName").textContent = user.name;

  // Carregar dados
  loadEncerradosData();

  // Event listeners
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  document
    .getElementById("search-encaminhamento")
    .addEventListener("input", function (e) {
      filterEncerradosData("encaminhamentos", e.target.value);
    });

  document
    .getElementById("search-fiap")
    .addEventListener("input", function (e) {
      filterEncerradosData("fiap", e.target.value);
    });
}

function loadEncerradosData() {
  // Filtrar apenas itens encerrados
  const encerradosEncaminhamentos = encaminhamentosData.filter(
    (item) => item.status === "Encerrado"
  );
  const encerradosFiap = fiapData.filter((item) => item.status === "Encerrado");

  // Preencher conteúdo
  renderEncerradosItems(
    encerradosEncaminhamentos,
    "encaminhamentos-content",
    "encaminhamentos"
  );
  renderEncerradosItems(encerradosFiap, "fiap-content", "fiap");

  // Esconder loading e mostrar conteúdo
  document.getElementById("loading").style.display = "none";
  document.getElementById("dataContent").style.display = "block";
}

function renderEncerradosItems(data, containerId, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML =
      '<p class="no-data-message">Não há ' +
      (type === "encaminhamentos" ? "encaminhamentos" : "FIAPs") +
      " encerrados.</p>";
    return;
  }

  data.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "item";

    itemElement.innerHTML = `
          <div class="item-info">
              <div class="item-aluno">${item.aluno}</div>
              <div class="item-turma">${item.turma}</div>
          </div>
          <div class="item-status ${
            item.status === "Em aguardo" ? "aguardo" : "encerrado"
          }">${item.status}</div>
      `;

    // Adicionar evento de clique ao status
    const statusElement = itemElement.querySelector(".item-status");
    statusElement.addEventListener("click", function () {
      toggleItemStatus(item, type);
      // Remover o item da lista quando não estiver mais encerrado
      if (item.status !== "Encerrado") {
        itemElement.remove();

        // Verificar se há itens restantes
        if (container.children.length === 0) {
          container.innerHTML =
            '<p class="no-data-message">Não há ' +
            (type === "encaminhamentos" ? "encaminhamentos" : "FIAPs") +
            " encerrados.</p>";
        }
      }
    });

    container.appendChild(itemElement);
  });
}

function filterEncerradosData(type, searchTerm) {
  searchTerm = searchTerm.toLowerCase();

  if (type === "encaminhamentos") {
    const filteredData = encaminhamentosData.filter(
      (item) =>
        item.status === "Encerrado" &&
        (item.aluno.toLowerCase().includes(searchTerm) ||
          item.turma.toLowerCase().includes(searchTerm))
    );
    renderEncerradosItems(
      filteredData,
      "encaminhamentos-content",
      "encaminhamentos"
    );
  } else {
    const filteredData = fiapData.filter(
      (item) =>
        item.status === "Encerrado" &&
        (item.aluno.toLowerCase().includes(searchTerm) ||
          item.turma.toLowerCase().includes(searchTerm))
    );
    renderEncerradosItems(filteredData, "fiap-content", "fiap");
  }
}

// Função compartilhada para alternar o status dos itens
function toggleItemStatus(item, type) {
  // Alternar status
  item.status = item.status === "Em aguardo" ? "Encerrado" : "Em aguardo";

  // Atualizar dados originais
  if (item.status === "Encerrado") {
    // Recarregar a página para atualizar os dados
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
}

// Função para alternar a exibição das seções
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.toggle("collapsed");

    // Atualizar o ícone toggle
    const button = document.querySelector(
      `button[onclick="toggleSection('${sectionId}')"]`
    );
    if (button) {
      const icon = button.querySelector(".toggle-icon");
      if (icon) {
        icon.textContent = section.classList.contains("collapsed") ? "▶" : "▼";
      }
    }
  }
}
