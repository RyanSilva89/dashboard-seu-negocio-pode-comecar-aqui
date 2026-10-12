# Seu site pode começar aqui

Painel pessoal de prospecção digital em português do Brasil, feito para centralizar leads, alvos de cidade/nicho e oportunidades de serviços digitais. A base inicial reúne dez clínicas de fisioterapia de Campinas e três perfis sociais adicionais enviados para investigação, com ressalvas visíveis quando o vínculo, endereço ou contato não foi confirmado.

## Desenvolvimento

- `pnpm install`
- `pnpm dev`
- `pnpm build`

Leads importados, CRM, cidades/nichos-alvo e configurações do mascote são armazenados em `localStorage` neste navegador/dispositivo; não há sincronização com nuvem ou GitHub. Limpar os dados do navegador pode apagá-los.

Planilhas locais podem ficar em `private-imports/`, pasta ignorada pelo Git para evitar que os arquivos sejam incluídos em commits. Essa proteção não criptografa os dados nem impede acesso por outros usuários deste computador; para dados sensíveis, prefira uma pasta protegida pelo sistema operacional.

O importador aceita XLSX, CSV e TSV, faz a leitura e a prévia paginada de todas as linhas no navegador, sugere o mapeamento de colunas e identifica nomes, cidades ou nichos ausentes e possíveis duplicatas. O arquivo original não é enviado nem armazenado pelo app; após a confirmação, apenas os campos selecionados são salvos como fichas estruturadas. Dados de planilha são rotulados como não verificados.

O criador de mascote produz um SVG editável no navegador. Cidades e nichos podem ser cadastrados e usados para filtrar os leads existentes, mas adicionar um alvo ainda não inicia pesquisa automática; não há fonte de busca externa conectada. A página **Aprender automação** e o guia `public/guia-pratico-automacoes-com-sites.md` apresentam três ideias de serviço para negócios com site — captura para CRM, triagem de orçamento/agendamento e pós-venda — sem prototipar essas integrações por enquanto. O importador de planilhas continua sendo uma função interna distinta. As oportunidades de serviço são hipóteses não validadas. O app não envia mensagens, processa pagamentos, cria agendamentos externos nem publica conteúdo. Os módulos sem integração real são identificados como demonstração ou “Em breve”. Nenhum repositório GitHub está conectado nem houve publicação pública.
