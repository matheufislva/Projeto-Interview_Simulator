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

// Configuração da biblioteca
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

document.getElementById('formModal').addEventListener('submit', async function (e) {
  e.preventDefault();

  const vaga = document.getElementById('vaga').value;
  const arquivo = document.getElementById('curriculo').files[0];
  const termos = document.getElementById('termos').checked;

  if (!vaga || !arquivo || !termos) return;

  // 1. Inicia a leitura do PDF
  const reader = new FileReader();
  reader.onload = async function() {
    const typedarray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedarray).promise;
    let textoExtraido = "";

    // 2. Loop para extrair texto de todas as páginas
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      textoExtraido += content.items.map(item => item.str).join(" ") + " ";
    }

    // 3. Salva os dados processados no sessionStorage
    sessionStorage.setItem('vagaLink', vaga);
    sessionStorage.setItem('curriculo_texto', textoExtraido); // Agora enviamos o TEXTO, não o nome 

    // 4. Redireciona para o chatbot
    window.location.href = 'chatbot.html';
  };

  reader.readAsArrayBuffer(arquivo);
});









