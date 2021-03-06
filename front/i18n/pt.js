export default {
  info: {},
  message: {},
  error: {
    errNotFound: 'Recurso não encontrado'
  },
  layout: {
    about: 'Sobre',
    talkToUs: 'Fale conosco',
    next: 'Próximo passo',
    previous: 'Passo anterior',
    author: 'autor',
    secondaryAuthor: 'segundo autor',
    authorshipData: 'Dados do Autor',
    whosName: who => `Nome do ${who}`,
    whosSurname: who => `Sobrenome do ${who}`,
    nameTooltip: who => `Escreva o nome do ${who} do trabalho`,
    surnameTooltip: who => `Escreva o sobrenome do ${who} do trabalho`,
    institutionTooltip: 'Escreva o nome da instituição',
    facultyTooltip: 'Escreva o nome da faculdade',
    receiveEmailTooltip:
      'Marque se você deseja receber uma cópia do pdf no seu email',
    interinstitutional: 'Interinstitucional',
    required: 'Campo obrigatório.',
    optional: 'Campo opcional',
    minLength: min => `Mínimo de ${min} caracteres.`,
    alpha: alpha => `Por favor insira um ${alpha} válido.`,
    email: `Por favor insira um email válido`,
    workData: 'Dados do Trabalho',
    workTitle: 'Título do trabalho',
    workTitleTooltip: 'Título principal do trabalho',
    workSubtitle: 'Subtítulo do trabalho',
    workSubtitleTooltip: 'Subtítulo/título secundário do trabalho',
    year: 'Ano',
    yearTooltip: 'Ano de defesa',
    totalPages: 'Total de Páginas',
    arabic: 'Arábicos',
    roman: 'Romanos',
    numberTypeTooltip:
      'Escrever número total de páginas em algarismos romanos/arábicos',
    minValue: min => `Não pode ser menor que ${min}`,
    pictures: 'Ilustração',
    picturesTooltip:
      'Selecione o tipo de imagens presentes no seu trabalho ou "nenhuma"',
    nocolor: 'Não possui',
    color: 'Coloridas',
    bw: 'Preto e branco',
    workType: 'Tipo de Trabalho',
    workTypeTooltip: 'Selecione a categoria científica do seu trabalho',
    thesis: 'Tese',
    dissertation: 'Dissertação',
    tccExpert: 'TCC Especialização',
    tccGraduation: 'TCC Graduação',
    knArea: 'Área de Conhecimento',
    knAreaTooltip: 'Escreva uma descrição ou o código CDD',
    acdUnity: 'Unidade Acadêmica',
    acdUnityTooltip: 'Escreva o nome da sua unidade ou a sigla',
    course: 'Curso',
    courseTooltip: 'Selecione seu curso',
    noResultFound: 'Nenhum resultado encontrado',
    orientationData: 'Orientadores',
    advisor: 'Orientador',
    lowAdvisor: 'orientador',
    coadvisor: 'Coorientador',
    lowCoadvisor: 'coorientador',
    femaleAdvisor: 'Orientadora',
    femaleCoadvisor: 'Coorientadora',
    advisorGender: 'Gênero',
    genderMale: 'Masculino',
    genderFemale: 'Feminino',
    advisorName: 'Nome completo',
    whosFemaleTooltip: whomst => `Marque se seu ${whomst} é uma mulher`,
    title: 'Titulação',
    whosTitle: whomst => `Selecione o título do(a) ${whomst}(a)`,
    genderTooltip: whomst => `Selecione o gênero do(a) ${whomst}(a)`,
    graduate: 'Graduado(a)',
    expert: 'Especialista',
    master: 'Mestre',
    doctor: 'Doutor(a)',
    cotutelle: 'Cotutela',
    keywords: 'Palavras-chave',
    keyword: 'Palavra-chave ',
    keywordTooltip: 'Escreva uma palavra-chave científica',
    addAuthor: 'Adicionar coautor',
    removeAuthor: 'Remover coautor',
    addCoadvisor: 'Adicionar coorientador',
    removeCoadvisor: 'Remover coorientador',
    addKeyword: 'Adicionar palavra-chave',
    removeKeyword: 'Remover palavra-chave',
    font: 'Fonte',
    fontFamilyTooltip: 'Selecione a fonte da sua ficha catalográfica',
    sendCopyToEmail:
      'Quero receber uma cópia da ficha catalografica por email.',
    solveCaptcha: 'Resolva o captcha',
    generate: 'Gerar',
    generateTooltip: 'Clique para gerar sua ficha catalográfica!',
    prepareCard: 'Preparar ficha catalográfica',
    talkFormName: 'Nome',
    talkFormNameTooltip: 'Digite seu nome',
    talkFormEmail: 'Email',
    talkFormEmailTooltip: 'Digite seu email',
    invalidEmail: 'Não é um endereço válido de email',
    talkFormPhone: 'Telefone',
    talkFormPhoneTooltip: 'Digite seu número de telefone principal',
    numbersOnly: 'Use números ou "+" somente',
    internationalNumber: 'Use +[código de país] para números internacionais',
    talkFormMessage: 'Messagem',
    talkFormMessageTooltip: 'Digite uma mensagem descrevendo a questão',
    talkFormUpload: 'Arraste e solte seus arquivos aqui para fazer upload',
    talkFormUploadTooltip:
      'Você também pode apertar o botão para selecionar os anexos que precisar',
    submitBtnTooltip: 'Tudo certo? Envie a mensagem para nós!',
    submitBtn: 'Enviar'
  }
}
