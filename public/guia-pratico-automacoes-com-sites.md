# Guia prático: automações para negócios com site

**Objetivo:** aprender a identificar um processo repetitivo de um negócio com site, desenhar um piloto seguro e delimitar uma oferta profissional — sem depender de uma ferramenta de scraping paga.

## As três ideias

### 1. Formulário do site → CRM e retorno rápido

- **Problema:** pedidos chegam por formulário, e alguém precisa copiá-los para uma planilha/CRM e lembrar de responder.
- **Gatilho:** envio do formulário de contato ou orçamento.
- **Entrada:** nome, canal de retorno, serviço de interesse e consentimento aplicável; evite pedir dados desnecessários.
- **Fluxo:** validar campos → verificar duplicatas → registrar origem/serviço → criar ou atualizar o lead no CRM → avisar o responsável → abrir tarefa de retorno. Uma resposta automática pode começar como rascunho revisado por uma pessoa.
- **Exceções:** faltam dados, contato duplicado, endereço de e-mail inválido, integração indisponível, pedido urgente ou ausência de autorização para marketing.
- **Entrega de piloto:** um formulário, um CRM, regras documentadas, alertas internos, testes com exemplos fictícios e guia de operação.
- **Limite:** registre pedidos sem prometer aumento de conversão. Mensagens promocionais precisam respeitar consentimento e descadastro; sem isso, use só alertas internos.
- **Complexidade inicial:** baixa a média, dependendo do site e do CRM existentes. É uma boa primeira oferta quando o cliente já possui formulário e ferramentas.

### 2. Pedido de orçamento/agendamento → triagem e confirmação

- **Problema:** o cliente recebe pedidos com informações incompletas ou precisa encaminhá-los manualmente para a equipe certa.
- **Gatilho:** envio de solicitação de orçamento, disponibilidade ou agendamento no site.
- **Entrada:** serviço solicitado, localização, janela de horário e canal de contato.
- **Fluxo:** validar campos → categorizar por serviço/localidade → encaminhar ao responsável → criar uma tarefa ou evento no calendário autorizado → preparar confirmação para revisão.
- **Exceções:** horário já ocupado, pedido sem dados suficientes, serviço indisponível naquela cidade ou integração do calendário fora do ar.
- **Entrega de piloto:** regras de encaminhamento, integração com formulário/calendário do cliente, mensagens de confirmação revisáveis, tratamento de conflito e testes.
- **Limite:** não confirme um horário que não foi verificado. Para clínicas, não colete sintomas, prontuários ou dados clínicos num formulário simples; encaminhe necessidades clínicas por um canal apropriado.
- **Complexidade inicial:** média, porque disponibilidade e calendários precisam corresponder à operação real.

### 3. Pós-venda → pedido de avaliação e lembrete de retorno

- **Problema:** depois do serviço, feedback e oportunidades de retorno dependem da memória da equipe.
- **Gatilho:** atendimento/pedido marcado como concluído no sistema usado pelo negócio.
- **Entrada:** identificador do cliente, evento de conclusão, canal autorizado e data do serviço.
- **Fluxo:** aguardar o intervalo acordado → gerar pedido neutro de feedback → registrar resposta → criar lembrete interno de retorno/manutenção se aplicável.
- **Exceções:** descadastro, falha na entrega, contato já realizado, serviço ainda não concluído ou canal sem consentimento.
- **Entrega de piloto:** regra baseada em conclusão, mensagem imparcial, histórico, descadastro, testes e orientação para a equipe.
- **Limite:** não peça avaliações apenas a clientes satisfeitos, não ofereça benefício condicionado a avaliação positiva e não publique conteúdo em nome do cliente automaticamente.
- **Complexidade inicial:** média; depende de uma fonte confiável de eventos de conclusão e de regras de comunicação aprovadas.

## Método para desenhar qualquer automação

Escreva uma linha para cada item antes de escolher uma ferramenta:

| Item | Pergunta |
|---|---|
| Gatilho | Qual evento real inicia o fluxo? |
| Entrada | Que dados são necessários, e quais não devem ser coletados? |
| Regra | Como decidir o próximo passo, incluindo duplicatas e dados incompletos? |
| Saída | O que deve ser registrado, criado ou encaminhado? |
| Responsável | Quem monitora e assume uma exceção? |
| Aprovação | Que ações precisam de revisão humana ou consentimento? |
| Recuperação | Como pausar, corrigir e reprocessar uma falha sem duplicar dados? |
| Medida | O que será medido: tempo de resposta, registros completos ou tarefas concluídas? |

## Como aprender com um piloto

1. **Observe o processo manual** com autorização do negócio; não peça credenciais pessoais.
2. **Desenhe o fluxo atual** e confirme cada campo com a pessoa responsável.
3. **Defina escopo e exclusões** antes de construir: uma entrada, um destino, regras conhecidas e limites.
4. **Teste com dados fictícios**: caso normal, duplicata, campo ausente, falha de serviço e descadastro.
5. **Peça validação do cliente** antes da ativação real. Verifique acessos, permissões, privacidade e procedimentos de pausa.
6. **Entregue documentação** com campos, regras, responsável, erros esperados, retomada e como desligar.
7. **Meça o resultado combinado** e só então proponha uma etapa adicional ou manutenção.

## Como vender como serviço

### Estruture a oferta em etapas

- **Diagnóstico:** entender o fluxo, ferramentas, volume, riscos, responsável e resultado esperado.
- **Piloto fechado:** automatizar um fluxo específico, testar exceções e obter aprovação antes de ativar.
- **Handoff:** documentar como usar, acompanhar, pausar e corrigir.
- **Manutenção opcional:** monitorar falhas e revisar mudanças nas integrações mediante escopo separado.

### Estime depois da descoberta

O esforço e o preço dependem do número de formulários e destinos, volume, qualidade dos dados, regras, exceções, aprovações, permissões e suporte esperado. Apresente entregas e exclusões por escrito. Não prometa mais vendas, uma taxa de conversão ou economia que ainda não foi medida.

### Modelo de briefing de uma página

- Processo atual:
- Evento que inicia a automação:
- Campos necessários:
- Destino e responsável:
- Regras e exceções:
- Revisão/consentimento necessário:
- Casos de teste e resultados esperados:
- Como pausar e quem dá suporte:
- Entregas incluídas e fora de escopo:

## O que já existe neste painel

O importador XLSX/CSV é uma automação interna e local: ele propõe mapeamento de colunas, sinaliza dados incompletos e duplicatas, permite revisar a prévia e só grava registros estruturados após confirmação. Não envia o arquivo a terceiros e não faz pesquisa automática na web. É um exercício de processamento e qualidade de dados, não uma das três integrações de site acima.

**Por enquanto, nenhuma integração de Apify nem protótipo de automação para sites foi ativado.** As automações deste guia são ideias de serviço a validar com cada negócio e com as ferramentas que o próprio cliente autorizar.
