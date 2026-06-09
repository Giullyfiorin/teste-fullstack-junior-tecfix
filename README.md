README.md
# 🛠️ TecFix - Sistema de Controle de Ordens de Serviço

## Sobre o Projeto

O TecFix é um sistema web desenvolvido para gerenciar clientes e ordens de serviço de uma assistência técnica de eletrônicos.

Este projeto foi desenvolvido como teste técnico para a vaga de Desenvolvedor Júnior Fullstack, utilizando React JS e Supabase.

---

## Tecnologias Utilizadas

* React JS
* Vite
* JavaScript
* CSS
* Supabase
* PostgreSQL

---

## Funcionalidades

### Dashboard

* Total de Ordens de Serviço
* Quantidade de OS por status
* Faturamento total das OS finalizadas

### Gestão de Clientes

* Cadastro de clientes
* Listagem de clientes
* Validação de campos obrigatórios
* Validação de e-mail

### Gestão de Ordens de Serviço

* Criação de novas OS
* Associação da OS a um cliente
* Status inicial como "Pendente"
* Atualização de status
* Filtro por status
* Busca por cliente ou descrição
* Exibição de valores formatados em Real (R$)

---

## Estrutura do Banco de Dados

### Tabela: clientes

| Campo      | Tipo      |
| ---------- | --------- |
| id         | bigint    |
| nome       | text      |
| email      | text      |
| telefone   | text      |
| created_at | timestamp |

### Tabela: ordens_servico

| Campo      | Tipo      |
| ---------- | --------- |
| id         | bigint    |
| cliente_id | bigint    |
| descricao  | text      |
| valor      | numeric   |
| status     | text      |
| created_at | timestamp |

---

## Como Executar o Projeto

### Instalar dependências

```bash
npm install
```

### Configurar variáveis de ambiente

Criar um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=SEU_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
```

### Executar aplicação

```bash
npm run dev
```

---

## Banco de Dados

Executar o script SQL disponibilizado para criação das tabelas:

```sql
create table clientes (
  id bigint generated always as identity primary key,
  nome text not null,
  email text not null,
  telefone text not null,
  created_at timestamp default now()
);

create table ordens_servico (
  id bigint generated always as identity primary key,
  cliente_id bigint references clientes(id),
  descricao text not null,
  valor numeric(10,2) not null,
  status text default 'Pendente',
  created_at timestamp default now()
);
```

---

## Autor

Giully Fiorin
