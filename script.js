//============================================================================================================
//HOME-MATHEUS - SCRIPT CORRIGIDO
//============================================================================================================

//BOTÃO HAMBURGUER
const hamburguer = document.getElementById('hamburguer');
const menuLateral = document.querySelector('.menu-lateral');

if (hamburguer && menuLateral) {
  hamburguer.addEventListener('click', () => {
    menuLateral.classList.toggle('ativo');
  });
}
// fim do botão hamburguer



//============================================================================================================
// MODAL TALITA - POP UP PARA VAGA + CURRÍCULO
// ============================================================================================================

const abrirModal = document.getElementById("abrirModal");
const fecharModal = document.getElementById("fecharModal");
const modalOverlay = document.getElementById("modalOverlay");

if (abrirModal) {
  abrirModal.addEventListener("click", () => {
    modalOverlay.classList.add("ativo");
  });
}

if (fecharModal) {
  fecharModal.addEventListener("click", () => {
    modalOverlay.classList.remove("ativo");
  });
}

if (modalOverlay) {
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove("ativo");
    }
  });
}

// Configuração da biblioteca PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Envio do formulário do modal
if (document.getElementById('formModal')) {
  document.getElementById('formModal').addEventListener('submit', async function (e) {
    e.preventDefault();

    const vaga = document.getElementById('vaga').value.trim();
    const arquivo = document.getElementById('curriculo').files[0];
    const termos = document.getElementById('termos').checked;

    if (!vaga || !arquivo || !termos) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Mostrar feedback visual
    const btn = this.querySelector('button[type="submit"]');
    const btnOriginal = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processando...';

    // 1. Inicia a leitura do arquivo (PDF ou DOCX)
    const reader = new FileReader();
    reader.onload = async function() {
      let textoExtraido = "";

      // Detectar tipo de arquivo
      const tipoArquivo = arquivo.type;

      if (tipoArquivo === 'application/pdf') {
        // Processar PDF
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            textoExtraido += content.items.map(item => item.str).join(" ") + " ";
          }
        } catch (err) {
          console.error('Erro ao processar PDF:', err);
          textoExtraido = "[Erro ao processar PDF]";
        }
      } else if (tipoArquivo === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Processar DOCX (simplificado - apenas extrai texto básico)
        textoExtraido = "[Arquivo DOCX carregado - " + arquivo.name + "]";
      } else {
        textoExtraido = "[Arquivo carregado - " + arquivo.name + "]";
      }

      // 2. Salva os dados processados no sessionStorage
      sessionStorage.setItem('vagaLink', vaga);
      sessionStorage.setItem('curriculo_texto', textoExtraido);
      sessionStorage.setItem('curriculo_nome', arquivo.name);

      // 3. Redireciona para o chatbot
      window.location.href = 'chatbot.html';
    };

    reader.onerror = function() {
      btn.disabled = false;
      btn.textContent = btnOriginal;
      alert('Erro ao ler o arquivo. Tente novamente.');
    };

    reader.readAsArrayBuffer(arquivo);
  });
}




//============================================================================================================
// CARROSSEL HERO
//============================================================================================================
(function () {
  var cur = 0, pct = 0, total = 3, dur = 5500, step = 60;
  var labels = ['01', '02', '03'];
 
  function hcGo(n) {
    var slides = document.querySelectorAll('.hc-slide');
    var dots   = document.querySelectorAll('.hc-dot');
    
    if (slides.length === 0) return; // Se não existe carrossel, sai
    
    slides[cur].setAttribute('aria-hidden', 'true');
    dots[cur].classList.remove('active');
    dots[cur].setAttribute('aria-selected', 'false');
    
    cur = (n + total) % total;
    
    slides[cur].setAttribute('aria-hidden', 'false');
    dots[cur].classList.add('active');
    dots[cur].setAttribute('aria-selected', 'true');
    
    document.getElementById('hcTrack').style.transform = 'translateX(-' + (cur * 100) + '%)';
    document.getElementById('hcCur').textContent = labels[cur];
    
    pct = 0;
    var fill = document.getElementById('hcFill');
    fill.style.transition = 'none';
    fill.style.width = '0%';
    
    setTimeout(function () { 
      fill.style.transition = 'width 0.06s linear';
    }, 20);
  }
 
  window.hcGo = hcGo;
 
  // Intervalo do carrossel
  var carrosselInterval = setInterval(function () {
    var fill = document.getElementById('hcFill');
    if (!fill) {
      clearInterval(carrosselInterval);
      return;
    }
    
    pct += (step / dur) * 100;
    fill.style.width = Math.min(pct, 100) + '%';
    if (pct >= 100) hcGo(cur + 1);
  }, step);
})();


