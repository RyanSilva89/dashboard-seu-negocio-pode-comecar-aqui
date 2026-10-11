# TODO — Seu site pode começar aqui

## Resultados aprovados no Blueprint

- [x] **Navegação lateral responsiva:** implementar os módulos Dashboard, Leads, CRM, Agendamentos, Meus projetos, Cobrar clientes, Ranking, Templates, Seja um afiliado e Criar site, refletindo a hierarquia da referência sem reproduzir a marca ou os ativos da LeadSite.
- [x] **Dashboard inicial:** mostrar resumo dos leads, distribuição por status, prioridades provisórias, oportunidades hipotéticas e próximos passos de análise.
- [x] **Base inicial de leads:** incluir Clínica Campinas Fisioterapia, FISIO Campinas, CEFOR Fisio, Fisiomed — Dr. Pablo Garcia, CPA Fisio, Clínica Bebê em Movimento, Fisioterapia Santa Teresinha, Clínica Ortovida, Clínica Fisio LT e Clínica Alahmar.
- [x] **Lista pesquisável e filtrável:** permitir busca por clínica e filtros por status do site, oportunidade de oferta, prioridade provisória e disponibilidade de evidências ou fontes.
- [x] **Fichas detalhadas e rastreáveis:** mostrar site, contato público, endereço, evidências, fontes, data de consulta e notas de confiança, preservando a rastreabilidade dos dados públicos disponíveis no relatório da tarefa.
- [x] **Oportunidades como hipóteses:** apresentar serviços possíveis — melhoria de site, landing page, automação de contato e apresentação visual de Instagram — explicitamente como hipóteses a validar, sem afirmar falhas comprovadas ou intenção de compra.
- [x] **CRM visual interno:** permitir organizar estágio, prioridade provisória, anotações e acompanhamento interno dos leads, sem envio de mensagens ou contato automatizado.
- [x] **Módulos não-operacionais claramente sinalizados:** marcar como demonstração/placeholder os módulos sem operação real, especialmente Agendamentos, Cobrar clientes, Templates, Seja um afiliado e Criar site, sem booking externo, pagamentos, publicação social ou transações.
- [x] **Projetos e ranking demonstrativos:** mostrar Meus projetos e Ranking em modo demonstrativo para visualizar organização de trabalhos e critérios de priorização, sem alegar dados operacionais reais.
- [x] **Layout responsivo e seguro:** adaptar a experiência para desktop e celular, manter tabelas ou cartões legíveis, navegação compactável, estados vazios e avisos de limitações; não publicar o app publicamente de forma automática.
- [x] **Marca ampla, base atual explícita:** usar o nome “Seu site pode começar aqui”, sem restringir a identidade a Campinas, e apresentar as dez clínicas de fisioterapia de Campinas apenas como recorte/base inicial da prospecção, preservando a localização real nas fichas atuais.
- [x] **Criação de mascote:** incluir uma aba para configurar um mascote vetorial com prévia editável e download do SVG, sem exigir integração externa.
- [x] **Cidades e nichos:** permitir adicionar e remover cidades e nichos-alvo, associar cada lead à sua cidade e nicho, mostrar a quantidade de leads correspondente e permitir abrir a lista filtrada ao selecionar um alvo; persistir a configuração neste navegador e informar que incluir um alvo não pesquisa nem cria leads automaticamente.
- [x] **Perfis enviados pelo usuário:** adicionar os três perfis de Instagram compartilhados pelo usuário com dados públicos, fontes, cidade/nicho somente quando sustentados por evidência e ressalvas explícitas para associações ou contatos divergentes.
- [x] **Importação e análise de planilhas:** aceitar planilhas XLSX/CSV, permitir revisar e mapear as colunas, identificar linhas sem nome, cidade ou nicho e possíveis duplicatas, permitir inspecionar todas as linhas antes de confirmar, categorizar leads por cidade e nicho e importar somente após confirmação; processar no navegador sem enviar nem reter o arquivo original no dashboard, salvando apenas os campos estruturados selecionados localmente.

## Busca pública automática (pendente)

- [ ] **Busca automática por nicho e cidade:** ao adicionar um nicho-alvo, pesquisar negócios daquele nicho nas cidades-alvo selecionadas, exibir fontes públicas, data e confiança por campo e exigir revisão antes de salvar; nunca contatar leads. Esta função depende de escolher e conectar uma fonte de dados apropriada.

## Automação e aprendizado

- [x] **Automação interna já existente:** documentar a triagem local de planilhas como recurso interno do painel, que mapeia colunas, sinaliza dados incompletos e duplicatas, organiza por cidade/nicho, pede confirmação humana e salva somente registros estruturados, sem enviar nem armazenar o arquivo original; distingui-la das automações que serão oferecidas a negócios com site.
- [x] **Guia de automações para negócios com site:** incluir as três ideias escolhidas para o guia — formulário do site → CRM e retorno rápido; pedido de orçamento/agendamento → triagem e confirmação; pós-venda → pedido de avaliação e lembrete de retorno — explicando gatilho, entrada, regras, exceções, consentimento, teste, entregas de serviço e manutenção. Por ora, não construir protótipo dessas três automações nem integrar Apify.

## Validação e eficiência do pipeline

- [x] **Validação manual rastreável por lead:** permitir confirmar identidade do negócio e canal público, revisar/adicionar contato como WhatsApp, guardar a URL de origem, nota/evidência e data local da conferência; registros importados continuam “não verificados” até revisão humana. Não pesquisar, contactar ou confirmar dados automaticamente.
- [x] **Pontuação explicável de 0 a 100:** calcular prioridade de prospecção somente com oportunidades de serviço marcadas por usuário e sinais/dados verificados; 0 somente quando o usuário marca “nenhum serviço” ou todos os serviços conhecidos como “Não se aplica”; avaliação ainda não feita aparece como “não avaliado”, não 0. A partir de 50, indicar que cabe confirmar o encaixe; mostrar pontos/critério e deixar explícito que score não é probabilidade nem intenção de compra. Temperatura fria/morna/quente depende de resposta, necessidade confirmada ou pedido de proposta — nunca somente do score. Uma necessidade pontuada como confirmada pelo negócio também exige estado de interesse compatível, evidência da interação e data.
- [x] **Pronto para contato e métricas locais do pipeline:** incluir estágio “Pronto para contato” e só permitir avanço após identidade, canal e fonte/data conferidos, ao menos um serviço compatível e score ≥ 50; registrar “Contato feito” para calcular resposta. Exigir transições sequenciais, sem saltar diretamente a conversa, proposta ou cliente. Se a validação perder elegibilidade em “Pronto para contato” ou “Contato feito”, voltar para “Qualificar”; etapas posteriores permanecem como histórico de interação, mas só entram nas taxas enquanto o gate atual for válido. No CRM, mostrar cobertura de dados validados e prontos para contato, taxa de resposta = leads que responderam ÷ leads com contato feito ou resposta, e taxa de proposta = propostas/ganhos ÷ leads em conversa, proposta ou ganho; exibir “—” sem denominador e manter todas as métricas no navegador.

## Navegação e rolagem

- [x] **Rolagem independente por área:** manter a navegação lateral visível durante o uso; deixar a rolagem dentro do conteúdo principal, sem rolar o documento inteiro; ao mudar de seção, voltar o conteúdo principal ao topo; manter menu e rolagem utilizáveis em telas menores.

## Próximo recorte a definir

- [ ] **Pesquisa de novos leads públicos:** iniciar a pesquisa somente após definir cidades, nichos e quantidade desejada por combinação; o painel não cria nem busca leads automaticamente ao cadastrar um alvo.
