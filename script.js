//============================================================================================================
//HOME-MATHEUS
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
// POP UP TALITA 
// ============================================================================================================//

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




// PARTE CARROSSEL
(function () {
  var cur = 0, pct = 0, total = 3, dur = 5500, step = 60;
  var labels = ['01', '02', '03'];
 
  function hcGo(n) {
    var slides = document.querySelectorAll('.hc-slide');
    var dots   = document.querySelectorAll('.hc-dot');
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
    setTimeout(function () { fill.style.transition = ''; }, 20);
  }
 
  window.hcGo = hcGo;
 
  setInterval(function () {
    pct += (step / dur) * 100;
    document.getElementById('hcFill').style.width = Math.min(pct, 100) + '%';
    if (pct >= 100) hcGo(cur + 1);
  }, step);
})();

// ============================================================
// CHATBOT — Simulação de entrevista (modo chat + voz)
// ============================================================
(function() {

var state = {
  modo: null,
  vagaLink: '',
  curriculoTexto: '',
  historico: [],
  perguntaAtual: 0,
  totalPerguntas: 6,
  respostas: [],
  aguardando: false,
  finalizado: false,
  recognition: null,
  voiceTranscricao: '',
};

function $(id){ return document.getElementById(id); }

var $selecao  = $('tela-selecao');
var $loading  = $('tela-loading');
var $chatArea = $('chat-area');
var $msgs     = $('chat-messages');
var $chatIn   = $('chat-input-area');
var $vozIn    = $('voz-input-area');
var $input    = $('chat-input');
var $sendBtn  = $('send-btn');
var $vozBtn   = $('voz-btn');
var $vozSt    = $('voz-status');
var $vozWaves = $('voz-waves');
var $vozTrans = $('voz-transcricao');
var $progFill = $('prog-fill');
var $progLbl  = $('prog-label');
var $resultado= $('resultado-final');
var $hStatus  = $('header-status');
var $loadTxt  = $('loading-txt');

function selecionarModo(modo) {
  state.modo = modo;
  $selecao.style.display = 'none';
  $loading.style.display = 'flex';
  if ($loadTxt) $loadTxt.textContent = modo === 'voz' ? 'Preparando entrevista por voz...' : 'Analisando sua vaga e currículo...';
  if (modo === 'voz') iniciarReconhecimento();
  setTimeout(function() {
    $loading.style.display = 'none';
    $chatArea.style.display = 'flex';
    if (modo === 'chat') {
      $chatIn.style.display = 'block';
      $vozIn.style.display  = 'none';
    } else {
      $chatIn.style.display = 'none';
      $vozIn.style.display  = 'block';
    }
    if ($hStatus) $hStatus.textContent = 'Simulação em andamento';
    iniciarEntrevista();
  }, 1800);
}

function scrollBottom() { if ($msgs) $msgs.scrollTop = $msgs.scrollHeight; }

function atualizarProgresso() {
  var pct = Math.min((state.perguntaAtual / state.totalPerguntas) * 100, 100);
  if ($progFill) $progFill.style.width = pct + '%';
  if ($progLbl)  $progLbl.textContent = 'Pergunta ' + state.perguntaAtual + ' de ' + state.totalPerguntas;
}

function habilitarChat(sim) {
  if ($input)   $input.disabled   = !sim;
  if ($sendBtn) $sendBtn.disabled = !sim;
  if (sim && $input) $input.focus();
}

function habilitarVoz(sim) {
  if ($vozBtn) { $vozBtn.disabled = !sim; $vozBtn.className = 'voz-btn ' + (sim ? 'idle' : 'falando'); }
  if ($vozSt)  { $vozSt.className = 'voz-status' + (sim ? '' : ' falando'); $vozSt.textContent = sim ? 'Clique para responder' : 'Aguardando o Fespinho...'; }
  if ($vozWaves) $vozWaves.classList.remove('ativo');
}

if ($input) {
  $input.addEventListener('input', function() {
    $input.style.height = 'auto';
    $input.style.height = Math.min($input.scrollHeight, 140) + 'px';
  });
}

function addMsg(role, html, feedback, nota) {
  if (!$msgs) return;
  var wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  var icon = document.createElement('div');
  icon.className = 'msg-icon';
  icon.textContent = role === 'ai' ? '🤖' : '👤';
  var bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = html;
  if (feedback) {
    var fb = document.createElement('div');
    fb.className = 'msg-feedback' + (nota >= 3 ? '' : ' neg');
    fb.innerHTML = '<strong>' + (nota >= 3 ? '✅ Feedback' : '📝 Feedback') + '</strong><br>' + feedback;
    bubble.appendChild(fb);
  }
  if (nota != null) {
    var n = document.createElement('div');
    n.className = 'msg-nota';
    n.innerHTML = '<span class="nota-star">' + '★'.repeat(nota) + '☆'.repeat(5-nota) + '</span> ' + nota + '/5';
    bubble.appendChild(n);
  }
  wrap.appendChild(icon);
  wrap.appendChild(bubble);
  $msgs.appendChild(wrap);
  scrollBottom();
}

function addTyping() {
  if (!$msgs) return;
  var wrap = document.createElement('div');
  wrap.className = 'msg ai'; wrap.id = 'typing-wrap';
  var icon = document.createElement('div');
  icon.className = 'msg-icon'; icon.textContent = '🤖';
  var ind = document.createElement('div');
  ind.className = 'typing-indicator';
  ind.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  wrap.appendChild(icon); wrap.appendChild(ind);
  $msgs.appendChild(wrap); scrollBottom();
}

function removeTyping() { var t = $('typing-wrap'); if (t) t.remove(); }

function falar(texto, onEnd) {
  if (!window.speechSynthesis) { if (onEnd) onEnd(); return; }
  speechSynthesis.cancel();
  var limpo = texto.replace(/<[^>]+>/g,'').replace(/\*\*/g,'').replace(/\*/g,'').trim();
  var utter = new SpeechSynthesisUtterance(limpo);
  utter.lang = 'pt-BR'; utter.rate = 0.95; utter.pitch = 1.05;
  var vozes = speechSynthesis.getVoices();
  var vozPt = vozes.find(function(v){ return v.lang.startsWith('pt'); }) || vozes[0];
  if (vozPt) utter.voice = vozPt;
  if ($vozSt) { $vozSt.className = 'voz-status falando'; $vozSt.textContent = 'Fespinho está falando...'; }
  utter.onend = function() { if ($vozSt) { $vozSt.className = 'voz-status'; } if (onEnd) onEnd(); };
  utter.onerror = function() { if (onEnd) onEnd(); };
  speechSynthesis.speak(utter);
}

function iniciarReconhecimento() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Seu navegador não suporta reconhecimento de voz. Use o Google Chrome.'); return; }
  var rec = new SR();
  rec.lang = 'pt-BR'; rec.continuous = false; rec.interimResults = true;
  rec.onstart = function() {
    if ($vozBtn) $vozBtn.className = 'voz-btn escutando';
    if ($vozSt)  { $vozSt.className = 'voz-status escutando'; $vozSt.textContent = 'Escutando... fale agora'; }
    if ($vozWaves) $vozWaves.classList.add('ativo');
    if ($vozTrans) $vozTrans.textContent = '';
    state.voiceTranscricao = '';
  };
  rec.onresult = function(e) {
    var interim = '', final = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    if ($vozTrans) $vozTrans.textContent = final || interim;
    if (final) state.voiceTranscricao = final;
  };
  rec.onend = function() {
    if ($vozWaves) $vozWaves.classList.remove('ativo');
    if ($vozBtn) $vozBtn.className = 'voz-btn idle';
    if ($vozSt)  { $vozSt.className = 'voz-status'; $vozSt.textContent = 'Processando resposta...'; }
    if (state.voiceTranscricao.trim()) {
      processarResposta(state.voiceTranscricao.trim());
    } else {
      if ($vozSt) $vozSt.textContent = 'Não entendi. Tente novamente.';
      habilitarVoz(true);
    }
  };
  rec.onerror = function() {
    if ($vozWaves) $vozWaves.classList.remove('ativo');
    if ($vozSt) $vozSt.textContent = 'Erro no microfone. Tente novamente.';
    habilitarVoz(true);
  };
  state.recognition = rec;
}

function toggleVoz() {
  if ($vozBtn && $vozBtn.disabled) return;
  if (state.recognition) { state.voiceTranscricao = ''; if ($vozTrans) $vozTrans.textContent = ''; state.recognition.start(); }
}

// Expor globalmente para onclick do HTML
window.selecionarModo = selecionarModo;
window.toggleVoz = toggleVoz;

async function chamarAPI(mensagens, systemPrompt) {
  var resp = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1000, system: systemPrompt, messages: mensagens })
  });
  var data = await resp.json();
  if (!resp.ok) throw new Error(data && data.error && data.error.message ? data.error.message : resp.status);
  if (!data.content || !data.content.length) throw new Error('Resposta vazia');
  var bloco = data.content.find(function(b){ return b.type === 'text'; });
  if (!bloco) throw new Error('Sem bloco de texto');
  return bloco.text;
}