//============================================================================================================
// CHATBOT — Seleção de modo (Voz ou Chat) no chatbot.html
//============================================================================================================

(function() {
  // Este código roda APENAS se estamos no chatbot.html
  const $telaSelecao = document.getElementById('tela-selecao');
  
  if (!$telaSelecao) {
    // Não estamos no chatbot.html, sair
    return;
  }

  // Exposição global para onclick dos botões no HTML
  window.selecionarModo = function(modo) {
    console.log('[Chatbot] Modo selecionado:', modo);
    
    const $selecao  = document.getElementById('tela-selecao');
    const $loading  = document.getElementById('tela-loading');
    const $chatArea = document.getElementById('chat-area');

    if (!$selecao || !$loading) return;

    // Salvar modo no sessionStorage
    sessionStorage.setItem('modo_simulacao', modo);

    // Esconder seleção, mostrar loading
    $selecao.style.display = 'none';
    $loading.style.display = 'flex';

    const $loadTxt = document.getElementById('loading-txt');
    if ($loadTxt) {
      $loadTxt.textContent = modo === 'voz' 
        ? 'Preparando entrevista por voz...' 
        : 'Analisando sua vaga e currículo...';
    }

    // Se for voz, iniciar reconhecimento
    if (modo === 'voz') {
      iniciarReconhecimento();
    }

    // Após 2 segundos, mostrar interface
    setTimeout(function() {
      $loading.style.display = 'none';
      if ($chatArea) $chatArea.style.display = 'flex';

      const $chatIn = document.getElementById('chat-input-area');
      const $vozIn  = document.getElementById('voz-input-area');

      if (modo === 'chat') {
        if ($chatIn) $chatIn.style.display = 'block';
        if ($vozIn)  $vozIn.style.display  = 'none';
      } else {
        if ($chatIn) $chatIn.style.display = 'none';
        if ($vozIn)  $vozIn.style.display  = 'block';
      }

      const $hStatus = document.getElementById('header-status');
      if ($hStatus) $hStatus.textContent = 'Simulação em andamento';

      iniciarEntrevista();
    }, 1800);
  };

  window.toggleVoz = function() {
    const $vozBtn = document.getElementById('voz-btn');
    if ($vozBtn && $vozBtn.disabled) return;
    
    // Limpar transcrição anterior
    const $vozTrans = document.getElementById('voz-transcricao');
    if ($vozTrans) $vozTrans.textContent = '';
    
    state.voiceTranscricao = '';
    
    if (state.recognition) {
      state.recognition.start();
    }
  };

  // ============================================================
  // ESTADO GLOBAL
  // ============================================================
  const state = {
    modo: sessionStorage.getItem('modo_simulacao') || null,
    vagaLink: sessionStorage.getItem('vagaLink') || '',
    curriculoTexto: sessionStorage.getItem('curriculo_texto') || '',
    historico: [],
    perguntaAtual: 0,
    totalPerguntas: 6,
    respostas: [],
    aguardando: false,
    finalizado: false,
    recognition: null,
    voiceTranscricao: '',
  };

  console.log('[Chatbot] Estado inicial:', state);

  // ============================================================
  // DOM
  // ============================================================
  function $(id) { return document.getElementById(id); }

  const $msgs      = $('chat-messages');
  const $input     = $('chat-input');
  const $sendBtn   = $('send-btn');
  const $progFill  = $('prog-fill') || $('progress-fill');
  const $progLbl   = $('prog-label') || $('progress-label');
  const $resultado = $('resultado-final');

  // ============================================================
  // UTILS
  // ============================================================
  function scrollBottom() { 
    if ($msgs) $msgs.scrollTop = $msgs.scrollHeight; 
  }

  function atualizarProgresso() {
    const pct = Math.min((state.perguntaAtual / state.totalPerguntas) * 100, 100);
    if ($progFill) $progFill.style.width = pct + '%';
    if ($progLbl)  $progLbl.textContent = `Pergunta ${state.perguntaAtual} de ${state.totalPerguntas}`;
  }

  function habilitarChat(sim) {
    if ($input)   $input.disabled   = !sim;
    if ($sendBtn) $sendBtn.disabled = !sim;
    if (sim && $input) $input.focus();
  }

  function habilitarVoz(sim) {
    const $vozBtn = $('voz-btn');
    const $vozSt  = $('voz-status');
    const $vozWaves = $('voz-waves');
    
    if ($vozBtn) { 
      $vozBtn.disabled = !sim; 
      $vozBtn.className = 'voz-btn ' + (sim ? 'idle' : 'falando'); 
    }
    if ($vozSt)  { 
      $vozSt.className = 'voz-status' + (sim ? '' : ' falando'); 
      $vozSt.textContent = sim ? 'Clique para responder 🎙️' : 'Aguardando o Fespinho...'; 
    }
    if ($vozWaves) $vozWaves.classList.remove('ativo');
  }

  if ($input) {
    $input.addEventListener('input', function() {
      $input.style.height = 'auto';
      $input.style.height = Math.min($input.scrollHeight, 140) + 'px';
    });
  }

  // ============================================================
  // ADICIONAR MENSAGENS
  // ============================================================
  function addMsg(role, html, feedback, nota) {
    if (!$msgs) return;

    const wrap = document.createElement('div');
    wrap.className = 'msg ' + role;

    const icon = document.createElement('div');
    icon.className = 'msg-icon';
    icon.textContent = role === 'ai' ? '🤖' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = html;

    if (feedback) {
      const fb = document.createElement('div');
      fb.className = 'msg-feedback' + (nota >= 3 ? '' : ' negativo');
      fb.innerHTML = '<strong>' + (nota >= 3 ? '✅ Feedback' : '📝 Feedback') + '</strong><br>' + feedback;
      bubble.appendChild(fb);
    }

    if (nota != null) {
      const n = document.createElement('div');
      n.className = 'msg-nota';
      const estrelas = '★'.repeat(nota) + '☆'.repeat(5 - nota);
      n.innerHTML = '<span class="nota-estrela">' + estrelas + '</span> ' + nota + '/5';
      bubble.appendChild(n);
    }

    wrap.appendChild(icon);
    wrap.appendChild(bubble);
    $msgs.appendChild(wrap);
    scrollBottom();
  }

  function addTyping() {
    if (!$msgs) return;

    const wrap = document.createElement('div');
    wrap.className = 'msg ai';
    wrap.id = 'typing-wrap';

    const icon = document.createElement('div');
    icon.className = 'msg-icon';
    icon.textContent = '🤖';

    const ind = document.createElement('div');
    ind.className = 'typing-indicator';
    ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    wrap.appendChild(icon);
    wrap.appendChild(ind);
    $msgs.appendChild(wrap);
    scrollBottom();
  }

  function removeTyping() {
    const t = $('typing-wrap');
    if (t) t.remove();
  }

  // ============================================================
  // TEXT-TO-SPEECH
  // ============================================================
  function falar(texto, onEnd) {
    if (!window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    speechSynthesis.cancel();

    const limpo = texto
      .replace(/<[^>]+>/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();

    const utter = new SpeechSynthesisUtterance(limpo);
    utter.lang = 'pt-BR';
    utter.rate = 0.95;
    utter.pitch = 1.05;

    const vozes = speechSynthesis.getVoices();
    const vozPt = vozes.find(v => v.lang.startsWith('pt')) || vozes[0];
    if (vozPt) utter.voice = vozPt;

    const $vozSt = $('voz-status');
    if ($vozSt) {
      $vozSt.className = 'voz-status falando';
      $vozSt.textContent = 'Fespinho está falando...';
    }

    utter.onend = function() {
      if ($vozSt) { $vozSt.className = 'voz-status'; }
      if (onEnd) onEnd();
    };

    utter.onerror = function() {
      if (onEnd) onEnd();
    };

    speechSynthesis.speak(utter);
  }

  // ============================================================
  // SPEECH RECOGNITION
  // ============================================================
  function iniciarReconhecimento() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SR) {
      alert('Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.');
      return;
    }

    const rec = new SR();
    rec.lang = 'pt-BR';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = function() {
      const $vozBtn = $('voz-btn');
      const $vozSt = $('voz-status');
      const $vozWaves = $('voz-waves');
      const $vozTrans = $('voz-transcricao');

      if ($vozBtn) $vozBtn.className = 'voz-btn escutando';
      if ($vozSt) {
        $vozSt.className = 'voz-status escutando';
        $vozSt.textContent = 'Escutando... fale agora 🎙️';
      }
      if ($vozWaves) $vozWaves.classList.add('ativo');
      if ($vozTrans) $vozTrans.textContent = '';

      state.voiceTranscricao = '';
    };

    rec.onresult = function(e) {
      let interim = '', final = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }

      const $vozTrans = $('voz-transcricao');
      if ($vozTrans) $vozTrans.textContent = final || interim;

      if (final) state.voiceTranscricao = final;
    };

    rec.onend = function() {
      const $vozWaves = $('voz-waves');
      const $vozBtn = $('voz-btn');
      const $vozSt = $('voz-status');

      if ($vozWaves) $vozWaves.classList.remove('ativo');
      if ($vozBtn) $vozBtn.className = 'voz-btn idle';
      if ($vozSt) { $vozSt.className = 'voz-status'; $vozSt.textContent = 'Processando resposta...'; }

      if (state.voiceTranscricao.trim()) {
        processarResposta(state.voiceTranscricao.trim());
      } else {
        if ($vozSt) $vozSt.textContent = 'Não entendi. Tente novamente.';
        habilitarVoz(true);
      }
    };

    rec.onerror = function() {
      const $vozWaves = $('voz-waves');
      const $vozSt = $('voz-status');

      if ($vozWaves) $vozWaves.classList.remove('ativo');
      if ($vozSt) $vozSt.textContent = 'Erro no microfone. Tente novamente.';

      habilitarVoz(true);
    };

    state.recognition = rec;
  }

  // ============================================================
  // API CALL
  // ============================================================
  async function chamarAPI(mensagens, systemPrompt) {
    const resp = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: mensagens,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const msg = data?.error?.message || data?.message || resp.status;
      throw new Error('Erro da API: ' + msg);
    }

    if (!data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('Resposta inesperada');
    }

    const bloco = data.content.find(b => b.type === 'text');
    if (!bloco) throw new Error('Nenhum bloco de texto na resposta');

    return bloco.text;
  }

  // ============================================================
  // BUILD SYSTEM PROMPT
  // ============================================================
  function buildSystemPrompt() {
    const modoInfo = state.modo === 'voz'
      ? 'IMPORTANTE: O candidato está respondendo por VOZ. Mantenha perguntas e feedbacks concisos (máximo 3 frases), pois serão lidos em voz alta.'
      : 'O candidato está respondendo por CHAT/TEXTO. Pode ser mais extenso.';

    return `Você é o Fespinho, um entrevistador de RH experiente da FESP-PR (Faculdade de Educação Superior do Paraná). Você está conduzindo uma simulação de entrevista de emprego para fins educacionais.

DADOS DO CANDIDATO:
- Link/Vaga: ${state.vagaLink}
- Currículo (texto): ${state.curriculoTexto || 'Não fornecido'}

MODO DE RESPOSTA: ${modoInfo}

REGRAS OBRIGATÓRIAS:
1. Faça exatamente ${state.totalPerguntas} perguntas no total, uma por vez.
2. As perguntas devem ser REAIS como faz um recrutador — inclua perguntas sobre coisas que NÃO estão no currículo (ex: projetos pessoais, comportamento sob pressão, conflitos com colegas, expectativas salariais, onde se vê em 5 anos).
3. Varie os tipos: comportamentais, situacionais, técnicas da área, motivacionais e ao menos 1 "pergunta difícil" realista.
4. Use metodologias STAR (Situação, Tarefa, Ação, Resultado) e CAR (Contexto, Ação, Resultado) para avaliar as respostas.
5. Após cada resposta do candidato, responda SOMENTE com JSON válido neste formato exato:
{
  "feedback": "texto explicando pontos fortes e o que melhorar, mencionando se a resposta seguiu STAR ou CAR",
  "nota": número inteiro de 1 a 5,
  "proxima_pergunta": "texto da próxima pergunta" 
}
6. Na última resposta (pergunta ${state.totalPerguntas}), coloque "proxima_pergunta": null.
7. Quando o candidato responder, SEMPRE responda com JSON válido conforme o formato acima.
8. Na primeira mensagem de abertura, apresente-se brevemente e faça a primeira pergunta (texto puro, sem JSON).
9. Adapte o nível de dificuldade ao perfil e área da vaga identificados.
10. Seja profissional, encorajador e realista. Este é um simulador educacional.`;
  }

  // ============================================================
  // INICIAR ENTREVISTA
  // ============================================================
  async function iniciarEntrevista() {
    addTyping();

    const primeiraMsg = `Olá! Vou iniciar a simulação. Os dados recebidos são: vaga "${state.vagaLink}" e o currículo do candidato. Apresente-se brevemente como Fespinho e faça a primeira pergunta da entrevista de forma natural.`;

    try {
      const resposta = await chamarAPI(
        [{ role: 'user', content: primeiraMsg }],
        buildSystemPrompt()
      );

      state.historico.push({ role: 'user', content: primeiraMsg });
      state.historico.push({ role: 'assistant', content: resposta });

      removeTyping();
      state.perguntaAtual = 1;
      atualizarProgresso();

      addMsg('ai', resposta.replace(/\n/g, '<br>'));

      if (state.modo === 'chat') {
        habilitarChat(true);
      } else {
        falar(resposta, function() {
          habilitarVoz(true);
        });
      }
    } catch (e) {
      removeTyping();
      addMsg('ai', '😥 Erro ao iniciar a simulação.<br><small>' + e.message + '</small>');
    }
  }

  // ============================================================
  // PROCESSAR RESPOSTA
  // ============================================================
  async function processarResposta(texto) {
    if (!texto || state.aguardando || state.finalizado) return;

    state.aguardando = true;

    if (state.modo === 'chat') habilitarChat(false);
    addMsg('user', texto);

    if ($input) {
      $input.value = '';
      $input.style.height = 'auto';
    }

    const $vozTrans = $('voz-transcricao');
    if ($vozTrans) $vozTrans.textContent = '';

    state.historico.push({ role: 'user', content: texto });

    addTyping();

    try {
      const resposta = await chamarAPI(state.historico, buildSystemPrompt());
      state.historico.push({ role: 'assistant', content: resposta });

      removeTyping();

      // Parse JSON
      let parsed = null;
      try {
        const match = resposta.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (_) {}

      if (parsed) {
        const feedback = parsed.feedback || '';
        const nota = parseInt(parsed.nota) || 3;
        const proxima = parsed.proxima_pergunta;

        state.respostas.push({
          pergunta: `Pergunta ${state.perguntaAtual}`,
          resposta: texto,
          feedback,
          nota,
        });

        addMsg('ai', '<strong>Avaliação:</strong>', feedback, nota);

        state.perguntaAtual++;
        atualizarProgresso();

        if (proxima && state.perguntaAtual <= state.totalPerguntas) {
          setTimeout(function() {
            const html = `<strong>Pergunta ${state.perguntaAtual}:</strong><br>${proxima.replace(/\n/g, '<br>')}`;
            addMsg('ai', html);

            state.aguardando = false;

            if (state.modo === 'chat') {
              habilitarChat(true);
            } else {
              falar(feedback + '. ' + proxima, function() {
                habilitarVoz(true);
              });
            }
          }, 600);
        } else {
          if (state.modo === 'voz') {
            falar('Muito bem! Entrevista concluída. Gerando seu relatório.', function() {});
          }
          setTimeout(function() {
            finalizarEntrevista();
          }, 800);
        }
      } else {
        addMsg('ai', resposta.replace(/\n/g, '<br>'));
        state.aguardando = false;

        if (state.modo === 'chat') {
          habilitarChat(true);
        } else {
          falar(resposta, function() {
            habilitarVoz(true);
          });
        }
      }
    } catch (e) {
      removeTyping();
      addMsg('ai', '⚠️ Erro ao processar.<br><small>' + e.message + '</small>');

      state.aguardando = false;

      if (state.modo === 'chat') {
        habilitarChat(true);
      } else {
        habilitarVoz(true);
      }
    }
  }

  // ============================================================
  // EVENTOS
  // ============================================================
  if ($sendBtn) {
    $sendBtn.addEventListener('click', function() {
      if ($input) processarResposta($input.value.trim());
    });
  }

  if ($input) {
    $input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processarResposta($input.value.trim());
      }
    });
  }

  // ============================================================
  // FINALIZAR ENTREVISTA
  // ============================================================
  async function finalizarEntrevista() {
    state.finalizado = true;

    const $chatIn = document.getElementById('chat-input-area');
    const $vozIn = document.getElementById('voz-input-area');

    if ($chatIn) $chatIn.style.display = 'none';
    if ($vozIn) $vozIn.style.display = 'none';

    addMsg('ai', '🎉 <strong>Entrevista concluída!</strong> Gerando seu relatório de desempenho...');
    addTyping();

    const promptFinal = `Com base nas respostas desta simulação de entrevista, gere uma avaliação final.
Respostas: ${JSON.stringify(state.respostas)}

Retorne SOMENTE JSON válido, sem texto antes ou depois:
{
  "pontuacao_geral": número de 0 a 100,
  "classificacao": "Iniciante" ou "Em desenvolvimento" ou "Bom candidato" ou "Candidato forte" ou "Excelente candidato",
  "resumo": "parágrafo de resumo geral da performance do candidato",
  "categorias": [
    { "nome": "Comunicação", "nota": número de 0 a 10 },
    { "nome": "Raciocínio STAR/CAR", "nota": número de 0 a 10 },
    { "nome": "Conhecimento Técnico", "nota": número de 0 a 10 },
    { "nome": "Autoconhecimento", "nota": número de 0 a 10 },
    { "nome": "Postura Profissional", "nota": número de 0 a 10 }
  ],
  "pontos_fortes": ["ponto 1", "ponto 2", "ponto 3"],
  "pontos_melhoria": ["ponto 1", "ponto 2"],
  "cursos_sugeridos": [
    { "nome": "nome do curso", "plataforma": "plataforma", "motivo": "motivo em 1 frase" },
    { "nome": "nome do curso", "plataforma": "plataforma", "motivo": "motivo em 1 frase" },
    { "nome": "nome do curso", "plataforma": "plataforma", "motivo": "motivo em 1 frase" }
  ]
}`;

    try {
      const respFinal = await chamarAPI(
        [{ role: 'user', content: promptFinal }],
        buildSystemPrompt()
      );

      removeTyping();

      let avaliacao = null;
      try {
        const match = respFinal.match(/\{[\s\S]*\}/);
        if (match) avaliacao = JSON.parse(match[0]);
      } catch (_) {}

      renderResultado(avaliacao || fallbackResultado());
    } catch (e) {
      removeTyping();
      renderResultado(fallbackResultado());
    }
  }

  function fallbackResultado() {
    const notaMedia = state.respostas.length
      ? Math.round(
          (state.respostas.reduce((s, r) => s + r.nota, 0) / state.respostas.length) * 20
        )
      : 60;

    const n = Math.max(1, Math.round(notaMedia / 10));

    return {
      pontuacao_geral: notaMedia,
      classificacao: 'Bom candidato',
      resumo: 'Você concluiu a simulação. Analise os feedbacks de cada resposta para identificar seus pontos de melhoria.',
      categorias: [
        { nome: 'Comunicação', nota: n },
        { nome: 'Raciocínio STAR/CAR', nota: Math.max(1, n - 1) },
        { nome: 'Conhecimento Técnico', nota: n },
        { nome: 'Autoconhecimento', nota: n },
        { nome: 'Postura Profissional', nota: n },
      ],
      pontos_fortes: [
        'Concluiu a simulação completa',
        'Demonstrou disposição para o treinamento',
        'Engajamento com o processo',
      ],
      pontos_melhoria: [
        'Revise os feedbacks de cada resposta',
        'Pratique a metodologia STAR nas respostas',
      ],
      cursos_sugeridos: [
        {
          nome: 'Como se preparar para entrevistas',
          plataforma: 'YouTube',
          motivo: 'Fundamentos de entrevistas comportamentais',
        },
        {
          nome: 'Comunicação Assertiva',
          plataforma: 'Coursera',
          motivo: 'Melhore sua expressão verbal e clareza',
        },
        {
          nome: 'LinkedIn para carreira',
          plataforma: 'LinkedIn Learning',
          motivo: 'Fortaleça sua presença profissional online',
        },
      ],
    };
  }

  function renderResultado(av) {
    if ($resultado) $resultado.style.display = 'block';

    const score = av.pontuacao_geral || 60;
    const emoji =
      score >= 80 ? '🏆' : score >= 60 ? '💪' : score >= 40 ? '📈' : '📚';

    const icones = {
      coursera: '🎓',
      udemy: '🎯',
      linkedin: '💼',
      youtube: '▶️',
      alura: '🦁',
      rocketseat: '🚀',
      dio: '💻',
    };

    function icone(plat) {
      const p = (plat || '').toLowerCase();
      return Object.entries(icones).find(([k]) => p.includes(k))?.[1] || '📚';
    }

    const cursosHTML = (av.cursos_sugeridos || [])
      .map(
        c => `
      <div class="curso-item">
        <span class="curso-icone">${icone(c.plataforma)}</span>
        <div class="curso-info">
          <h4>${c.nome}</h4>
          <p>${c.motivo}</p>
        </div>
        <span class="curso-badge">${c.plataforma}</span>
      </div>
    `
      )
      .join('');

    const categoriasHTML = (av.categorias || [])
      .map(
        c => `
      <div class="categoria-card">
        <div class="categoria-nome">${c.nome}</div>
        <div class="categoria-barra-track">
          <div class="categoria-barra-fill" style="width:${c.nota * 10}%"></div>
        </div>
        <div class="categoria-nota">${c.nota}/10</div>
      </div>
    `
      )
      .join('');

    const fortesHTML = (av.pontos_fortes || [])
      .map(p => `<li>✅ ${p}</li>`)
      .join('');
    const melhoriaHTML = (av.pontos_melhoria || [])
      .map(p => `<li>📝 ${p}</li>`)
      .join('');

    $resultado.innerHTML = `
      <div class="resultado-header">
        <span class="resultado-badge">RELATÓRIO FINAL</span>
        <h2>${emoji} Simulação Concluída</h2>
        <p>${av.resumo || 'Parabéns por concluir a simulação!'}</p>
      </div>

      <div class="aviso-simulador-final">
        <span style="font-size:1.4rem;flex-shrink:0">⚠️</span>
        <div>
          <strong>Lembre-se:</strong> Este é um <strong>simulador educacional</strong> da FESP-PR. A avaliação é gerada por IA com fins de <strong>treinamento e autoconhecimento</strong>. Os resultados não refletem sua performance em processos seletivos reais.
        </div>
      </div>

      <div class="score-geral">
        <div class="score-circulo" id="score-circulo">
          <div class="score-circulo-inner">
            <span class="score-numero">${score}</span>
            <span class="score-label">/ 100</span>
          </div>
        </div>
        <div class="score-classificacao">
          <h3>${av.classificacao || 'Bom candidato'}</h3>
          <p>Você completou ${state.respostas.length} pergunta${state.respostas.length !== 1 ? 's' : ''} no modo <strong>${state.modo === 'voz' ? 'Voz 🎙️' : 'Chat 💬'}</strong>.</p>
          ${fortesHTML ? `<ul class="pontos-lista" style="margin-top:14px">${fortesHTML}</ul>` : ''}
        </div>
      </div>

      <div class="grafico-wrap">
        <p class="grafico-titulo">📊 Desempenho por Categoria</p>
        <canvas id="radarChart"></canvas>
      </div>

      <div class="categorias-grid">${categoriasHTML}</div>

      ${melhoriaHTML ? `
      <div class="grafico-wrap">
        <p class="grafico-titulo">📝 Pontos para desenvolver</p>
        <ul class="pontos-lista">${melhoriaHTML}</ul>
      </div>
      ` : ''}

      ${cursosHTML ? `
      <div class="cursos-wrap">
        <p class="cursos-titulo">🎓 Recursos sugeridos para seu desenvolvimento</p>
        <p class="cursos-subtitulo">Com base no seu desempenho, o Fespinho recomenda estes conteúdos:</p>
        <div class="cursos-lista">${cursosHTML}</div>
      </div>
      ` : ''}

      <a href="index.html" class="btn-reiniciar">← Voltar à página inicial</a>
    `;

    // Animar círculo de score
    setTimeout(() => {
      const circ = document.getElementById('score-circulo');
      if (circ) {
        const deg = Math.round((score / 100) * 360);
        circ.style.background = `conic-gradient(var(--teal) ${deg}deg, var(--border) 0deg)`;
      }
    }, 100);

    // Gráfico radar
    const categorias = av.categorias || [];
    if (categorias.length && window.Chart) {
      const ctx = document.getElementById('radarChart').getContext('2d');
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: categorias.map(c => c.nome),
          datasets: [
            {
              label: 'Sua performance',
              data: categorias.map(c => c.nota),
              backgroundColor: 'rgba(26,154,168,0.18)',
              borderColor: 'rgba(26,154,168,0.9)',
              borderWidth: 2.5,
              pointBackgroundColor: '#0f1e3d',
              pointRadius: 5,
              pointHoverRadius: 7,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            r: {
              min: 0,
              max: 10,
              ticks: { stepSize: 2, font: { size: 11 }, color: '#94a3b8' },
              grid: { color: 'rgba(0,0,0,0.07)' },
              angleLines: { color: 'rgba(0,0,0,0.07)' },
              pointLabels: { font: { size: 12, weight: '600' }, color: '#1e293b' },
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (state.modo === 'voz') {
      setTimeout(() => {
        falar(
          `Sua pontuação final foi ${score} pontos. ${av.classificacao}. ${av.resumo || ''}`,
          null
        );
      }, 1000);
    }
  }

  // ============================================================
  // INICIALIZAR CHATBOT
  // ============================================================
  window.addEventListener('DOMContentLoaded', () => {
    // Recarregar dados do sessionStorage (em caso de F5)
    state.vagaLink = sessionStorage.getItem('vagaLink') || '';
    state.curriculoTexto = sessionStorage.getItem('curriculo_texto') || '';

    console.log('[Chatbot] Dados carregados:', {
      vagaLink: state.vagaLink,
      curriculoLength: state.curriculoTexto.length,
    });

    // Se não houver vaga, redirecionar
    if (!state.vagaLink) {
      const $telaSelecao = document.getElementById('tela-selecao');
      if ($telaSelecao) {
        $telaSelecao.innerHTML = `
          <div style="text-align:center;padding:40px 20px">
            <p style="font-size:2rem;margin-bottom:16px">⚠️</p>
            <h2 style="color:var(--navy);margin-bottom:12px">Dados não encontrados</h2>
            <p style="color:var(--muted);margin-bottom:24px;line-height:1.6">Para iniciar a simulação, você precisa preencher o link da vaga e enviar seu currículo na página inicial.</p>
            <a href="index.html" style="display:inline-block;background:var(--navy);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700">← Voltar à página inicial</a>
          </div>
        `;
      }
      return;
    }

    // Se já tem modo selecionado, pular tela de seleção
    if (state.modo) {
      const $telaSelecao = document.getElementById('tela-selecao');
      const $loading = document.getElementById('tela-loading');
      const $chatArea = document.getElementById('chat-area');

      if ($telaSelecao) $telaSelecao.style.display = 'none';
      if ($loading) $loading.style.display = 'none';
      if ($chatArea) $chatArea.style.display = 'flex';

      const $chatIn = document.getElementById('chat-input-area');
      const $vozIn = document.getElementById('voz-input-area');

      if (state.modo === 'chat') {
        if ($chatIn) $chatIn.style.display = 'block';
        if ($vozIn) $vozIn.style.display = 'none';
      } else {
        if ($chatIn) $chatIn.style.display = 'none';
        if ($vozIn) $vozIn.style.display = 'block';
        iniciarReconhecimento();
      }

      const $hStatus = document.getElementById('header-status');
      if ($hStatus) $hStatus.textContent = 'Simulação em andamento';

      iniciarEntrevista();
    }

    // Carregar vozes do TTS
    if (window.speechSynthesis) {
      speechSynthesis.getVoices();
      speechSynthesis.addEventListener('voiceschanged', () => {
        speechSynthesis.getVoices();
      });
    }
  });
})();
