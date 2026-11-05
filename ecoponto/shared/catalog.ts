export interface WasteCategory {
  id: string;
  name: string;
  color: string;
  colorName: string;
  short: string;
  description: string;
  examples: string[];
  identify: string;
  accepted: string[];
  rejected: string[];
  prepare: string[];
  care: string;
}

export const categories: WasteCategory[] = [
  {
    id: "papel", name: "Papel e papelão", color: "#367BC4", colorName: "Azul", short: "Uma nova página para o que você já leu.",
    description: "Papéis e embalagens de fibras de celulose podem voltar ao ciclo produtivo quando o sistema local aceita o material e ele está seco, sem contaminação.",
    examples: ["Jornais e revistas", "Folhas de papel", "Caixas de papelão", "Embalagens de papel"],
    identify: "Observe a textura fibrosa do papel. Embalagens com plástico, metal ou revestimentos exigem orientação do receptor e não são equivalentes a papel puro.",
    accepted: ["Papel de escritório seco", "Jornais e revistas", "Caixas de papelão limpas"],
    rejected: ["Papel higiênico e guardanapo usado", "Papel engordurado", "Papel térmico, conforme o sistema local"],
    prepare: ["Mantenha seco e, quando possível, limpo.", "Retire restos de alimento e separe outros materiais.", "Desmonte as caixas para ocupar menos espaço."],
    care: "Papel molhado, oleoso ou contaminado pode comprometer a reciclagem. Confirme a aceitação de embalagens compostas no ponto escolhido."
  },
  {
    id: "plastico", name: "Plástico", color: "#D95850", colorName: "Vermelho", short: "Pequenas embalagens, grandes possibilidades.",
    description: "Plásticos são polímeros presentes em garrafas, potes e muitas embalagens. A possibilidade de reciclagem depende da resina, do formato e da infraestrutura local.",
    examples: ["Garrafas PET", "Sacolas", "Potes e embalagens", "Frascos de produtos de limpeza"],
    identify: "O triângulo de setas com número identifica a resina: 1 PET, 2 PEAD, 3 PVC, 4 PEBD, 5 PP, 6 PS e 7 outros. O símbolo não garante que o material será reciclado no seu município.",
    accepted: ["Garrafas PET", "Potes plásticos sem resíduos", "Frascos de limpeza comuns vazios, quando aceitos"],
    rejected: ["Embalagens de agrotóxicos ou químicos perigosos", "Materiais muito contaminados", "Plástico não aceito pelo receptor"],
    prepare: ["Esvazie completamente embalagens comuns.", "Remova resíduos com pouca água ou aproveite a água da lavagem.", "Separe conforme as orientações da cooperativa."],
    care: "Nunca trate embalagens contaminadas por substâncias perigosas como plástico comum. Elas precisam de destinação especializada."
  },
  {
    id: "vidro", name: "Vidro", color: "#39865B", colorName: "Verde", short: "Transparente no material. Circular no destino.",
    description: "Garrafas e embalagens de vidro podem ser recicladas. Espelhos, cerâmicas e vidros especiais têm composições diferentes e não devem ser misturados sem autorização.",
    examples: ["Garrafas", "Potes", "Frascos", "Embalagens de vidro"],
    identify: "Vidro de embalagem costuma ser rígido e transparente ou colorido. Não confunda com cristal, espelhos, louças, lâmpadas ou vidro de janela.",
    accepted: ["Garrafas de bebida", "Potes de alimento", "Frascos sem contaminação perigosa"],
    rejected: ["Espelhos e cristal", "Cerâmica e porcelana", "Lâmpadas e vidros especiais"],
    prepare: ["Retire restos de conteúdo e separe tampas.", "Mantenha embalagens inteiras quando possível.", "Se já estiver quebrado, acondicione de forma resistente e identifique ‘VIDRO QUEBRADO’."],
    care: "Não quebre vidro de propósito. Proteja quem coleta: fragmentos não podem ficar soltos em sacolas frágeis. Confirme se o ponto recebe vidro quebrado."
  },
  {
    id: "metal", name: "Metal", color: "#D8A724", colorName: "Amarelo", short: "Valor que continua, lata após lata.",
    description: "Metais como alumínio e aço podem ser recuperados por sistemas de reciclagem. A coleta de sucata, ferragens e objetos grandes pode exigir um receptor específico.",
    examples: ["Latinhas de alumínio", "Tampinhas", "Latas de alimentos", "Ferragens"],
    identify: "Metais têm brilho e resistência característicos. Aço pode ser atraído por ímã; alumínio não. Objetos com componentes eletrônicos ou químicos exigem avaliação específica.",
    accepted: ["Latas de alumínio e aço vazias", "Tampas metálicas", "Ferragens aceitas pelo receptor"],
    rejected: ["Latas com substâncias perigosas", "Cilindros pressurizados", "Pilhas e baterias na coleta comum"],
    prepare: ["Esvazie e remova resíduos das latas de alimento.", "Separe peças de outros materiais quando for seguro.", "Proteja bordas cortantes; não abra recipientes pressurizados."],
    care: "Não perfure aerossóis, cilindros ou recipientes com produtos químicos. Eles não devem ser tratados como latas comuns."
  },
  {
    id: "organicos", name: "Orgânicos", color: "#946147", colorName: "Marrom", short: "Da cozinha, de volta à natureza.",
    description: "Resíduos orgânicos de origem vegetal ou animal podem ser encaminhados à compostagem conforme o método e as regras da unidade de destino.",
    examples: ["Cascas de frutas", "Restos de verduras", "Borra de café", "Restos de alimentos"],
    identify: "São materiais biodegradáveis, sobretudo restos de alimentos e vegetais. Nem tudo o que é biodegradável é adequado a uma composteira doméstica.",
    accepted: ["Cascas de frutas e verduras", "Borra de café", "Folhas secas, conforme o método"],
    rejected: ["Plástico, vidro e metal", "Óleo de cozinha em composteira doméstica", "Carnes, laticínios e alimentos oleosos sem orientação técnica"],
    prepare: ["Separe na origem, sem misturar com embalagens.", "Use um recipiente fechado para transporte.", "Siga a proporção de materiais secos e úmidos indicada para a sua composteira."],
    care: "Restos de alimentos cozidos e resíduos animais dependem da estrutura de tratamento. Confirme o que o sistema escolhido aceita."
  },
  {
    id: "rejeitos", name: "Rejeitos", color: "#7C827B", colorName: "Cinza", short: "Separar também é reconhecer os limites.",
    description: "Rejeito é o material para o qual não há recuperação viável no sistema disponível. Não é sinônimo de todo resíduo: materiais recuperáveis devem ser separados antes.",
    examples: ["Papel higiênico usado", "Fraldas usadas", "Materiais contaminados irrecuperáveis", "Misturas não separáveis"],
    identify: "Considere a contaminação e a possibilidade de recuperação local. O que não é aceito em um lugar pode ter outro destino especializado.",
    accepted: ["Resíduos sanitários domésticos", "Materiais irrecuperáveis pela coleta local"],
    rejected: ["Recicláveis limpos", "Pilhas, químicos e eletrônicos", "Resíduos de saúde ou radioativos"],
    prepare: ["Separe os recicláveis e os resíduos especiais.", "Acondicione os rejeitos em saco resistente e fechado.", "Siga dias e regras da coleta municipal de resíduos comuns."],
    care: "A lixeira cinza não autoriza descartar resíduos perigosos. Consulte a prefeitura sobre o serviço municipal apropriado."
  },
  {
    id: "madeira", name: "Madeira", color: "#343D36", colorName: "Preto", short: "Antes do descarte, uma chance de reuso.",
    description: "Madeira, móveis e sobras de marcenaria podem ser reutilizados, doados ou encaminhados a unidades que recebem resíduos volumosos e madeira.",
    examples: ["Tábuas", "Pedaços de madeira", "Móveis", "Sobras de marcenaria"],
    identify: "Madeira natural, MDF, compensado e madeira tratada não são equivalentes. Tintas, colas e conservantes podem mudar a destinação.",
    accepted: ["Madeira natural em receptor habilitado", "Móveis para reuso", "Sobras aceitas pela unidade"],
    rejected: ["Madeira tratada sem aceitação explícita", "Móveis na coleta de embalagens", "Madeira contaminada por químicos"],
    prepare: ["Priorize reparo, doação ou reaproveitamento.", "Informe ao ponto o tipo e o volume.", "Proteja pregos e partes cortantes; não desmonte peças de forma insegura."],
    care: "Não queime madeira, especialmente a tratada ou pintada. Verifique limites de volume e regras para resíduos de construção."
  },
  {
    id: "saude", name: "Serviços de saúde", color: "#FFFFFF", colorName: "Branco", short: "Cuidado especial, do começo ao fim.",
    description: "Resíduos gerados em serviços de saúde, como hospitais e atendimento ambulatorial, podem envolver risco biológico, químico ou perfurocortante e exigem gerenciamento específico.",
    examples: ["Resíduos hospitalares", "Materiais de atendimento ambulatorial", "Perfurocortantes", "Materiais de serviços de saúde"],
    identify: "A origem e o risco determinam a classificação. A identificação deve seguir o plano de gerenciamento do serviço, não apenas a aparência do material.",
    accepted: ["Somente pelo sistema especializado e autorizado do gerador"],
    rejected: ["Qualquer material na coleta seletiva comum", "Perfurocortantes em sacos domésticos"],
    prepare: ["Siga o plano de gerenciamento e as orientações do serviço de saúde.", "Em uso doméstico de material médico, procure orientação da unidade de saúde responsável.", "Não abra recipientes nem manipule materiais desconhecidos."],
    care: "Exige coleta e tratamento específicos. O EcoPonto não oferece coleta comum para essa categoria; não descarte em lixeiras de recicláveis."
  },
  {
    id: "perigosos", name: "Perigosos", color: "#DE8A37", colorName: "Laranja", short: "O destino certo protege mais do que parece.",
    description: "Pilhas, baterias, produtos químicos e embalagens contaminadas podem oferecer risco à saúde e ao ambiente. Exigem logística reversa ou tratamento especializado conforme o material.",
    examples: ["Pilhas", "Baterias", "Produtos químicos", "Embalagens contaminadas"],
    identify: "Leia o rótulo, a orientação do fabricante e os pictogramas de perigo. O destino de uma pilha não é necessariamente o mesmo de uma bateria automotiva ou produto químico.",
    accepted: ["Apenas o material explicitamente aceito por receptor especializado"],
    rejected: ["Pilhas e químicos na coleta comum", "Baterias em lixeiras de metal", "Produtos perigosos no ralo ou no solo"],
    prepare: ["Não abra, perfure, desmonte, aqueça ou misture o material.", "Mantenha a identificação e siga a orientação do fabricante ou receptor.", "Se houver vazamento ou dano, não manipule: peça orientação especializada."],
    care: "A liberação de substâncias pode contaminar solo e água. A busca de pilhas mostra apenas pontos que declaram recebê-las; confirmar a aceitação antes de ir é essencial."
  },
  {
    id: "radioativos", name: "Radioativos", color: "#8962A3", colorName: "Roxo", short: "Gerenciamento estritamente especializado.",
    description: "Resíduos radioativos podem ser gerados em instalações nucleares, pesquisa, indústria e serviços de medicina nuclear. Seu gerenciamento é regulamentado e realizado por profissionais autorizados.",
    examples: ["Resíduos de medicina nuclear", "Materiais de pesquisa com radionuclídeos", "Resíduos de instalações nucleares"],
    identify: "A classificação depende de informação técnica e controle radiológico. O símbolo de radiação é um alerta de acesso restrito, nunca um convite a investigar.",
    accepted: ["Somente instalações autorizadas conforme a regulamentação aplicável"],
    rejected: ["Todo descarte em lixeiras comuns", "Coleta seletiva e ecopontos domésticos"],
    prepare: ["Não toque nem movimente objetos suspeitos.", "Mantenha distância e avise a instituição responsável.", "O acondicionamento e transporte cabem exclusivamente a profissionais autorizados."],
    care: "Não manipule nem descarte em lixeiras comuns. O EcoPonto não oferece pontos domésticos ou solicitações de coleta para essa categoria."
  }
];