function buildPrompt() {
  var modoInfo = state.modo === 'voz'
    ? 'IMPORTANTE: O candidato está respondendo por VOZ. Mantenha as perguntas e feedbacks concisos (máximo 3 frases), pois serão lidos em voz alta.'
    : 'O candidato está respondendo por CHAT/TEXTO.';
  return 'Você é o Fespinho, entrevistador de RH da FESP-PR. Simulação educacional de entrevista.\n\nDADOS:\n- Vaga: ' + state.vagaLink + '\n- Currículo: ' + (state.curriculoTexto || 'Não fornecido') + '\n\nMODO: ' + modoInfo + '\n\nREGRAS:\n1. Faça exatamente ' + state.totalPerguntas + ' perguntas, uma por vez.\n2. Perguntas reais — inclua sobre coisas fora do currículo.\n3. Varie tipos: comportamentais, situacionais, técnicas, motivacionais.\n4. Use STAR e CAR para avaliar.\n5. Após cada resposta, retorne SOMENTE JSON:\n{"feedback":"texto","nota":1-5,"proxima_pergunta":"texto ou null"}\n6. Na última, proxima_pergunta: null.\n7. Na abertura: apresente-se e faça a primeira pergunta (texto puro).\n8. Este é um simulador educacional.';
}

async function iniciarEntrevista() {
  addTyping();
  var primeiraMsg = 'Inicie a simulação. Vaga: "' + state.vagaLink + '". Apresente-se como Fespinho e faça a primeira pergunta.';
  try {
    var resposta = await chamarAPI([{ role: 'user', content: primeiraMsg }], buildPrompt());
    state.historico.push({ role: 'user', content: primeiraMsg });
    state.historico.push({ role: 'assistant', content: resposta });
    removeTyping();
    state.perguntaAtual = 1;
    atualizarProgresso();
    addMsg('ai', resposta.replace(/\n/g, '<br>'));
    if (state.modo === 'chat') habilitarChat(true);
    else falar(resposta, function(){ habilitarVoz(true); });
  } catch(e) {
    removeTyping();
    addMsg('ai', '😥 Erro ao iniciar. Verifique sua conexão.<br><small>' + e.message + '</small>');
  }
}

