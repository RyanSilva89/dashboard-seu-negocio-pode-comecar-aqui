# Seu site pode começar aqui

Painel pessoal de prospecção digital em português do Brasil, feito para centralizar leads, alvos de cidade/nicho e oportunidades de serviços digitais. A base inicial reúne dez clínicas de fisioterapia de Campinas e três perfis sociais adicionais enviados para investigação, com ressalvas visíveis quando o vínculo, endereço ou contato não foi confirmado.

## Desenvolvimento

- `pnpm install`
- `pnpm dev`
- `pnpm build`

Leads importados, CRM, cidades/nichos-alvo e configurações do mascote são armazenados em `localStorage` neste navegador/dispositivo; não há sincronização com nuvem ou GitHub. Limpar os dados do navegador pode apagá-los.

Na aba **Leads**, use **Cadastrar lead** para adicionar manualmente negócios encontrados em redes sociais, anúncios ou indicações. Nome, cidade e nicho são necessários; Instagram, telefone, site e observações são opcionais. O cadastro fica apenas neste navegador, aparece na base e nos filtros de cidade/nicho, e é marcado como não verificado. Confira os dados antes de abordar; observações não confirmam a necessidade do cliente.

Planilhas locais podem ficar em `private-imports/`, pasta ignorada pelo Git para evitar que os arquivos sejam incluídos em commits. Essa proteção não criptografa os dados nem impede acesso por outros usuários deste computador; para dados sensíveis, prefira uma pasta protegida pelo sistema operacional.

O importador aceita XLSX, CSV e TSV, faz a leitura e a prévia paginada de todas as linhas no navegador, sugere o mapeamento de colunas e identifica nomes, cidades ou nichos ausentes e possíveis duplicatas. Também reconhece campos como bairro, avaliações e link de perfil social; links válidos ficam visíveis na prévia e como fonte clicável na ficha importada. Quando a cidade não está em uma coluna, permite revisar uma cidade padrão, que pode ser sugerida pelo nome da aba ou do arquivo (por exemplo, “Leads Uberaba”). O arquivo original não é enviado nem armazenado pelo app; após a confirmação, apenas os campos selecionados são salvos como fichas estruturadas. Dados de planilha são rotulados como não verificados.

Na lista de leads, a contagem se atualiza com os filtros de cidade e nicho, mostrando quantos registros correspondem ao recorte atual. Quando uma cidade e/ou nicho estão selecionados, o link **Buscar no Google Maps** abre uma consulta manual em outra aba; os resultados externos não são importados automaticamente. Cidades e nichos cadastrados continuam sem iniciar pesquisa automática, pois não há fonte de busca conectada.

Em **Templates**, o orçamento de landing page/site institucional parte do valor de renovação da hospedagem de entrada da Hostinger (R$ 23,99/mês) e do domínio .br no Registro.br (R$ 40/ano), consultados em 12/10/2026. Os campos de custos externos são editáveis para atualizar a cotação. São referências sujeitas a alteração, não cotações garantidas; o cliente deve contratar hospedagem e domínio diretamente e confirmar as condições vigentes. A manutenção não tem preço universal: o modelo sugere cobrar horas mensais combinadas multiplicadas pela sua taxa. A implantação segue a mesma regra com as horas estimadas do escopo. O rascunho só pode ser gerado depois da conferência manual da ficha, da confirmação da necessidade de site pelo cliente com evidência/data e do preenchimento dos valores. A proposta gerada é local, editável e não é enviada automaticamente.

O criador de mascote produz um SVG editável no navegador. A página **Aprender automação** e o guia `public/guia-pratico-automacoes-com-sites.md` apresentam três ideias de serviço para negócios com site — captura para CRM, triagem de orçamento/agendamento e pós-venda — sem prototipar essas integrações por enquanto. O importador de planilhas continua sendo uma função interna distinta. As oportunidades de serviço são hipóteses não validadas. O app não envia mensagens, processa pagamentos, cria agendamentos externos nem publica conteúdo. Os módulos sem integração real são identificados como demonstração ou “Em breve”. Nenhum repositório GitHub está conectado nem houve publicação pública.
