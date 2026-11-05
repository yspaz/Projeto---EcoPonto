# EcoPonto — plano de implementação

## Produto e escopo
O EcoPonto será um site responsivo em português brasileiro para identificar resíduos, aprender sua preparação e encontrar descarte adequado no Brasil. A página inicial preservará o título “O descarte correto começa com uma escolha.”, o subtítulo do briefing, a pesquisa “O que você deseja descartar?”, os dois CTAs principais e cards clicáveis das dez categorias. O slogan será “Descarte consciente, futuro sustentável.” e a frase do rodapé “Pequenas atitudes, grandes transformações.”.

A navegação terá menu hambúrguer no canto superior esquerdo, barra lateral, e links para Pontos de Coleta e Guia de Resíduos. Também haverá acesso às solicitações, recompensas, impacto, parceiros, sobre e contato. As categorias terão páginas próprias com nome e cor oficial, imagem ilustrativa, definição, exemplos, identificação, materiais aceitos e excluídos, preparo, cuidados e acesso ao mapa filtrado. A pesquisa reconhecerá os exemplos do briefing e termos normalizados, sem fingir conhecimento ilimitado: resultados desconhecidos receberão orientação clara. Óleo de cozinha receberá orientação própria e nunca será apresentado como orgânico compostável ou despejável no ralo.

As dez categorias são papel/papelão azul, plástico vermelho, vidro verde, metal amarelo, orgânicos marrom, rejeitos cinza, madeira preto, serviços de saúde branco, perigosos laranja e radioativos roxo. Perigosos não terão instruções de abertura ou manipulação. Serviços de saúde e radioativos informarão a exigência de tratamento especializado e não poderão ser solicitados pela coleta comum.

## Implementação e dependências
Usar o starter já instalado React/TypeScript/Vite, Wouter para rotas, Lucide para ícones e componentes acessíveis do template. Ativar servidor Express/tRPC e banco MySQL gerenciado do Manus antes dos módulos persistentes. Preservar o fluxo OAuth fornecido para identificação do usuário em solicitações e recompensas e cookies compatíveis com Preview HTTPS. O servidor e o frontend serão servidos juntos, usando o Dockerfile do template e health endpoint. Nenhuma chave privada será exposta no browser.

O mapa será Leaflet com cartografia OpenStreetMap e atribuição. A busca de localização e consulta de pontos reais utilizarão fontes abertas (Nominatim e Overpass), mediadas pelo servidor, com limites, timeout, cache curto e mensagens de falha. Usar busca por cidade/estado/bairro/CEP e geolocalização somente mediante autorização. Apenas pontos existentes no retorno da fonte serão exibidos; materiais aceitos somente quando explicitamente declarados, sem inferir pilhas, óleo ou eletrônicos de um ponto genérico. Endereço incompleto, horários ausentes e precisão/limitação da cobertura serão indicados. Distância será calculada em linha reta quando houver origem. Rotas serão abertas em serviço externo. O formulário de sugestão estará disponível quando não houver resultados. Cadastros de parceiros e sugestões ficarão pendentes de verificação e não serão publicados automaticamente como locais confiáveis.

Solicitações de coleta serão persistidas no banco com material, endereço, data preferencial, identificação do solicitante e status inicial aguardando análise. Só pontos que declarem coleta e disponibilidade real poderão oferecer agendamento confirmado. Enquanto não houver operador e agenda externa conectados, informar claramente que registrar uma solicitação não confirma nem envia uma coleta. A data escolhida será preferencial, nunca ficticiamente “disponível”. Mostrar histórico e status. Não aceitar resíduos radioativos ou de saúde pela coleta comum.