async function processarResposta(texto) {
  if (!texto || state.aguardando || state.finalizado) return;
  state.aguardando = true;
  if (state.modo === 'chat') habilitarChat(false);
  addMsg('user', texto);
  if (state.modo === 'chat' && $input) { $input.value = ''; $input.style.height = 'auto'; }
  if ($vozTrans) $vozTrans.textContent = '';
  state.historico.push({ role: 'user', content: texto });
  addTyping();
  try {
    var resposta = await chamarAPI(state.historico, buildPrompt());
    state.historico.push({ role: 'assistant', content: resposta });
    removeTyping();
    var parsed = null;
    try { var match = resposta.match(/\{[\s\S]*\}/); if (match) parsed = JSON.parse(match[0]); } catch(e2){}
    if (parsed) {
      var feedback = parsed.feedback || '';
      var nota = parseInt(parsed.nota) || 3;
      var proxima = parsed.proxima_pergunta;
      state.respostas.push({ pergunta: 'Pergunta ' + state.perguntaAtual, resposta: texto, feedback: feedback, nota: nota });
      addMsg('ai', '<strong>Avaliação:</strong>', feedback, nota);
      state.perguntaAtual++;
      atualizarProgresso();
      if (proxima && state.perguntaAtual <= state.totalPerguntas) {
        setTimeout(function() {
          var html = '<strong>Pergunta ' + state.perguntaAtual + ':</strong><br>' + proxima.replace(/\n/g,'<br>');
          addMsg('ai', html);
          state.aguardando = false;
          if (state.modo === 'chat') habilitarChat(true);
          else falar(feedback + '. ' + proxima, function(){ habilitarVoz(true); });
        }, 600);
      } else {
        if (state.modo === 'voz') falar('Muito bem! Entrevista concluída. Gerando seu relatório.', function(){});
        setTimeout(function(){ finalizarEntrevista(); }, 800);
      }
    } else {
      addMsg('ai', resposta.replace(/\n/g,'<br>'));
      state.aguardando = false;
      if (state.modo === 'chat') habilitarChat(true);
      else falar(resposta, function(){ habilitarVoz(true); });
    }
  } catch(e) {
    removeTyping();
    addMsg('ai', '⚠️ Erro. Tente novamente.<br><small>' + e.message + '</small>');
    state.aguardando = false;
    if (state.modo === 'chat') habilitarChat(true);
    else habilitarVoz(true);
  }
}

