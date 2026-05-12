//============================================================================================================
//HOME-MATHEUS
//============================================================================================================

//BOTÃO HAMBURGUER
const hamburguer = document.getElementById('hamburguer');
const menuLateral = document.querySelector('.menu-lateral');

hamburguer.addEventListener('click', () => {
  menuLateral.classList.toggle('ativo');
});
// fim do botão hamburguer






//============================================================================================================
// POP UP TALITA 
// ============================================================================================================//

const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modalOverlay = document.getElementById("modalOverlay");

abrirModal.addEventListener("click", () => {
  modalOverlay.classList.add("ativo");
});

fecharModal.addEventListener("click", () => {
  modalOverlay.classList.remove("ativo");
});

modalOverlay.addEventListener("click", (event) => {
  if (event.target === modalOverlay) {
    modalOverlay.classList.remove("ativo");
  }
});

// SUBMIT DO MODAL - redireciona para o chatbot
document.getElementById('formModal').addEventListener('submit', function (e) {
  e.preventDefault(); // impede o envio padrão do formulário

  const vaga = document.getElementById('vaga').value;
  const curriculo = document.getElementById('curriculo').files[0];
  const termos = document.getElementById('termos').checked;

  // Validação básica
  if (!vaga || !curriculo || !termos) return;

  // Salva o link da vaga para usar no chatbot 
  sessionStorage.setItem('vagaLink', vaga);
  sessionStorage.setItem('curriculoNome', curriculo.name);

  // Redireciona para a página do chatbot
  window.location.href = 'chatbot.html'; // ← troque pelo nome real da sua página
});
