O programa de recompensas permitirá registrar ações sustentáveis e acompanhar histórico; registros iniciarão pendentes, sem pontos por mera autodeclaração. Pontos, níveis e conquistas dependerão de ações validadas por administrador autorizado. O dashboard usará dados reais do aplicativo: pontos verificados, solicitações e massas validadas, começando em zero. Não estimar CO2 ou impacto sem dados/fatores documentados. Uma interface administrativa restrita ao papel admin permitirá analisar registros, validar ações com massa e aprovar/rejeitar parceiros. Cadastros públicos serão validados por campos, não serão fontes de coordenadas inventadas.

Conteúdo e fontes serão apresentados no guia e sobre. Contato e redes sociais, que não foram fornecidos, não serão inventados: haverá uma área de contato com aviso e canais institucionais de referência, além de botão de compartilhar o projeto. A operação real com transportadores, disponibilidade externa e canais de contato/redes próprias precisa ser configurada pelo responsável, com indicação no produto e documentação.

## Estrutura do projeto
- `client/src/pages/`: início, guia, categoria, mapa, solicitações/recompensas, impacto, parceiros e institucional.
- `client/src/components/`: identidade visual, navegação lateral, pesquisa de materiais, cards, mapa e formulários compartilhados.
- `shared/`: catálogo das dez categorias, materiais pesquisáveis e tipos compartilhados.
- `server/routers.ts` e módulos `server/`: API do mapa, solicitações, parceiros, recompensas e administração, com validação e autenticação.
- `drizzle/schema.ts` e migrações: usuários, solicitações, ações, pontos propostos/verificados.
- `client/public/`: favicon, manifesto de rotas e recursos de interface; imagens próprias no armazenamento gerenciado.
- `TODO.md`: outcomes do briefing com critérios completos e status.
- `INTEGRACOES.md`: fontes de dados e configurações operacionais ainda necessárias, sem segredos.

## Design — sustentabilidade editorial contemporânea
Reusar a direção visual dada pelo usuário, com a estética de produto editorial ecológico. Os princípios são hierarquia legível, espaçamento generoso, utilidade antes da decoração e cor como identificação do material. A cor #F2DDBF será predominante, com verde-floresta #194B38 como assinatura e tons creme nas superfícies. O bege transmite proximidade e o verde transmite cuidado; cores oficiais aparecem em pontos, bordas e ícones das categorias sem comprometer o contraste.

O layout terá uma hero assimétrica: conteúdo e pesquisa à esquerda, ilustração própria de reciclagem e elementos naturais à direita; abaixo, uma faixa contextual e catálogo de materiais. Páginas internas usarão cabeçalhos editoriais e cartões funcionais, com mapa ao lado dos resultados no desktop e empilhamento no mobile. Elementos de assinatura: wordmark com símbolo de folha/pin, pequenas cápsulas com ícones e linhas orgânicas discretas. O logo será uma marca própria que combina a ideia de ponto e folha, com EcoPonto em peso firme.

Tipografia: Manrope para títulos e interface e DM Sans para textos corridos, com pesos 400–700, título hero de aproximadamente 64 px no desktop e 38 px no mobile. Os textos serão diretos, brasileiros e acolhedores, por exemplo “Cada material tem um destino.” e “Encontre o lugar certo para o que você não usa mais.”. A marca é um guia confiável que conecta pessoas ao descarte consciente: acessível, responsável e otimista.

Botões e cards terão transições de 160–220 ms; hover discreto e mudança de cor, sem animações incessantes. Navegação lateral terá transição suave e foco acessível. Respeitar `prefers-reduced-motion`, teclado, labels, estados de erro/carregamento e contraste. Em celular, preservar áreas de toque, evitar overflow e oferecer o mesmo conjunto de funções.

## Restrições materiais
Não existe uma base nacional completa e previamente fornecida no briefing, nem transportador, agenda, canais de contato ou redes sociais próprias informados. A cobertura dos dados abertos e os materiais declarados variam. Exibir essas limitações junto das funcionalidades; não preencher vazios com locais, métricas, datas ou confirmações fictícias. Recursos persistentes usam o banco e o login reais, enquanto operação externa ficará explicitamente pendente de configuração.
