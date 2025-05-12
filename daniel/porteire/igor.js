document.addEventListener("DOMContentLoaded", function () {
  // Adicionar funcionalidade ao botão de pesquisa
  const searchButton = document.querySelector(".search-button");
  const searchInput = document.querySelector(".search-box input");

  searchButton.addEventListener("click", function () {
    const searchTerm = searchInput.value.toLowerCase();
    searchTable(searchTerm);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const searchTerm = searchInput.value.toLowerCase();
      searchTable(searchTerm);
    }
  });

  // Adicionar funcionalidade ao botão de liberar
  const releaseButton = document.querySelector(".release-button");
  releaseButton.addEventListener("click", function () {
    alert("Liberação realizada com sucesso!");
  });

  // Adicionar funcionalidade ao botão de sair
  const exitButton = document.querySelector(".exit-button");
  exitButton.addEventListener("click", function () {
    if (confirm("Deseja realmente sair?")) {
      alert("Logout realizado com sucesso!");
      // Aqui você poderia redirecionar para a página de login
      // window.location.href = 'login.html';
    }
  });

  // Função para pesquisar na tabela
  function searchTable(searchTerm) {
    const table = document.querySelector(".notice-table");
    const rows = table.querySelectorAll("tbody tr");

    rows.forEach((row) => {
      const textContent = row.textContent.toLowerCase();
      if (textContent.includes(searchTerm)) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });

    if (searchTerm === "") {
      rows.forEach((row) => {
        row.style.display = "";
      });
    }
  }
});