export interface MaterialResult {
  label: string;
  category: string;
  terms: string[];
  note?: string;
  mapMaterial?: string;
}

export const materials: MaterialResult[] = [
  { label: "Pilhas e baterias portáteis", category: "perigosos", terms: ["pilha", "pilhas", "bateria", "baterias", "bateria portatil"], mapMaterial: "batteries" },
  { label: "Bateria automotiva", category: "perigosos", terms: ["bateria de carro", "bateria automotiva", "bateria chumbo"], mapMaterial: "car_batteries", note: "Não é equivalente a uma pilha doméstica. Procure revenda ou receptor que declare aceitar baterias automotivas." },
  { label: "Garrafas PET", category: "plastico", terms: ["pet", "garrafa pet", "garrafas pet", "garrafa plastica"] },
  { label: "Papel e papelão", category: "papel", terms: ["papelao", "papel", "caixa", "jornal", "revista", "folha"] },
  { label: "Óleo de cozinha usado", category: "especial", terms: ["oleo", "oleo de cozinha", "oleo usado"], mapMaterial: "cooking_oil", note: "Depois de esfriar, acondicione em recipiente resistente e bem fechado. Não jogue em pias, vasos sanitários ou no solo. Não misture com óleo lubrificante. Leve a um receptor que aceite óleo de cozinha; não vai na composteira doméstica." },
  { label: "Garrafas e potes de vidro", category: "vidro", terms: ["vidro", "garrafa de vidro", "pote de vidro", "vidro quebrado"] },
  { label: "Latas e metais", category: "metal", terms: ["metal", "lata", "latinha", "aluminio", "tampinha", "ferragem"] },
  { label: "Embalagens plásticas", category: "plastico", terms: ["plastico", "sacola", "pote plastico", "frasco", "embalagem plastica"] },
  { label: "Restos vegetais e alimentos", category: "organicos", terms: ["organico", "casca", "fruta", "verdura", "cafe", "borra de cafe", "restos de alimento", "comida"] },
  { label: "Rejeitos domésticos", category: "rejeitos", terms: ["rejeito", "fralda", "papel higienico", "guardanapo usado"] },
  { label: "Madeira e móveis", category: "madeira", terms: ["madeira", "movel", "moveis", "tabua", "mdf"] },
  { label: "Resíduos de serviços de saúde", category: "saude", terms: ["saude", "hospital", "seringa", "agulha", "ambulatorial"] },
  { label: "Produtos químicos perigosos", category: "perigosos", terms: ["perigoso", "quimico", "solvente", "agrotoxico"] },
  { label: "Resíduos radioativos", category: "radioativos", terms: ["radioativo", "nuclear", "radiacao"] }
];

export function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export function searchMaterials(value: string): MaterialResult[] {
  const q = normalize(value);
  if (q.length < 2) return [];
  const exact = materials.filter(item => item.terms.some(term => normalize(term) === q));
  if (exact.length) return exact;
  return materials.filter(item => normalize(item.label).includes(q) || item.terms.some(term => normalize(term).includes(q) || q.includes(normalize(term)))).slice(0, 6);
}

export const sourceLinks = [
  { name: "CONAMA 275/2001 — código de cores", url: "https://www.legisweb.com.br/legislacao/?id=97507" },
  { name: "SINIR — pilhas e baterias", url: "https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/pilhas-e-baterias/" },
  { name: "OpenStreetMap — informações sobre pontos de reciclagem", url: "https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling" }
];
