# Lista de Tarefas

Uma aplicação de lista de tarefas responsiva construída com HTML, CSS e JavaScript.

## Funcionalidades

- Adicionar novas tarefas
- Definir nível de dificuldade para cada tarefa (Fácil, Médio, Difícil)
- Marcar tarefas como concluídas
- Excluir tarefas individualmente
- Filtrar tarefas por status (Todas, Ativas, Concluídas)
- Filtrar tarefas por dificuldade (Todas, Fácil, Médio, Difícil)
- Limpar todas as tarefas concluídas
- Contador de tarefas pendentes
- Armazenamento local para persistência de dados
- Design responsivo para todos os tamanhos de tela

## Tecnologias Utilizadas

- HTML5
- CSS3 (com variáveis CSS, Flexbox, Media Queries)
- JavaScript (Vanilla JS)
- Local Storage para persistência de dados
- Font Awesome para ícones

## Como usar

1. Clone este repositório ou baixe os arquivos
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Comece a adicionar suas tarefas!

## Instruções

1. Digite o texto da tarefa no campo principal
2. Selecione o nível de dificuldade no menu dropdown (Fácil, Médio, Difícil)
3. Clique no botão (+) ou pressione Enter para adicionar a tarefa
4. Use os filtros de Status e Dificuldade para organizar suas tarefas
5. Marque as tarefas como concluídas clicando no checkbox
6. Remova tarefas individualmente clicando no ícone de lixeira

## Estrutura de Arquivos

- `index.html` - Estrutura HTML da aplicação
- `styles.css` - Estilos e responsividade da aplicação
- `script.js` - Lógica e funcionalidades da aplicação

## Personalização

Você pode personalizar as cores da aplicação editando as variáveis CSS no arquivo `styles.css`:

```css
:root {
    --primary-color: #3a86ff;
    --secondary-color: #8338ec;
    --completed-color: #38b000;
    --delete-color: #e63946;
    --background-light: #ffffff;
    --text-color: #333333;
    --border-color: #e1e1e1;
    --filter-hover: #f7f7f7;
    --difficulty-facil: #4caf50;
    --difficulty-medio: #ff9800;
    --difficulty-dificil: #f44336;
}
``` 