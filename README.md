# Contact List

Implementação das três tarefas do teste técnico: validação de colchetes, API REST e aplicação web para gestão de pessoas e contatos.

## Tecnologias

- PHP 8.3+
- Laravel 13
- PostgreSQL 17
- PHPUnit 12
- PHPStan 2 com Larastan 3
- Laravel Pint
- Scramble
- ViaCEP
- Angular 22
- TypeScript 6
- ESLint, Prettier e Vitest
- Docker e FrankenPHP

## Demonstração

- Aplicação web: https://teste-ileva-web.onrender.com
- API: https://testeileva.onrender.com/api
- Documentação: https://testeileva.onrender.com/docs/api
- Health check: https://testeileva.onrender.com/up

## Estrutura

```text
├── backend/
│   ├── app/Actions/
│   ├── app/Challenge/BracketsValidator.php
│   ├── app/Http/
│   ├── app/Models/
│   ├── app/Rules/
│   ├── app/Services/ViaCep/
│   └── tests/
├── frontend/
│   ├── src/app/core/
│   ├── src/app/features/
│   └── src/app/shared/
└── compose.yaml
```

## Docker

Na raiz do repositório:

```bash
docker compose up --build
```

Serviços disponíveis:

- Aplicação web: `http://localhost:4200`
- API: `http://localhost:8000/api`
- Documentação: `http://localhost:8000/docs/api`
- Health check: `http://localhost:8000/up`

Para criar dados de demonstração:

```bash
docker compose exec api php artisan db:seed
```

O seeder cria nomes brasileiros, CPFs válidos e celulares com formato brasileiro. Todos os dados são sintéticos.

## Execução local do backend

```bash
cd backend
composer setup
composer dev
```

Por padrão, a execução local utiliza SQLite. O ambiente Docker utiliza PostgreSQL.

## Execução local do frontend

Com a API disponível em `http://localhost:8000`:

```bash
cd frontend
npm install
npm start
```

O servidor de desenvolvimento utiliza proxy para encaminhar as requisições `/api` ao backend.

## Verificações

```bash
cd backend
composer check
```

O comando executa Pint, PHPStan/Larastan e os testes automatizados com PHPUnit.

```bash
cd frontend
npm run check
```

O frontend verifica a formatação com Prettier, executa ESLint, testes com Vitest e o build de produção.

## Tarefa 1

O validador está em `backend/app/Challenge/BracketsValidator.php` e os testes em `backend/tests/Unit/Challenge/BracketsValidatorTest.php`.

A solução utiliza uma pilha, com complexidade de tempo `O(n)` e espaço `O(n)` no pior caso. A string vazia é considerada válida e caracteres diferentes dos seis delimitadores suportados tornam a entrada inválida.

## API

O fluxo de cada operação é `Route → Form Request → Controller → Action → Model`. O retorno passa pelo Resource e o status HTTP é definido no Controller.

Exemplo de criação de pessoa:

```json
{
  "name": "Maria Silva",
  "cpf": "529.982.247-25",
  "phone": "(11) 99999-8888",
  "address": {
    "cep": "01001-000",
    "number": "100",
    "complement": "Apto 12"
  }
}
```

CPF, celular e CEP são armazenados sem formatação. Ao criar ou alterar um endereço, a API consulta o ViaCEP para preencher logradouro, bairro, cidade e estado. CEP inexistente retorna `422`; indisponibilidade do serviço retorna `503`.

O celular informado na pessoa é o contato principal. A entidade de contatos permite cadastrar meios adicionais, incluindo e-mail, telefone e WhatsApp.

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/cep/{cep}` | Consulta um endereço pelo CEP |
| GET | `/api/people` | Lista pessoas |
| POST | `/api/people` | Cria uma pessoa |
| GET | `/api/people/{person}` | Exibe uma pessoa e seus contatos |
| PATCH | `/api/people/{person}` | Atualiza uma pessoa |
| DELETE | `/api/people/{person}` | Exclui uma pessoa e seus contatos |
| GET | `/api/people/{person}/contacts` | Lista os contatos da pessoa |
| POST | `/api/people/{person}/contacts` | Cria um contato |
| GET | `/api/contacts/{contact}` | Exibe um contato |
| PATCH | `/api/contacts/{contact}` | Atualiza um contato |
| DELETE | `/api/contacts/{contact}` | Exclui um contato |

Contatos aceitam os tipos `email`, `phone` e `whatsapp`. A validação do valor depende do tipo informado. O banco impede CPFs repetidos e também impede o mesmo valor de contato para uma pessoa, inclusive quando duas requisições chegam ao mesmo tempo.

As rotas de listagem aceitam `page` e `per_page`. A listagem de pessoas também aceita os filtros `name`, `cpf` e `phone`; o telefone procura tanto o celular principal quanto os contatos adicionais.

As respostas de listagem utilizam um contrato simples:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "last_page": 1,
    "total": 0
  }
}
```

Criação de contatos usa a pessoa na rota; consulta, atualização e exclusão usam diretamente o contato.

## Aplicação web

O frontend permite filtrar pessoas por nome, CPF e telefone, além de cadastrar, consultar, editar e excluir registros. No cadastro, a consulta do CEP preenche a prévia de logradouro, bairro, cidade e estado; a pessoa informa apenas número e complemento. Na tela de detalhes é possível gerenciar e-mails, telefones e contatos de WhatsApp.

Os formulários apresentam validações locais e também exibem os erros retornados pela API. Envios repetidos são bloqueados enquanto uma operação está em andamento, consultas antigas são canceladas e a grade é atualizada quando a aba volta a receber foco.

## Decisões

- O desafio de colchetes compartilha apenas o ambiente PHP e os testes do backend.
- Controllers tratam apenas entrada HTTP, execução do caso de uso, Resource e resposta HTTP.
- Actions concentram consultas e alterações de estado sem conhecer detalhes da resposta HTTP.
- A criação e atualização de endereço consultam o ViaCEP e persistem pessoa e endereço em transação.
- Form Requests concentram a validação e API Resources mantêm o formato das respostas.
- O Scramble gera a documentação automaticamente a partir das rotas, Form Requests e Resources.
- O frontend utiliza componentes standalone, carregamento por rota e detecção de mudanças `OnPush`.
- Requisições HTTP ficam concentradas em serviços, enquanto páginas e componentes controlam somente o estado da interface.
- A exclusão de uma pessoa remove endereço e contatos por chaves estrangeiras com cascade.
- A API não possui autenticação porque o requisito não define usuários ou controle de acesso.
