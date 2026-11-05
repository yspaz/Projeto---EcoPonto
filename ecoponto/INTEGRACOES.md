# EcoPonto — integrações e operação

## Fontes do guia e mapa
O código das dez cores segue a Resolução CONAMA 275/2001, consultada em https://www.legisweb.com.br/legislacao/?id=97507. Azul representa papel/papelão; vermelho plástico; verde vidro; amarelo metal; preto madeira; laranja perigosos; branco ambulatoriais e saúde; roxo radioativos; marrom orgânicos e cinza não recicláveis ou misturados/contaminados irrecuperáveis.

A orientação de devolução de pilhas e baterias a pontos de entrega e os riscos à água e ao solo foram conferidos no SINIR: https://sinir.gov.br/perfis/logistica-reversa/logistica-reversa/pilhas-e-baterias/. O portal oferece acesso ao localizador de logística reversa em https://sistema.gmclog.com.br/info/green. As métricas históricas dessa página não são usadas como indicadores atuais do EcoPonto.

O mapa usa OpenStreetMap, Nominatim para busca manual de endereços no Brasil e Overpass para obter objetos `amenity=recycling`. Documentação lida: https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drecycling. `recycling:* = yes` informa aceitação específica. Uma pilha doméstica não equivale a uma bateria automotiva. Os resultados não são uma lista nacional completa ou uma verificação presencial: materiais, endereços e horários podem estar ausentes ou desatualizados. O aplicativo identifica a fonte, oferece links de conferência e não inventa dados ausentes.

## Funcionalidades persistentes
Servidor Express/tRPC e banco MySQL gerenciado do Manus. Usuários se identificam pelo OAuth do starter. Os cookies de aplicação preservam SameSite=None e Secure para Preview HTTPS. As migrações adicionam as tabelas do produto; nenhuma entidade ou estatística fictícia é inserida como dado real.

Solicitações de coleta e propostas de parceria são registros reais no aplicativo, mas isso não equivale a envio para um transportador. Datas são preferências, não disponibilidade confirmada. Não existe transportador ou calendário externo configurado nesta versão. A integração de operador deve autenticar o parceiro, confirmar sua aceitação e agenda e atualizar o status somente após confirmação real. A interface não permite confirmar sem essa integração.

Ações sustentáveis são autodeclaradas e começam pendentes. Apenas revisão administrativa autorizada concede pontos e contabiliza massa. Indicadores mostram a massa validada no aplicativo, não medição independente; não há estimativa de CO2. Valores de referência não são tratados como resultados reais.

## Administração e dados de contato
O papel admin é controlado pelo backend e pelo dono autenticado do projeto no starter, não por seleção de papel no browser. Parceiros precisam de avaliação de evidência/origem, endereço e materiais. Coordenadas não são geradas a partir de suposições.

E-mail, telefone e perfis sociais do responsável não foram fornecidos. A página de contato explica essa ausência e aponta para o cadastro de parceiros e sugestões. Não são criados canais falsos nem enviados e-mails a terceiros. Para operar publicamente, o responsável deve informar os canais oficiais e política de atendimento, conectar transportadores/agendas e revisar o uso e atualização das fontes de dados abertas. Nominatim e Overpass públicos têm limites e não oferecem SLA: ampliar operação pede uma fonte com capacidade contratada ou instância própria. Buscas manuais, cache e limitação de chamadas reduzem carga; erros são exibidos claramente.
