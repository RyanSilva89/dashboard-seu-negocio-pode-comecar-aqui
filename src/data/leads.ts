export type Priority = 'Alta provisória' | 'Média-alta provisória' | 'Média provisória' | 'Média-baixa provisória' | 'Baixa provisória'
export type SiteStatus = 'Confirmado' | 'Não localizado nas fontes consultadas' | 'Informado na planilha · não verificado' | 'Não informado na planilha'

export type LeadSource = {
  label: string
  url?: string
  supports: string
}

export type Lead = {
  id: string
  name: string
  specialty: string
  address: string
  contacts: { label: string; value: string; type: 'direto' | 'diretório' | 'social' | 'planilha' }[]
  website: string | null
  websiteStatus: SiteStatus
  city?: string
  niche?: string
  instagram?: string
  services: string
  scheduling: string
  evidence: string[]
  offer: string
  priority: Priority
  priorityReason: string
  confidence: string
  sources: LeadSource[]
  origin?: 'pesquisa' | 'planilha'
  importedAt?: string
  lastReviewedAt?: string
}

export const researchedAt = '10/10/2026'

export const leads: Lead[] = [
  {
    id: 'clinica-campinas-fisioterapia',
    name: 'Clínica Campinas Fisioterapia',
    specialty: 'Fisioterapia ortopédica, esportiva e geriátrica',
    address: 'Rua Barão Geraldo de Rezende, 273, Botafogo, Campinas–SP',
    contacts: [
      { label: 'WhatsApp / telefone', value: '(19) 3231-5189', type: 'social' },
      { label: 'E-mail', value: 'campinasfisioterapia@gmail.com', type: 'diretório' },
    ],
    website: 'https://campinasfisioterapia.com.br/',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/clinica_campinas_fisioterapia/?hl=en',
    services: 'Fisioterapia ortopédica, reabilitação pré e pós-operatória, esportiva/funcional, geriátrica, domiciliar e tratamento de dor crônica.',
    scheduling: 'Instagram orienta agendar avaliação pelo WhatsApp; um diretório declara que não há agendamento online. Não foi observado calendário de reservas.',
    evidence: [
      'O site apresenta a clínica em Botafogo e descreve serviços de fisioterapia e reabilitação.',
      'O perfil social publica WhatsApp e endereço; o e-mail aparece em diretório, não em fonte direta verificada.',
      'A página de contato não teve conteúdo extraído, mas isso não confirma que esteja quebrada.',
    ],
    offer: 'Perguntar se seria útil organizar uma página de serviço ou um fluxo simples de encaminhamento/agendamento para reabilitação pós-operatória e atendimento domiciliar. Necessidade não confirmada.',
    priority: 'Média provisória',
    priorityReason: 'Site próprio, perfil social e contato público encontrados; proposta ainda depende de conversa de descoberta.',
    confidence: 'Alta para clínica, serviços e endereço; média para e-mail (somente diretório) e para a disponibilidade de agenda online.',
    sources: [
      { label: 'Site oficial', url: 'https://campinasfisioterapia.com.br/', supports: 'Clínica, localização geral, equipe e serviços.' },
      { label: 'Instagram do negócio', url: 'https://www.instagram.com/clinica_campinas_fisioterapia/?hl=en', supports: 'WhatsApp, endereço e descrição pública da clínica.' },
      { label: 'Medsoft', url: 'https://medsoft.com.br/campinas/fisioterapia/clinica-campinas-fisioterapia', supports: 'Telefone, e-mail e informação de agendamento; fonte de diretório.' },
    ],
  },
  {
    id: 'fisio-campinas',
    name: 'FISIO Campinas',
    specialty: 'Fisioterapia, Pilates e reabilitação',
    address: 'Rua Dr. Costa Aguiar, 698, Edifício Banco Segurança, Centro, Campinas–SP, 13010-061',
    contacts: [
      { label: 'Telefone / WhatsApp', value: '(19) 99516-2933', type: 'direto' },
      { label: 'E-mail', value: 'contatoreabilitacao@gmail.com', type: 'direto' },
    ],
    website: 'https://contatoreabilitaca.wixsite.com/fisiocampinas-fisiot',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/fisiocampinas/?hl=en',
    services: 'Fisioterapia ortopédica, desportiva e neurológica; Pilates; fisioterapia domiciliar; massoterapia, reeducação postural e terapias complementares listadas no site.',
    scheduling: 'O site convida a marcar avaliação por telefone ou e-mail; o Instagram direciona a WhatsApp. Não foi observado agendador/calendário online.',
    evidence: [
      'O site apresenta clínica particular, estúdio de Pilates e serviços em Campinas.',
      'A chamada para avaliação é feita por contato; não equivale a reserva automática de horário.',
    ],
    offer: 'Oferecer uma revisão mobile da página de serviços e da chamada para avaliação; se a clínica quiser, adicionar formulário simples para organizar solicitações. Avaliar o site antes de sugerir redesign.',
    priority: 'Média-alta provisória',
    priorityReason: 'Site e perfil social confirmam a operação local e canais; não há problema de conversão confirmado.',
    confidence: 'Alta para serviços, endereço e contatos publicados pelo site; nenhuma confirmação de agenda digital.',
    sources: [
      { label: 'Site da clínica', url: 'https://contatoreabilitaca.wixsite.com/fisiocampinas-fisiot', supports: 'Serviços, endereço e contatos.' },
      { label: 'Instagram do negócio', url: 'https://www.instagram.com/fisiocampinas/?hl=en', supports: 'Perfil da clínica, serviços e link de WhatsApp.' },
      { label: 'Publicação pública', url: 'https://www.instagram.com/p/DILyrOmOKvk/', supports: 'Pilates, telefone e endereço publicados pelo perfil.' },
    ],
  },
  {
    id: 'cefor-fisio',
    name: 'CEFOR Fisio',
    specialty: 'Fisioterapia ortopédica, esportiva e performance',
    address: 'Av. José de Sousa Campos, 1815, sala 806, Cambuí, Campinas–SP (site). O CNES consultado lista endereço diferente no Centro; confirmar unidade atual.',
    contacts: [
      { label: 'Telefone / WhatsApp', value: '(19) 3291-2422', type: 'direto' },
      { label: 'E-mail', value: 'contato@ceforfisio.com.br', type: 'direto' },
    ],
    website: 'https://ceforfisio.com.br/clinica-de-fisioterapia-campinas/',
    websiteStatus: 'Confirmado',
    services: 'Reabilitação ortopédica e de lesões esportivas; serviço de performance com treinamento individualizado de força, potência, resistência, controle motor e estabilidade.',
    scheduling: 'O site orienta contato pelo WhatsApp; nenhum calendário de horários foi observado.',
    evidence: [
      'Site próprio apresenta reabilitação ortopédica/esportiva e página separada de performance.',
      'Cadastro CNES encontrado para a empresa registra outro endereço em Campinas; divergência não resolvida.',
    ],
    offer: 'Propor, se houver interesse, revisão da jornada entre reabilitação e performance ou uma landing page específica da oferta de performance, com CTA/formulário rastreável. Confirmar endereço antes da abordagem.',
    priority: 'Alta provisória',
    priorityReason: 'Há uma oferta específica de performance claramente divulgada; prioridade indica oportunidade a qualificar, não propensão de compra.',
    confidence: 'Alta para serviços e contato no site; média para unidade/endereço atual devido à divergência com o CNES.',
    sources: [
      { label: 'Clínica — site oficial', url: 'https://ceforfisio.com.br/clinica-de-fisioterapia-campinas/', supports: 'Fisioterapia em Campinas, especialidades, endereço e contato.' },
      { label: 'Página de performance', url: 'https://ceforfisio.com.br/performance/', supports: 'Oferta de performance e abordagem individualizada.' },
      { label: 'CNES', url: 'https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=3509507572654', supports: 'Cadastro público com endereço divergente.' },
    ],
  },
  {
    id: 'fisiomed-pablo-garcia',
    name: 'Fisiomed — Dr. Pablo Garcia',
    specialty: 'Fisioterapia ortopédica, geriátrica e reabilitação',
    address: 'Rua Dr. Emílio Ribas, 1070, Cambuí, Campinas–SP (endereço em diretório profissional).',
    contacts: [
      { label: 'Telefone divulgado', value: '(11) 94231-6591', type: 'social' },
    ],
    website: 'https://fisiomedclinica.com.br/',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/fisiomedclinic/',
    services: 'Fisioterapia ortopédica e reabilitação; site também lista gerontologia, neurologia, cardiorrespiratória, Pilates/PowerPilates e outros serviços.',
    scheduling: 'Doctoralia informa que o profissional não oferece agendamento online nesse endereço; o site não apresentou sistema de reservas.',
    evidence: [
      'Site identifica o profissional e apresenta áreas e serviços da clínica.',
      'Publicação pública divulga palestra corporativa sobre longevidade, dor e pausas ativas.',
      'Instagram exigiu login na consulta; telefone veio de publicação associada ao profissional.',
    ],
    offer: 'Investigar se faria sentido criar ou aprimorar uma página de palestras/serviços corporativos com formulário de solicitação. O anúncio público é um sinal de oferta, não confirmação de demanda ou orçamento.',
    priority: 'Alta provisória',
    priorityReason: 'A publicação de palestras corporativas é um gancho B2B observável; validar endereço e canal antes de priorizar.',
    confidence: 'Alta para identidade/serviços no site e Doctoralia; média para endereço/telefone, apoiados por fontes secundárias ou sociais.',
    sources: [
      { label: 'Site da clínica', url: 'https://fisiomedclinica.com.br/', supports: 'Identidade, serviços e forma de atendimento.' },
      { label: 'Doctoralia', url: 'https://www.doctoralia.com.br/pablo-garcia/fisioterapeuta/campinas', supports: 'Especialidades, endereço e situação de agendamento naquele endereço.' },
      { label: 'Publicação sobre palestra', url: 'https://www.facebook.com/100090122041977/videos/ol%C3%A1-tudo-bem-aqui-%C3%A9-dr-pablo-garcia-fisioterapeuta-crefito-368657-f-da-fisiomed-/1407615028186569/', supports: 'Divulgação de palestra corporativa e número de telefone.' },
      { label: 'Instagram', url: 'https://www.instagram.com/fisiomedclinic/', supports: 'Perfil encontrado; conteúdo atual não pôde ser verificado sem login.' },
    ],
  },
  {
    id: 'cpa-fisio',
    name: 'CPA Fisioterapia (CPA Fisio)',
    specialty: 'Saúde da mulher, fisioterapia pélvica e reabilitação integrativa',
    address: 'Edifício Hemisphere, Rua Oriente, 55, sala 1202, Chácara da Barra, Campinas–SP. O site lista endereços divergentes para Jundiaí.',
    contacts: [
      { label: 'WhatsApp', value: '(11) 99200-8333', type: 'direto' },
    ],
    website: 'https://cpafisio.com.br/',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/cpafisio/',
    services: 'Fisioterapia integrativa e individualizada; saúde da mulher, fisioterapia pélvica na gestação/puerpério, uroginecologia e reabilitação postural/funcional.',
    scheduling: 'Site orienta agendar pelo WhatsApp; não foi observado calendário/reserva online.',
    evidence: [
      'Site confirma endereço de Campinas, serviços, contato e atendimentos divulgados em Campinas e Jundiaí.',
      'Páginas oficiais apresentam dados divergentes sobre endereço de Jundiaí; a divergência não afeta o endereço de Campinas confirmado.',
    ],
    offer: 'Avaliar se a clínica gostaria de organizar páginas por serviço/localidade e facilitar solicitações para cada unidade. Confirmar com a clínica como deseja apresentar as unidades.',
    priority: 'Média provisória',
    priorityReason: 'Site próprio e serviços especializados são verificáveis; as necessidades digitais não foram confirmadas.',
    confidence: 'Alta para endereço de Campinas, serviços e WhatsApp no site; média para consistência das informações da unidade de Jundiaí.',
    sources: [
      { label: 'Site oficial', url: 'https://cpafisio.com.br/', supports: 'Clínica, abordagem e endereços publicados.' },
      { label: 'Tratamentos', url: 'https://cpafisio.com.br/tratamentos/', supports: 'Áreas de atendimento.' },
      { label: 'Contato', url: 'https://cpafisio.com.br/contato/', supports: 'Endereços e canal WhatsApp.' },
      { label: 'Instagram', url: 'https://www.instagram.com/cpafisio/', supports: 'Perfil público identificado como oficial.' },
    ],
  },
  {
    id: 'bebe-em-movimento',
    name: 'Clínica Bebê em Movimento',
    specialty: 'Fisioterapia e desenvolvimento infantil',
    address: 'Rua Camargo Pimentel, 404, Jardim Guanabara, Campinas–SP, 13073-340',
    contacts: [
      { label: 'Telefone / WhatsApp', value: '(19) 99758-9031', type: 'direto' },
    ],
    website: 'https://clinicabebeemmovimento.com.br/',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/bebeemmovimento/',
    services: 'Fisioterapia pediátrica motora e respiratória, prematuros, alterações musculoesqueléticas e reabilitação; o site também lista pediatria, fonoaudiologia, terapia ocupacional e psicologia materna.',
    scheduling: 'Site convida a agendar, mas não foi observado calendário ou fluxo de reserva online.',
    evidence: [
      'Site oficial apresenta endereço, contato e diversas especialidades pediátricas.',
      'Número do site foi corroborado no Facebook; um diretório secundário lista telefone diferente.',
    ],
    offer: 'Oferecer organização de páginas de serviço e uma solicitação de avaliação/triagem inicial, com coleta mínima e atenção à privacidade. Não recolher informações clínicas desnecessárias.',
    priority: 'Média-alta provisória',
    priorityReason: 'Serviços multidisciplinares e convite para agendar são sinais observáveis; coordenação de solicitações é hipótese.',
    confidence: 'Alta para endereço e telefone publicados no site; divergência de telefone em diretório secundário não resolvida.',
    sources: [
      { label: 'Site oficial', url: 'https://clinicabebeemmovimento.com.br/', supports: 'Serviços, endereço, telefone e convite para agendar.' },
      { label: 'Facebook', url: 'https://www.facebook.com/bebeemmovimento/?locale=pt_BR', supports: 'Telefone divulgado pela página associada.' },
      { label: 'Instagram', url: 'https://www.instagram.com/bebeemmovimento/', supports: 'Perfil encontrado; leitura direta exigiu login.' },
    ],
  },
  {
    id: 'santa-teresinha',
    name: 'Fisioterapia Santa Teresinha',
    specialty: 'Fisioterapia ortopédica, esportiva e geriátrica',
    address: 'Rua Jean Nassif Mokarzel, 11, Barão Geraldo, Campinas–SP (resultado indexado do site próprio).',
    contacts: [
      { label: 'Telefone divulgado', value: '(11) 94011-0039', type: 'direto' },
    ],
    website: 'https://www.fisioterapiasantateresinha.com/',
    websiteStatus: 'Confirmado',
    services: 'Fisioterapia ortopédica e esportiva, recovery, geriatria, cinesioterapia, quiropraxia, liberação miofascial, massoterapia e técnicas relacionadas listadas no site.',
    scheduling: 'Não foi identificado botão ou sistema de marcação no conteúdo textual consultado.',
    evidence: [
      'Site próprio identifica serviços e registro CREFITO-3/310815-F.',
      'Endereço e telefone foram exibidos no resultado indexado da página oficial, não no texto extraído da página aberta; sem confirmação independente.',
    ],
    offer: 'Validar primeiro os dados e oferecer revisão diagnóstica de escopo curto da jornada mobile e dos canais de contato; só depois cotar melhoria de página, formulário ou CTA.',
    priority: 'Média-baixa provisória',
    priorityReason: 'Site e serviços estão visíveis, mas endereço e telefone carecem de confirmação independente.',
    confidence: 'Moderada: identidade e serviços no site; dados de endereço/telefone recuperados do índice da mesma fonte.',
    sources: [
      { label: 'Site próprio', url: 'https://www.fisioterapiasantateresinha.com/', supports: 'Serviços, descrição da clínica e registro profissional.' },
      { label: 'Resultado indexado do site', url: 'https://www.fisioterapiasantateresinha.com/', supports: 'Endereço, telefone e horário divulgados; sem confirmação independente.' },
    ],
  },
  {
    id: 'ortovida',
    name: 'Clínica Ortovida',
    specialty: 'Fisioterapia ortopédica e esportiva',
    address: 'Rua Plácido Soave, 66, sala B, Chácara Santa Letícia, Campinas–SP, 13054-040 (site). Diretório secundário lista sala C.',
    contacts: [
      { label: 'Telefone / WhatsApp divulgado', value: '(19) 8933-1426', type: 'direto' },
      { label: 'Telefone em diretório', value: '998051538', type: 'diretório' },
    ],
    website: 'https://clinicaortovida.com/',
    websiteStatus: 'Confirmado',
    services: 'Fisioterapia ortopédica e esportiva; página oficial relata início em 2012.',
    scheduling: 'O site instrui iniciar a marcação por conversa de WhatsApp e aguardar confirmação; não foi observado calendário de horários.',
    evidence: [
      'O site descreve serviços e fluxo de solicitação pelo WhatsApp.',
      'Site informa sala B; diretório atribuído ao CNES informa sala C e telefone divergente.',
      'Não foi confirmada independentemente a operação atual; o CNES consultado em outra ficha era registro distinto e não deve ser atribuído a esta clínica.',
    ],
    offer: 'Perguntar se um formulário breve de solicitação ou resposta inicial automatizada seria útil; propor apenas como teste opcional. Não alegar demora ou falha atual.',
    priority: 'Média-baixa provisória',
    priorityReason: 'Site oficial ativo, mas telefone/sala divergem em fontes secundárias e o status atual não foi confirmado independentemente.',
    confidence: 'Moderada: serviços, contato e endereço divulgados no site; divergência de sala e telefone em diretório.',
    sources: [
      { label: 'Site oficial', url: 'https://clinicaortovida.com/', supports: 'Serviços, endereço divulgado, telefone e fluxo WhatsApp.' },
      { label: 'Diretório Bula', url: 'https://bula.com.br/estabelecimento/clinica-ortovida-4404262', supports: 'Cadastro atribuído ao CNES; lista sala e contato diferentes e alerta possível desatualização.' },
      { label: 'CNES consultado', url: 'https://cnes2.datasus.gov.br/Mod_Conjunto.asp?VCo_Unidade=3509504254155', supports: 'Identificador divergente; não utilizado para atribuir status à Ortovida.' },
    ],
  },
  {
    id: 'clinica-fisio-lt',
    name: 'Clínica Fisio LT',
    specialty: 'Fisioterapia ortopédica, desportiva e pediátrica',
    address: 'Campinas–SP segundo o perfil social; endereço completo não confirmado.',
    contacts: [
      { label: 'WhatsApp', value: '+55 (19) 99197-1212', type: 'social' },
    ],
    website: null,
    websiteStatus: 'Não localizado nas fontes consultadas',
    instagram: 'https://www.instagram.com/clinicafisiolt/',
    services: 'O perfil lista fisioterapia ortopédica, desportiva e pediátrica, além de quiropraxia, acupuntura e Pilates.',
    scheduling: 'Perfil direciona ao WhatsApp; não foi confirmada ferramenta de agendamento online.',
    evidence: [
      'Perfil social identificado como Clínica Fisio LT e localizado em Campinas–SP.',
      'Endereço completo não confirmado. Site próprio não foi localizado nas fontes consultadas; isso não prova inexistência.',
      'O perfil do Facebook exigiu login e não contribuiu para confirmar detalhes.',
    ],
    offer: 'Confirmar primeiro se há site e endereço. Se a clínica demonstrar interesse e não possuir página adequada, oferecer landing page/site básico; alternativa é revisar apresentação visual do Instagram.',
    priority: 'Baixa provisória',
    priorityReason: 'Há perfil e WhatsApp públicos, mas site e endereço completo ainda precisam de confirmação.',
    confidence: 'Moderada para perfil/serviços/WhatsApp publicados; baixa para endereço completo e situação operacional.',
    sources: [
      { label: 'Instagram da clínica', url: 'https://www.instagram.com/clinicafisiolt/', supports: 'Nome, localidade, serviços e link wa.me.' },
      { label: 'Facebook', url: 'https://www.facebook.com/ClinicaFisioLT/', supports: 'Página encontrada, conteúdo detalhado não acessível sem login.' },
    ],
  },
  {
    id: 'clinica-alahmar',
    name: 'Clínica Alahmar Fisioterapia & Pilates',
    specialty: 'Fisioterapia traumato-ortopédica, esportiva e geriatria',
    address: 'Av. Dr. Romeu Tórtima, 633, Barão Geraldo, Campinas–SP (site próprio).',
    contacts: [
      { label: 'WhatsApp', value: '(19) 97169-8885', type: 'direto' },
      { label: 'Telefone', value: '(19) 3305-5155', type: 'direto' },
      { label: 'E-mail', value: 'clinicaalahmar@gmail.com', type: 'direto' },
    ],
    website: 'https://www.clinicaalahmar.com.br/',
    websiteStatus: 'Confirmado',
    instagram: 'https://www.instagram.com/clinica_alahmar_fisioterapia/',
    services: 'Fisioterapia traumato-ortopédica, lesões esportivas, geriatria e RPG; site também lista Pilates, acupuntura, estética e reabilitação/musculação.',
    scheduling: 'Página de contato publica telefone e e-mail; não foi localizado calendário de agendamento online nas páginas consultadas.',
    evidence: [
      'Site e Instagram confirmam endereço, serviços e contatos divulgados pelo próprio negócio.',
      'Diretório secundário apresenta endereço diferente; prevalece o endereço publicado pelo negócio, sem descartar confirmação direta futura.',
    ],
    offer: 'Oferecer auditoria de consistência entre site, Instagram e diretórios, ou uma revisão da chamada de contato/agendamento. Não presumir problema de informação ou conversão.',
    priority: 'Média provisória',
    priorityReason: 'Dados principais aparecem em site e perfil oficiais; não há necessidade comercial confirmada.',
    confidence: 'Alta para informações publicadas nas fontes próprias; endereço secundário conflitante não resolvido.',
    sources: [
      { label: 'Site oficial', url: 'https://www.clinicaalahmar.com.br/', supports: 'Serviços e apresentação da clínica.' },
      { label: 'Contato', url: 'https://www.clinicaalahmar.com.br/contato', supports: 'Endereço, telefone e e-mail publicados pelo negócio.' },
      { label: 'Instagram da clínica', url: 'https://www.instagram.com/clinica_alahmar_fisioterapia/', supports: 'Endereço e canais sociais/comerciais.' },
      { label: 'Diretório Agendar Consulta', url: 'https://guia.agendarconsulta.com/sao-paulo/campinas/clinica-alahmar-7146736', supports: 'Cadastro secundário com endereço divergente.' },
    ],
  },
  {
    id: 'planeta-grill-jp',
    name: 'Planeta Grill JP',
    specialty: 'Gastronomia; publicação indexada menciona churrasquinho',
    address: 'Nagoya-shi, Aichi (localização exibida em resultado indexado do Instagram; endereço de rua não confirmado).',
    contacts: [
      { label: 'Instagram indicado pelo usuário', value: 'https://www.instagram.com/planeta_grill_jp/', type: 'social' },
    ],
    website: null,
    websiteStatus: 'Não localizado nas fontes consultadas',
    city: 'Nagoya-shi, Aichi, Japão',
    niche: 'Gastronomia / churrasquinho — atividade atual a confirmar',
    instagram: 'https://www.instagram.com/planeta_grill_jp/',
    services: 'Um resultado indexado do próprio perfil identifica a conta como Ivan Oliveira, em Nagoya-shi, Aichi. Uma publicação indexada associada ao mesmo handle menciona churrasquinho e bebidas em um evento de 2025; isso não confirma a atividade atual nem uma empresa formal.',
    scheduling: 'Não há informação confirmada sobre reserva, pedidos ou agendamento online.',
    evidence: [
      'Resultado indexado do Instagram associa @planeta_grill_jp a Ivan Oliveira e Nagoya-shi, Aichi; a abertura direta do perfil redirecionou para a tela de login, então a bio atual não foi lida diretamente.',
      'Um resultado de publicação do mesmo handle menciona participação no Brazilian Day Japan Aichi 2025 e churrasquinho/bebida. É um indício histórico, não confirmação de operação atual.',
      'A ficha Tabelog de um negócio homônimo não apresenta vínculo demonstrado com este perfil e foi retirada da qualificação para não misturar empresas.',
      'Nenhum site próprio foi identificado nas fontes consultadas; isso não prova que não exista.',
    ],
    offer: 'Confirmar se a atividade continua operando e qual é o canal comercial oficial; somente depois avaliar se uma página de informações ou fluxo de pedidos seria útil.',
    priority: 'Baixa provisória',
    priorityReason: 'Cidade e atividade aparecem em resultados indexados do perfil, mas a página atual, o contato comercial e a operação presente precisam de conferência humana.',
    confidence: 'Baixa a moderada para cidade e atividade histórica, pois vêm de resultados indexados; baixa para operação atual e contato comercial.',
    sources: [
      { label: 'Instagram — perfil indicado (resultado indexado)', url: 'https://www.instagram.com/planeta_grill_jp/', supports: 'Resultado indexado identifica Ivan Oliveira e Nagoya-shi, Aichi; o perfil atual redireciona para login.' },
      { label: 'Instagram — publicação do perfil (resultado indexado)', url: 'https://www.instagram.com/p/CpSHlefLTq2/', supports: 'Resultado menciona Brazilian Day Japan Aichi 2025, churrasquinho e bebida; referência histórica, não confirmação atual.' },
    ],
    origin: 'pesquisa',
    lastReviewedAt: '11/10/2026',
  },
  {
    id: 'cantinho-do-viaduto',
    name: 'Cantinho do Viaduto',
    specialty: 'Restaurante por quilo',
    address: 'Região do Viaduto da Lapa, São Paulo–SP (descrição indexada do Instagram; endereço de rua não confirmado).',
    contacts: [
      { label: 'Telefone na bio indexada do Instagram — validar antes do uso', value: '+55 11 3611-1907', type: 'social' },
      { label: 'WhatsApp na bio indexada do Instagram — validar antes do uso', value: '+55 11 99410-7481', type: 'social' },
    ],
    website: null,
    websiteStatus: 'Não localizado nas fontes consultadas',
    city: 'São Paulo, SP',
    niche: 'Restaurante por quilo',
    instagram: 'https://www.instagram.com/cantinhodoviaduto/',
    services: 'A descrição indexada do perfil do próprio Instagram o apresenta como restaurante por quilo na região do Viaduto da Lapa, em São Paulo, e lista telefone e WhatsApp. Os dados ainda precisam de conferência manual na página atual.',
    scheduling: 'Não foi confirmado sistema online de reserva ou pedido; telefone e WhatsApp publicados não significam que exista automação.',
    evidence: [
      'Um resultado indexado da página de reels do próprio @cantinhodoviaduto descreve restaurante por quilo sob o viaduto da Lapa, em São Paulo, e lista telefone 3611-1907 e WhatsApp 99410-7481.',
      'A abertura direta do perfil redirecionou para login. Os números acima vêm de um trecho indexado e continuam não verificados manualmente; confirme-os no perfil antes de usar.',
      'Uma página Facebook homônima lista endereço de rua, mas não foi comprovado que pertença ao perfil enviado; esse endereço foi removido da ficha principal.',
      'Nenhum site próprio foi localizado nas páginas consultadas; isso não prova inexistência.',
    ],
    offer: 'Se houver interesse, investigar se um cardápio digital, página de informações ou fluxo de pedidos seria útil. Não presumir que o negócio precise de site ou automação.',
    priority: 'Baixa provisória',
    priorityReason: 'O perfil indexado fornece cidade, categoria e canais públicos candidatos, mas a conta ao vivo e os números ainda precisam de confirmação manual; nenhuma necessidade digital foi demonstrada.',
    confidence: 'Moderada para categoria, cidade e números exibidos em resultado indexado do perfil; baixa para endereço de rua e estado atual dos contatos.',
    sources: [
      { label: 'Instagram — perfil indicado (resultado indexado)', url: 'https://www.instagram.com/cantinhodoviaduto/', supports: 'Resultado indexado identifica o perfil com São Paulo–SP e restaurante por quilo; acesso direto redirecionou para login.' },
      { label: 'Instagram — página de reels do mesmo perfil (resultado indexado)', url: 'https://www.instagram.com/cantinhodoviaduto/reels/', supports: 'Trecho indexado lista telefone 3611-1907 e WhatsApp 99410-7481; validar manualmente antes de usar.' },
    ],
    origin: 'pesquisa',
    lastReviewedAt: '11/10/2026',
  },
  {
    id: 'clinica-nunes-estetica-avancada',
    name: 'Clínica Nunes Estética Avançada',
    specialty: 'Estética avançada; harmonização facial e perfiloplastia',
    address: 'Uberaba–MG (localização indicada na bio indexada do perfil; endereço de rua não confirmado).',
    contacts: [
      { label: 'Instagram informado pelo usuário', value: 'https://www.instagram.com/clinicanunes.esteticaavancada/', type: 'social' },
    ],
    website: null,
    websiteStatus: 'Não localizado nas fontes consultadas',
    city: 'Uberaba, MG',
    niche: 'Estética avançada',
    instagram: 'https://www.instagram.com/clinicanunes.esteticaavancada/',
    services: 'A bio indexada do próprio perfil menciona harmonização facial e perfiloplastia e convida a agendar avaliação. O conteúdo atual não pôde ser lido diretamente; não há confirmação de calendário de reservas online.',
    scheduling: 'A bio indexada convida a agendar avaliação; não foi confirmado calendário de reservas online nem outro canal público além do próprio Instagram.',
    evidence: [
      'Resultado indexado do handle exato enviado pelo usuário identifica Clínica Nunes I Harmonização Facial, informa Uberaba–MG e menciona harmonização facial/perfiloplastia.',
      'A abertura direta do perfil redirecionou para login; os dados acima vêm de resultado indexado e precisam de conferência humana na página atual.',
      'Foram removidos e-mail/endereço de Facebook e Telu porque essas páginas não demonstram vínculo com o handle enviado; o Facebook citado anteriormente vinculava outro Instagram (@nunes.esteticaavancada).',
      'Nenhum site próprio foi identificado nas fontes consultadas; isso não prova que não exista.',
    ],
    offer: 'Depois de confirmar a bio e os canais atuais, perguntar se a apresentação dos serviços e o caminho para solicitar avaliação atendem aos objetivos da clínica; não presumir falha ou demanda.',
    priority: 'Baixa provisória',
    priorityReason: 'Nome, cidade e serviços aparecem em resultado indexado do perfil exato, mas o acesso atual está bloqueado; telefone e endereço não estão confirmados.',
    confidence: 'Moderada para nome, cidade e serviços descritos no resultado indexado; baixa para endereço, telefone e situação atual.',
    sources: [
      { label: 'Instagram — perfil indicado (resultado indexado)', url: 'https://www.instagram.com/clinicanunes.esteticaavancada/', supports: 'Trecho indexado identifica o perfil, descreve harmonização facial/perfiloplastia e informa Uberaba–MG; acesso direto redirecionou para login.' },
    ],
    origin: 'pesquisa',
    lastReviewedAt: '11/10/2026',
  },
]
