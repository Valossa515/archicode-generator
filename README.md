# DDD Project Generator

## 📝 Introdução

O **ArchiCode Generator** é uma extensão do Visual Studio Code que facilita a criação de estruturas de projetos baseados no **Domain-Driven Design (DDD)**. Ao utilizar essa extensão, você poderá criar rapidamente a arquitetura inicial de um projeto, com pastas configuráveis para Entidades, Repositórios, Casos de Uso, Controladores e muito mais.

Essa ferramenta foi criada para ajudar no processo de desenvolvimento de software, organizando o código de acordo com os princípios do DDD e da **Clean Architecture**, proporcionando um ponto de partida estruturado para novos projetos.

## 🎯 Objetivo

O objetivo principal desta extensão é automatizar a criação de estruturas de projetos, economizando tempo e esforço na configuração inicial e promovendo uma arquitetura limpa e escalável. Ideal para iniciantes e desenvolvedores experientes que desejam configurar rapidamente seus projetos.

## 🚀 Como instalar

1. Abra o **Visual Studio Code**.
2. Vá até a aba de **Extensões** (Ctrl + Shift + X).
3. Pesquise por **ArchiCode Generator**.
4. Clique em **Instalar**.

## ⚙️ Como usar

1. Abra o **VS Code** e carregue o seu **workspace** (pasta de projeto).
2. No **menu de comandos** (Ctrl + Shift + P), procure por **DDD Generator: Create Project Structure**.
3. Insira o nome do projeto que deseja criar.
4. A estrutura do projeto será gerada automaticamente na pasta do workspace.

## 📂 Estrutura do Projeto

Ao executar a extensão, a seguinte estrutura de pastas será criada:

/[Nome do Projeto] ├── Domain │ ├── Entities │ └── Repositories ├── Application │ └── UseCases ├── Infrastructure │ ├── Data │ └── Repositories └── API └── Controllers └── README.md

- **Domain**: Contém as entidades e interfaces de repositórios.
- **Application**: Contém os casos de uso, que implementam a lógica de negócios.
- **Infrastructure**: Contém a implementação de repositórios e acesso a dados.
- **API**: Contém os controladores que expõem os endpoints da API.
- **README.md**: Documento com informações básicas sobre o projeto.

## 🛠️ Tecnologias Utilizadas

- **Node.js** (para a extensão)
- **TypeScript**
- **Visual Studio Code API**
- **Domain-Driven Design (DDD)**
- **Clean Architecture**

## 🤝 Contribuindo

1. **Fork** https://github.com/Valossa515/archicode-generator.
2. Crie uma nova **branch** para suas alterações.
3. Faça as alterações e envie um **pull request**.
4. Certifique-se de testar suas alterações antes de enviar o pull request.## 📜 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