function enviarRespostaChat() {
  if ($input) processarResposta($input.value.trim());
}
window.enviarRespostaChat = enviarRespostaChat;

async function finalizarEntrevista() {
  state.finalizado = true;
  if ($chatIn) $chatIn.style.display = 'none';
  if ($vozIn)  $vozIn.style.display  = 'none';
  addMsg('ai', '🎉 <strong>Entrevista concluída!</strong> Gerando seu relatório...');
  addTyping();
  var promptFinal = 'Avalie o candidato com base nas respostas: ' + JSON.stringify(state.respostas) + '. Retorne SOMENTE JSON:\n{"pontuacao_geral":0-100,"classificacao":"...","resumo":"...","categorias":[{"nome":"Comunicação","nota":0-10},{"nome":"Raciocínio STAR/CAR","nota":0-10},{"nome":"Conhecimento Técnico","nota":0-10},{"nome":"Autoconhecimento","nota":0-10},{"nome":"Postura Profissional","nota":0-10}],"pontos_fortes":["..."],"pontos_melhoria":["..."],"cursos_sugeridos":[{"nome":"...","plataforma":"...","motivo":"..."}]}';
  try {
    var r = await chamarAPI([{role:'user',content:promptFinal}], buildPrompt());
    removeTyping();
    var av = null;
    try { var m2 = r.match(/\{[\s\S]*\}/); if(m2) av = JSON.parse(m2[0]); } catch(e2){}
    renderResultado(av || fallback());
  } catch(e) { removeTyping(); renderResultado(fallback()); }
}

function fallback() {
  var n = state.respostas.length ? Math.round(state.respostas.reduce(function(s,r){return s+r.nota;},0)/state.respostas.length*20) : 60;
  return { pontuacao_geral:n, classificacao:'Bom candidato', resumo:'Você concluiu a simulação.', categorias:[{nome:'Comunicação',nota:Math.max(1,Math.round(n/10))},{nome:'Raciocínio STAR/CAR',nota:Math.max(1,Math.round(n/12))},{nome:'Conhecimento Técnico',nota:Math.max(1,Math.round(n/10))},{nome:'Autoconhecimento',nota:Math.max(1,Math.round(n/10))},{nome:'Postura Profissional',nota:Math.max(1,Math.round(n/10))}], pontos_fortes:['Concluiu a simulação','Disposição para treinar'], pontos_melhoria:['Revise os feedbacks','Pratique STAR'], cursos_sugeridos:[{nome:'Como se preparar para entrevistas',plataforma:'YouTube',motivo:'Fundamentos comportamentais'},{nome:'Comunicação Assertiva',plataforma:'Coursera',motivo:'Expressão verbal'},{nome:'LinkedIn para carreira',plataforma:'LinkedIn Learning',motivo:'Presença profissional'}] };
}

