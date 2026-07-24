/* ============================================================================
   SOFTWIKI — MANUAL DO CARTÓRIO
   script.js
   ----------------------------------------------------------------------------
   Organização deste arquivo:
   1. Dados (SEED_TOPICS) — anotações originais, somente leitura
   2. Estado da aplicação
   3. Busca e filtragem
   4. Renderização (filtros, grade de cartões, conteúdo do modal)
   5. Persistência (window.storage) — tópicos adicionados pela equipe
   6. Formulário de novo tópico
   7. Comportamentos dinâmicos de UI (header ao rolar, botão voltar ao topo)
   8. Inicialização
   ============================================================================ */

/* ============================================================================
   1. DADOS
   ============================================================================ */
const CATEGORIES = [
  "Sistema", "Selos", "Cartório/Documentos", "Rede/Infraestrutura",
  "Banco de Dados", "Imobiliário", "Protesto", "Parametros", "Linux"
];

const SEED_TOPICS = [
  {
    id: "seed-01", category: "Sistema",
    title: "Sistema não está abrindo",
    summary: "Copiar o arquivo de configuração do sistema para a máquina local.",
    content: { type:"steps", items:[
      "Vá em Local do arquivo → Config e localize o caminho do sistema.",
      "Copie esse arquivo para a máquina do usuário.",
      "Cole o arquivo na área de trabalho."
    ]}
  },
  {
    id: "seed-02", category: "Selos",
    title: "Cancelar selo",
    summary: "Fluxo completo para inutilizar um selo, com ou sem envio ao TJ.",
    content: { type:"steps", items:[
      "Verifique o número do selo — apenas o número da prenotação já cancela a prenotação e a busca.",
      "No sistema Caixa, inutilize o selo (com reembolso).",
      "Pesquise o selo em Manutenção Lote → Lotes Importados. Clique no selo e, após localizá-lo como inutilizado, clique em Registro e apague o ID e o código.",
      "Confirme no sistema se o selo foi realmente cancelado."
    ]},
    note: "Se o selo já foi enviado ao TJ, o cancelamento depende dessa etapa. Se não foi enviado, o cancelamento acontece só pelo caixa, e o selo muda de Disponível para Inutilizado."
  },
  {
    id: "seed-03", category: "Cartório/Documentos",
    title: "Cadastrar minuta de escritura — Tabelionato de Notas",
    summary: "Importar a minuta em .rtf e inserir os parâmetros do ato.",
    content: { type:"steps", items:[
      "Baixe o arquivo da minuta no formato .rtf.",
      "Vá em Minuta → Incluir → Importar a minuta.",
      "Corrija a minuta para inserir os parâmetros: use Ctrl+U → Global → escolha o parâmetro.",
      "Adicione os parâmetros necessários: Outorgado, Outorgante, Valor do ato, Data da lavratura (modelo 5), Qualificação do Outorgado, Qualificação do Outorgante e procuradores, se houver.",
      "Formate o texto."
    ]},
    note: "As cláusulas são adicionadas manualmente pelo usuário — não fazem parte da importação automática."
  },
  {
    id: "seed-04", category: "Rede/Infraestrutura",
    title: "Instalar aplicativos na máquina local",
    summary: "Preparar uma máquina nova com o Softwiki, DLLs e Pegasus.",
    content: { type:"steps", items:[
      "Entre no servidor e copie o endereço IP. (Se provimentado://172.16.1.100)",
      "Na máquina do cliente, abra esse endereço IP pela rede, copie a pasta do sistema local e renomeie a cópia para \"Softwiki\".",
      "Copie as DLLs e o instalador do Pegasus para a máquina do cliente e instale o Pegasus.",
      "Copie as DLLs para as pastas SysWOW64 e System32.",
      "Execute como administrador o arquivo \"caixa\" nas pastas SysWOW64 e System32.",
      "Coloque os aplicativos na área de trabalho e renomeie-os.",
      "Execute como administrador todos os aplicativos que serão usados no cartório."
    ]}
  },
  {
    id: "seed-05", category: "Selos",
    title: "Erro ao redimensionar selo",
    summary: "Baixar selos no site do SEE e reimportar no sistema Caixa.",
    content: { type:"steps", items:[
      "Acesse o site do SEE e faça login na conta do usuário.",
      "Busque pelos selos e baixe todos para a máquina.",
      "No sistema Caixa, vá em Importar e importe os selos baixados.",
      "Vá em Manutenção de Lotes → Lotes Importados e redimensione os selos.",
      "Verifique se não consta nenhum selo já enviado no lote.",
      "Se caso não for esse erro, pode ser que tenha pulado sequencia no lote do selo: Duplicar o ultimo selo enviado no selo vazio e enviar. Depois inutilizar o selo gerado"
    ]},
    note: "Isso ocorre quando o sistema não importa o lote de selos e ele fica zerado no site do SEE. Caso"
    
  },
  {
    id: "seed-06", category: "Selos",
    title: "Erro ao exportar selo",
    summary: "Geralmente é nome do serventuário ou agrupador em branco/incorreto.",
    content: { type:"text", body:
      "Costuma ocorrer quando o Nome do Serventuário (ou nome civil) está composto de forma incorreta ou em branco, ou quando o Número do agrupador está em branco. Corrija esses dados no cadastro e envie o selo novamente."
    }
  },
  {
    id: "seed-07", category: "Cartório/Documentos",
    title: "Alterar folha de livro quando é pulado",
    summary: "Corrigir livro/termo e folha direto na tela do pedido.",
    content: { type:"steps", items:[
      "Clique com o botão direito na tela e selecione \"Alterar dados do pedido\".",
      "Informe o livro/termo e as folhas corretas.",
      "Atualize também o andamento do livro."
    ]}
  },
  {
    id: "seed-08", category: "Cartório/Documentos",
    title: "Texto da matrícula com espaçamento errado",
    summary: "Corrigir o espaçamento do parágrafo ao digitar na matrícula.",
    content: { type:"steps", items:[
      "Clique com o botão direito no texto.",
      "Vá em Parágrafo.",
      "Defina o espaçamento como simples."
    ]}
  },
  {
    id: "seed-09", category: "Banco de Dados",
    title: "Erro no RTD — sequência",
    summary: "Correção direta nas tabelas S e N do banco.",
    content: { type:"text", body: "Corrija no banco de dados as tabelas S e N para restabelecer a sequência do RTD." }
  },
  {
    id: "seed-10", category: "Banco de Dados",
    title: "Erro na sequência do livro de óbito",
    summary: "Ajustar o número atual na tabela a_termo_obito.",
    content: { type:"text", body: "Corrija no banco de dados a tabela a_termo_obito, ajustando o número atual da sequência." }
  },
  {
    id: "seed-11", category: "Rede/Infraestrutura",
    title: "Senha para conectar na rede",
    summary: "Credenciais padrão para cartórios provimentados.",
    content: { type:"text", body: "Usuário: <span class=\"mono\">----</span> &nbsp;·&nbsp; Servidor: <span class=\"mono\">----</span>" },
    note: "Credencial de uso interno da equipe técnica — não compartilhar fora do time.",
    tags: ["credenciais", "login", "provimentado"]
  },
  {
    id: "seed-12", category: "Imobiliário",
    title: "Erro DOI — tipo de operação imobiliária",
    summary: "Conferir o número no site, formatar o JSON e corrigir o ato.",
    content: { type:"steps", items:[
      "Pegue o arquivo e verifique o número constante no site.",
      "Formate o arquivo JSON.",
      "Verifique qual arquivo contém aquele número.",
      "Altere o ato correspondente no sistema."
    ]}
  },
  {
    id: "seed-13", category: "Linux",
    title: "Verificar funcionamento do servidor",
    summary: "Testar a resposta do servidor continuamente com ping.",
    content: { type:"text", body: "Execute <span class=\"mono\">ping (endereço) -t</span> para monitorar a resposta do servidor continuamente." }
  },
  {
    id: "seed-14", category: "Protesto",
    title: "Anotações de Protesto — fluxo completo",
    summary: "Do apontamento à intimação, e as diferenças entre liquidação, desistência e cancelamento.",
    content: { type:"sections", sections: [
      { heading:"Título importado da CRA", body:
        "Ao importar o título dentro do sistema, já é gerado o número de apontamento e um arquivo para subir novamente à CRA, informando que o título foi apontado e recebeu um número de protocolo." },
      { heading:"Depois do apontamento", body:
        "Vá à tela de Apontamento e Intimação para intimar os apontamentos e gerar as intimações. A partir daí, o sistema conta 3 dias úteis para o título poder ser protestado." },
      { heading:"Se o cliente pagar ou o credor desistir", body:
        "Use a tela de cancelamento para desistir ou liquidar o título. Se o credor desistir de intimar, a desistência também é feita na tela de cancelamento. Se for necessário protestar, use a tela de protesto." },
      { heading:"Liquidação (pagamento)", body:
        "O devedor paga a dívida direto no cartório de protesto, dentro do prazo do edital/intimação, antes de o protesto acontecer. O cartório repassa o valor ao credor e o nome do devedor continua limpo." },
      { heading:"Desistência (retirada)", body:
        "O credor retira o título antes do registro do protesto — normalmente porque o devedor já pagou por fora (Pix, boleto próprio) ou fecharam um acordo. O cartório cancela o processo e devolve o título ao credor." },
      { heading:"Cancelamento", body:
        "Acontece depois que o protesto já foi registrado. O devedor paga a dívida direto ao credor, que fornece uma carta de anuência. O devedor (ou o credor) leva essa anuência ao cartório, paga as taxas de cancelamento, e o nome sai dos cadastros de restrição (Serasa/SPC)." }
    ],
    table: {
      headers:["Situação","Quando ocorre","Quem resolve no cartório","O protesto chegou a existir?"],
      rows:[
        ["Liquidação","Antes do protesto","Devedor (pagando no cartório)","Não"],
        ["Desistência","Antes do protesto","Credor (retirando o título)","Não"],
        ["Cancelamento","Depois do protesto","Devedor ou credor (comprovando pagamento)","Sim — precisa ser baixado, com taxas de averbação"]
      ]
    }}
  },
  {
    id: "seed-15", category: "Linux",
    title: "Verificar Firebird",
    summary: "Acessar via PuTTY e identificar a versão pelo arquivo security4.fdb.",
    content: { type:"steps", items:[
      "Pegue as credenciais de login e senha.",
      "Acesse o servidor via PuTTY.",
      "Na pasta <span class=\"mono\">/opt/firebird</span>, verifique se existe o arquivo <span class=\"mono\">security4.fdb</span> — se existir, a versão é a 4."
    ]}
  },
  {
    id: "seed-16", category: "Parametros",
    title: "Caixa não mostra os selos do sistema",
    summary: "Vincular o número do sistema na tela Cartório.",
    content: { type:"steps", items:[
      "Vá em Principal → Cartório.",
      "Informe o número do sistema."
    ]}
  }
];

