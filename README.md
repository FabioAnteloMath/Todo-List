# Lista de Tarefas - Full Stack (MVC)

Uma aplicação moderna e responsiva de lista de tarefas, construída com Node.js, Express, SQLite, HTML, CSS e JavaScript. O projeto segue o padrão de arquitetura **MVC** (Model-View-Controller), com autenticação JWT, painel administrativo e interface intuitiva.

---

## 🚀 Funcionalidades

- **Autenticação de Usuários** (login, registro, JWT)
- **Painel Administrativo** para gerenciamento de tarefas e usuários
- **CRUD de Tarefas** (criar, listar, editar, excluir, aprovar)
- **Atribuição de tarefas** a usuários
- **Filtros por status e dificuldade**
- **Design responsivo** (desktop, tablet, mobile)
- **Interface moderna** com Bootstrap 5 e animações
- **Permissões** (admin/usuário)
- **Banco de dados SQLite** persistente

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express, SQLite, JWT, bcryptjs, cookie-parser, cors
- **Frontend:** HTML5, CSS3 (Flexbox, Grid, Variáveis, Animações), Bootstrap 5, JavaScript Vanilla
- **Arquitetura:** MVC (Model-View-Controller)

---

## 📁 Estrutura de Pastas

```
/
├── config/           # Configuração do banco de dados
│   └── database.js
├── controllers/      # Lógica de negócio (Controllers)
│   ├── authController.js
│   └── taskController.js
├── models/           # Acesso ao banco de dados (Models)
│   ├── userModel.js
│   └── taskModel.js
├── routes/           # Definição das rotas Express
│   ├── auth.js
│   └── task.js
├── public/           # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── login.html
│   ├── admin.html
│   ├── script.js
│   ├── admin.js
│   ├── styles.css
│   └── admin.css
├── server.js         # Inicialização do app e rotas globais
├── tasks.db          # Banco de dados SQLite
└── package.json
```

---

## ⚙️ Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/FabioAnteloMath/Todo-List.git
   cd Todo-List
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```
   O servidor estará disponível em [http://localhost:8080](http://localhost:8080)

4. **Acesse a aplicação:**
   - Frontend: [http://localhost:8080](http://localhost:8080)
   - Login/Admin: [http://localhost:8080/login.html](http://localhost:8080/login.html)

---

## 👤 Usuários e Permissões

- **Usuário comum:** pode visualizar e concluir tarefas atribuídas a ele.
- **Administrador:** pode criar, editar, excluir, aprovar tarefas e gerenciar usuários.

---

## 📝 Exemplos de Uso

- **Registrar e logar:** Acesse `/login.html` para criar uma conta ou fazer login.
- **Criar tarefa:** Apenas administradores podem criar tarefas e atribuí-las a usuários.
- **Aprovar tarefa:** Apenas administradores podem aprovar tarefas concluídas.
- **Editar perfil:** Usuários podem atualizar nome, email e senha.

---

## 💡 Personalização

- As cores e estilos podem ser alterados facilmente em `public/styles.css` usando variáveis CSS.
- O banco de dados é um arquivo local `tasks.db` (SQLite), fácil de backup e portabilidade.

---

## 🤝 Contribuições

Contribuições são bem-vindas! Siga os passos:
1. Faça um fork do projeto
2. Crie uma branch (`git checkout -b feature/NomeDaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Minha nova feature'`)
4. Push para seu fork (`git push origin feature/NomeDaFeature`)
5. Abra um Pull Request

---

## 👨‍💻 Autor

Matheus Fabio Antelo  
[LinkedIn](https://www.linkedin.com/in/matheusfabio)  
[GitHub](https://github.com/FabioAnteloMath)  
Email: matheusf.antelo@gmail.com
