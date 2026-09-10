## Grimório Tormenta 20

Este projeto é um grimório digital para o RPG Tormenta 20. Ele permite aos usuários pesquisar e visualizar magias, poderes, condições e outros elementos do jogo.

### Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a build de produção.
- `npm run preview`: Visualiza a build de produção.

### Como Executar o Projeto

1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Inicie o servidor de desenvolvimento com `npm run dev`.

### Funcionalidades

- **Pesquisa de Magias**: Permite aos usuários pesquisar rituais por nome, elemento, círculo, etc.
- **Filtros Avançados**: Filtra magias e poderes com base em várias propriedades.
- **Condições**: Exibe informações detalhadas sobre todas as condições do Livro de Regras.
- **Token**: Monta tokens para mesa virtual a partir de qualquer imagem, com enquadramento livre, edição em lote e saída em PNG ou WebP.

### Molduras de token

As molduras em `src/assets/tokens/` são geradas a partir dos PSDs originais por
`scripts/gerar-frames-token.py`. Para regerar (ou acrescentar um tamanho novo):

```
pip install "psd-tools[composite]"
python scripts/gerar-frames-token.py "caminho/dos/psds"
```

O script reconhece o tamanho e a categoria pelo nome do arquivo
(`Token - Ameaça 3q (Enorme).psd` vira `ameaca-3q`) e a aba lista sozinha o que
encontrar na pasta.

### Tecnologias Utilizadas

- **Vue 3**: Framework JavaScript para construção de interfaces de usuário.
- **Vuetify**: Biblioteca de componentes UI para Vue.
- **Pinia**: Biblioteca de gerenciamento de estado para Vue.
- **Vite**: Ferramenta de build rápida para desenvolvimento web.

### Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

### Licença

Este é um projeto de fã e não possui fins lucrativos. Todos os direitos reservados aos respectivos criadores do RPG Tormenta 20.