/* ============================================================================
   2. ESTADO DA APLICAÇÃO
   ============================================================================ */
const STORAGE_KEY = "custom_topics";

let customTopics = [];          // tópicos adicionados pela equipe (carregados do storage)
let activeCategory = "Todos";   // filtro de categoria selecionado
let searchTerm = "";            // termo de busca atual

const gridEl = document.getElementById("grid");
const filtersEl = document.getElementById("filters");
const resultCountEl = document.getElementById("resultCount");
const searchInput = document.getElementById("searchInput");

/* ============================================================================
   3. BUSCA E FILTRAGEM
   ============================================================================ */
function getAllTopics(){
  return [...SEED_TOPICS, ...customTopics];
}

/**
 * Achata todo o texto pesquisável de um tópico (título + resumo + conteúdo + tags)
 * para permitir busca por qualquer palavra do conteúdo, não só do título.
 */
function flattenTopicText(topic){
  let parts = [topic.title, topic.summary, topic.category, ...(topic.tags||[])];
  const c = topic.content;
  if (c.type === "steps") parts.push(...c.items);
  if (c.type === "text") parts.push(c.body);
  if (c.type === "sections") c.sections.forEach(s => parts.push(s.heading, s.body));
  return parts.join(" ").toLowerCase();
}

function getFilteredTopics(){
  const term = searchTerm.trim().toLowerCase();
  return getAllTopics().filter(topic => {
    const matchesCategory = activeCategory === "Todos" || topic.category === activeCategory;
    const matchesSearch = term === "" || flattenTopicText(topic).includes(term);
    return matchesCategory && matchesSearch;
  });
}