function renderResultado(av) {
  if ($chatArea) $chatArea.style.display = 'none';
  if ($resultado) $resultado.style.display = 'block';
  var score = av.pontuacao_geral || 60;
  var emoji = score>=80?'🏆':score>=60?'💪':score>=40?'📈':'📚';
  var ics = {coursera:'🎓',udemy:'🎯',linkedin:'💼',youtube:'▶️',alura:'🦁',rocketseat:'🚀',dio:'💻'};
  function ic(p){ var k=Object.entries(ics).find(function(e){return (p||'').toLowerCase().includes(e[0]);});return k?k[1]:'📚'; }
  var cursosHTML=(av.cursos_sugeridos||[]).map(function(c){return '<div class="curso-item"><span class="curso-icon">'+ic(c.plataforma)+'</span><div class="curso-info"><h4>'+c.nome+'</h4><p>'+c.motivo+'</p></div><span class="curso-badge">'+c.plataforma+'</span></div>';}).join('');
  var catsHTML=(av.categorias||[]).map(function(c){return '<div class="cat-card"><div class="cat-nome">'+c.nome+'</div><div class="cat-track"><div class="cat-fill" style="width:'+c.nota*10+'%"></div></div><div class="cat-nota">'+c.nota+'/10</div></div>';}).join('');
  var fortesHTML=(av.pontos_fortes||[]).map(function(p){return '<li>✅ '+p+'</li>';}).join('');
  var melhoriaHTML=(av.pontos_melhoria||[]).map(function(p){return '<li>📝 '+p+'</li>';}).join('');
  $resultado.innerHTML='<div class="res-header"><span class="res-badge">RELATÓRIO FINAL</span><h2>'+emoji+' Simulação Concluída</h2><p>'+(av.resumo||'Parabéns!')+'</p></div><div class="aviso-final"><span style="font-size:1.4rem;flex-shrink:0">⚠️</span><div><strong>Lembre-se:</strong> Este é um <strong>simulador educacional</strong> da FESP-PR. A avaliação é gerada por IA com fins de <strong>treinamento</strong>.</div></div><div class="score-geral"><div class="score-circulo" id="score-circ"><div class="score-inner"><span class="score-num">'+score+'</span><span class="score-lbl">/ 100</span></div></div><div class="score-class"><h3>'+(av.classificacao||'Bom candidato')+'</h3><p>Você completou '+state.respostas.length+' pergunta(s) no modo <strong>'+(state.modo==='voz'?'Voz 🎙️':'Chat 💬')+'</strong>.</p>'+(fortesHTML?'<ul class="pontos-list" style="margin-top:12px">'+fortesHTML+'</ul>':'')+'</div></div><div class="grafico-box"><p class="box-titulo">📊 Desempenho por Categoria</p><canvas id="radar"></canvas></div><div class="cats-grid">'+catsHTML+'</div>'+(melhoriaHTML?'<div class="grafico-box"><p class="box-titulo">📝 Pontos para desenvolver</p><ul class="pontos-list">'+melhoriaHTML+'</ul></div>':'')+(cursosHTML?'<div class="cursos-box"><p class="cursos-titulo">🎓 Recursos sugeridos</p><p class="cursos-sub">Com base no seu desempenho:</p><div class="cursos-lista">'+cursosHTML+'</div></div>':'')+'<a href="index.html" class="btn-reiniciar">← Voltar à página inicial</a>';
  setTimeout(function(){ var c=document.getElementById('score-circ'); if(c) c.style.background='conic-gradient(var(--teal) '+Math.round(score/100*360)+'deg, var(--border) 0deg)'; },100);
  var cats=av.categorias||[];
  if(cats.length && window.Chart){ new Chart(document.getElementById('radar').getContext('2d'),{type:'radar',data:{labels:cats.map(function(c){return c.nome;}),datasets:[{label:'Sua performance',data:cats.map(function(c){return c.nota;}),backgroundColor:'rgba(26,154,168,.18)',borderColor:'rgba(26,154,168,.9)',borderWidth:2.5,pointBackgroundColor:'#0f1e3d',pointRadius:5}]},options:{responsive:true,scales:{r:{min:0,max:10,ticks:{stepSize:2,font:{size:11},color:'#94a3b8'},grid:{color:'rgba(0,0,0,.07)'},angleLines:{color:'rgba(0,0,0,.07)'},pointLabels:{font:{size:12,weight:'600'},color:'#1e293b'}}},plugins:{legend:{display:false}}}}); }
  window.scrollTo({top:0,behavior:'smooth'});
  if(state.modo==='voz') setTimeout(function(){ falar('Sua pontuação final foi '+score+' pontos. '+av.classificacao+'. '+(av.resumo||''),null); },1000);
}

// Eventos
if ($sendBtn) $sendBtn.addEventListener('click', enviarRespostaChat);
if ($input) $input.addEventListener('keydown', function(e){ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();enviarRespostaChat();} });

// Inicializar
window.addEventListener('DOMContentLoaded', function() {
  if (!$selecao) return;
  state.vagaLink       = sessionStorage.getItem('vagaLink') || '';
  state.curriculoTexto = sessionStorage.getItem('curriculo_texto') || '';
  if (!state.vagaLink) {
    $selecao.innerHTML = '<div style="text-align:center;padding:40px 20px"><p style="font-size:2rem;margin-bottom:16px">⚠️</p><h2 style="color:var(--navy);margin-bottom:12px">Dados não encontrados</h2><p style="color:var(--muted);margin-bottom:24px;line-height:1.6">Para iniciar a simulação, preencha o modal na página inicial.</p><a href="index.html" style="display:inline-block;background:var(--navy);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700">← Voltar à página inicial</a></div>';
    return;
  }
  if (window.speechSynthesis) { speechSynthesis.getVoices(); speechSynthesis.addEventListener('voiceschanged', function(){ speechSynthesis.getVoices(); }); }
});

})();
