# Sistema de Doacoes - Projeto Integrador

Aplicacao web desenvolvida para o Projeto Integrador em Tecnologia da Informacao, com foco em centralizar solicitacoes de doacao feitas pela escola e conectar doadores a uma causa social real.

## Sobre o projeto

O projeto foi criado a partir de uma necessidade social observada no ambiente escolar público: criancas que faltam aulas com frequencia e familias que enfrentam dificuldades basicas, incluindo falta de comida. Em varios casos, essas familias recorrem a mercados da regiao para pedir alimentos ou buscar sustento em situacoes de vulnerabilidade.

A proposta do sistema e organizar doacoes de forma centralizada, tendo a escola como ponto principal do fluxo. Em vez de doacoes espalhadas e sem controle, a instituicao recebe e registra as solicitacoes, o que ajuda a aproximar doadores, garantir mais transparencia e aumentar as chances de apoio real aos alunos e suas familias.

## Problema que o sistema busca resolver

O problema principal e a falta de um canal organizado para concentrar necessidades de familias em vulnerabilidade ligadas ao contexto escolar.

Sem esse controle, as doacoes podem ser feitas de forma desordenada, sem rastreio e sem priorizacao adequada. Com o sistema, a escola passa a ser o centro das solicitacoes, permitindo:

- registrar demandas de forma estruturada;
- conectar doadores a necessidades reais;
- acompanhar o andamento das doacoes;
- fortalecer o apoio aos alunos para reduzir faltas escolares;
- apoiar indiretamente a permanencia e a frequencia dos estudantes na escola.

## Como o projeto ajuda a aumentar a frequencia escolar

A ideia central e que o apoio nao fique apenas na entrega de itens, mas contribua para melhorar a condicao da familia e, por consequencia, a permanencia da crianca na escola.

Quando a familia recebe apoio por meio da escola, existe maior chance de reduzir a ausencia por falta de comida, roupa ou material basico. Isso cria um efeito direto na frequencia escolar, porque o aluno passa a ter mais condicoes de comparecer e permanecer no ambiente de aprendizado.

## Como a aplicacao esta estruturada

A aplicacao foi implementada como uma solucao web com separacao entre interface e regras de negocio.

### Front-end

O front-end foi desenvolvido com:

- HTML para estrutura semantica;
- CSS para estilo visual e organizacao dos componentes;
- JavaScript para interacao com a API e controle dinamico da interface.

A pagina foi organizada com elementos semanticos e seccoes claras, como header, main, section, nav e footer. Isso melhora a leitura do conteudo, a manutencao do codigo e a acessibilidade da interface.

### Back-end

O back-end foi desenvolvido em:

- Node.js;
- Express como framework web;
- SQLite como banco de dados local.

O Express organiza as rotas, os controladores e os servicos da aplicacao. A aplicacao tambem usa autenticacao por JWT e regras de acesso por tipo de usuario.

## Responsividade mobile

A interface foi pensada para funcionar em computador e celular.

No mobile, o menu principal vira um menu hamburguer, o topo fica mais compacto e os elementos de login e navegaçao sao reorganizados para evitar que fiquem encostados. Isso melhora a experiencia do usuario em telas menores e permite usar o sistema em dispositivos moveis durante a demonstracao.

## Fluxo principal da aplicacao

- O recebedor registra solicitacoes de doacao vinculadas a uma escola.
- O doador visualiza demandas abertas e oferece a doacao.
- A instituicao gera um codigo de confirmacao.
- O doador confirma a doacao com o codigo fornecido.
- O recebimento e acompanhado pelo sistema.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Node.js
- Express
- SQLite
- JWT para autenticacao

## Estrutura do projeto

- `server.js`: ponto de entrada da aplicacao.
- `src/app.js`: configuracao do Express e das rotas.
- `src/controllers`: controladores da aplicacao.
- `src/services`: regras de negocio.
- `src/routes`: rotas da API.
- `src/database`: conexao e inicializacao do banco.
- `sistema_doacoes_prototipo.html`: interface principal.

## Como executar

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o servidor:

```bash
node server.js
```

3. Acesse no navegador:

```text
http://localhost:3000
```

## Credenciais de demonstracao

- Doador
  - Email: doador@sistema.local
  - Senha: 123456

- Recebedor
  - Email: recebedor@sistema.local
  - Senha: 123456

- Instituicao
  - Email: instituicao@sistema.local
  - Senha: 123456

- Admin
  - Email: admin@sistema.local
  - Senha: 123456

## Observacoes para avaliacao

O projeto esta em fase de prototipo funcional e ja contempla:

- interface web responsiva;
- controle de acesso por perfil;
- fluxo de solicitacao de doacoes;
- centralizacao do processo na escola;
- organizacao em frontend e backend;
- uso de HTML, CSS e um framework web no servidor.

Este README foi preparado para facilitar a leitura dos tutores e mostrar claramente o problema abordado, a solucao proposta e o estado atual da implementacao.