/* ============================================================================
   4. RENDERIZAÇÃO
   ============================================================================ */
function renderFilters(){
  const all = ["Todos", ...CATEGORIES];
  filtersEl.innerHTML = "";
  all.forEach(cat => {
    const chip = document.createElement("div");
    chip.className = "chip" + (cat === activeCategory ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      activeCategory = cat;
      renderFilters();
      renderGrid();
    });
    filtersEl.appendChild(chip);
  });
}

function renderGrid(){
  const topics = getFilteredTopics();
  gridEl.innerHTML = "";
  resultCountEl.textContent = topics.length === 1
    ? "1 tópico encontrado"
    : `${topics.length} tópicos encontrados`;

  if (topics.length === 0){
    gridEl.innerHTML = `
      <div class="empty-state">
        <strong>Nenhum resultado encontrado</strong>
        Tente outra palavra-chave ou limpe os filtros de categoria.
      </div>`;
    return;
  }

  topics.forEach((topic, index) => {
    const isCustom = topic.id.startsWith("custom-");
    const proto = isCustom
      ? `Nº C-${topic.id.slice(-4)}`
      : `Nº ${String(index+1).padStart(3,"0")}`;

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.source = isCustom ? "custom" : "seed";
    // Escalona a animação de entrada dos cards (efeito "cartões sendo colocados na mesa").
    card.style.setProperty("--d", `${Math.min(index * 40, 400)}ms`);
    card.innerHTML = `
      <div class="card-top">
        <span class="card-proto">${proto}</span>
        <span class="card-tag">${topic.category}</span>
      </div>
      <h3>${topic.title}</h3>
      <p class="summary">${topic.summary}</p>
      <div class="card-bottom">Ver procedimento completo →</div>
    `;
    card.addEventListener("click", () => openViewModal(topic));
    gridEl.appendChild(card);
  });
}

