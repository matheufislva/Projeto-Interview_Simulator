// POP UP TALITA
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