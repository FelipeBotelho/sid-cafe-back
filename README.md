# API Node.js TypeScript Express

Uma API REST moderna construída com Node.js, TypeScript e Express.

## 🚀 Características

- **Node.js** com **TypeScript** para tipagem estática
- **Express.js** para criação de APIs REST
- Configuração de desenvolvimento com **ts-node**
- Compilação automática para produção
- Estrutura de projeto organizada

## 📁 Estrutura do Projeto

```
backend/
├── src/                 # Código-fonte TypeScript
│   └── app.ts          # Arquivo principal da aplicação
├── dist/               # Código compilado (gerado automaticamente)
├── .github/            # Configurações do GitHub
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
└── README.md          # Este arquivo
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Executa a API em modo desenvolvimento com ts-node
- `npm run build` - Compila TypeScript para JavaScript na pasta dist/
- `npm start` - Executa a aplicação compilada
- `npm run watch` - Compila TypeScript em modo watch

## 🏃‍♂️ Como Executar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar a API:**
   - URL principal: http://localhost:3000
   - Health check: http://localhost:3000/health

## 📦 Dependências

### Produção
- **express** - Framework web para Node.js

### Desenvolvimento
- **typescript** - Linguagem TypeScript
- **ts-node** - Execução direta de TypeScript
- **@types/express** - Tipagens para Express
- **@types/node** - Tipagens para Node.js

## 🔧 Configuração

A aplicação roda na porta **3000** por padrão. Você pode alterar isso definindo a variável de ambiente `PORT`:

```bash
PORT=8080 npm run dev
```

## 📝 Endpoints Disponíveis

- `GET /` - Retorna mensagem de boas-vindas
- `GET /health` - Health check da aplicação

## 🚀 Deploy

Para fazer deploy em produção:

1. Compile o código:
   ```bash
   npm run build
   ```

2. Execute a aplicação:
   ```bash
   npm start
   ```