function renderContentHTML(topic){
  const c = topic.content;
  let html = "";

  if (c.type === "steps"){
    html += "<ol>" + c.items.map(step => `<li>${step}</li>`).join("") + "</ol>";
  }
  if (c.type === "text"){
    html += `<p>${c.body}</p>`;
  }
  if (c.type === "sections"){
    c.sections.forEach(s => {
      html += `<h4>${s.heading}</h4><p>${s.body}</p>`;
    });
    if (c.table){
      html += `<h4>Resumo</h4><table class="modal-table"><thead><tr>` +
        c.table.headers.map(h => `<th>${h}</th>`).join("") + "</tr></thead><tbody>" +
        c.table.rows.map(r => "<tr>" + r.map(cell => `<td>${cell}</td>`).join("") + "</tr>").join("") +
        "</tbody></table>";
    }
  }
  if (topic.note){
    html += `<div class="modal-note">${topic.note}</div>`;
  }
  return html;
}

function openViewModal(topic){
  const isCustom = topic.id.startsWith("custom-");

  document.getElementById("viewProto").textContent = isCustom ? "registro adicionado pela equipe" : "registro original";
  document.getElementById("viewTitle").textContent = topic.title;
  document.getElementById("viewTag").textContent = topic.category;
  document.getElementById("viewBody").innerHTML = renderContentHTML(topic);

  const actionsEl = document.getElementById("viewActions");
  actionsEl.innerHTML = "";
  if (isCustom){
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-ghost";
    delBtn.textContent = "Excluir tópico";
    delBtn.addEventListener("click", () => deleteCustomTopic(topic.id));
    actionsEl.appendChild(delBtn);
  }

  document.getElementById("viewOverlay").classList.add("show");
}

function closeViewModal(){
  document.getElementById("viewOverlay").classList.remove("show");
}

/* ============================================================================
   5. PERSISTÊNCIA (window.storage)
   Os tópicos adicionados pela equipe são salvos com shared:true, ou seja,
   ficam visíveis para todos que abrirem este mesmo manual.
   ============================================================================ */
async function loadCustomTopics(){
  try{
    const result = await window.storage.get(STORAGE_KEY, true);
    customTopics = result ? JSON.parse(result.value) : [];
  } catch (err){
    // Chave inexistente ou storage indisponível: começa com lista vazia.
    customTopics = [];
  }
}

async function saveCustomTopics(){
  try{
    const result = await window.storage.set(STORAGE_KEY, JSON.stringify(customTopics), true);
    if (!result){
      alert("Não foi possível salvar o tópico agora. Ele ficará visível só nesta sessão.");
    }
  } catch (err){
    alert("Não foi possível salvar o tópico agora. Ele ficará visível só nesta sessão.");
  }
}

async function deleteCustomTopic(id){
  if (!confirm("Excluir este tópico para toda a equipe?")) return;
  customTopics = customTopics.filter(t => t.id !== id);
  await saveCustomTopics();
  closeViewModal();
  renderGrid();
}

/* ============================================================================
   6. FORMULÁRIO DE NOVO TÓPICO
   ============================================================================ */
function populateCategorySelect(){
  const select = document.getElementById("fCategory");
  select.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("");
}

function openAddModal(){
  document.getElementById("topicForm").reset();
  document.getElementById("formOverlay").classList.add("show");
}
function closeAddModal(){
  document.getElementById("formOverlay").classList.remove("show");
}

async function handleFormSubmit(e){
  e.preventDefault();
  const title = document.getElementById("fTitle").value.trim();
  const category = document.getElementById("fCategory").value;
  const summary = document.getElementById("fSummary").value.trim();
  const rawSteps = document.getElementById("fContent").value.trim();

  // Cada linha digitada vira um passo da lista ordenada.
  const items = rawSteps.split("\n").map(s => s.trim()).filter(Boolean);

  const newTopic = {
    id: "custom-" + Date.now(),
    category, title, summary,
    content: { type:"steps", items }
  };

  customTopics.push(newTopic);
  await saveCustomTopics();
  closeAddModal();
  renderGrid();
}

/* ============================================================================
   7. COMPORTAMENTOS DINÂMICOS DE UI
   - Cabeçalho encolhe e ganha sombra ao rolar a página.
   - Botão "voltar ao topo" aparece após rolar um pouco.
   ============================================================================ */
function setupScrollBehaviors(){
  const headerEl = document.querySelector("header.top");
  const backTopBtn = document.getElementById("backTop");

  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 40;
    headerEl.classList.toggle("scrolled", scrolled);
    backTopBtn.classList.toggle("show", window.scrollY > 400);
  }, { passive: true });

  backTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============================================================================
   8. LIGAÇÃO DE EVENTOS E INICIALIZAÇÃO
   ============================================================================ */
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderGrid();
});

document.getElementById("openAddBtn").addEventListener("click", openAddModal);
document.getElementById("cancelAdd").addEventListener("click", closeAddModal);
document.getElementById("formClose").addEventListener("click", closeAddModal);
document.getElementById("topicForm").addEventListener("submit", handleFormSubmit);

document.getElementById("viewClose").addEventListener("click", closeViewModal);
document.getElementById("viewOverlay").addEventListener("click", (e) => {
  if (e.target.id === "viewOverlay") closeViewModal();
});
document.getElementById("formOverlay").addEventListener("click", (e) => {
  if (e.target.id === "formOverlay") closeAddModal();
});

async function init(){
  populateCategorySelect();
  renderFilters();
  setupScrollBehaviors();
  gridEl.innerHTML = `<div class="empty-state"><strong>Carregando...</strong>Buscando tópicos salvos pela equipe.</div>`;
  await loadCustomTopics();
  renderGrid();
}

init();
