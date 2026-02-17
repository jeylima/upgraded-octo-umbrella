# Arquitetura
Frontend:
Next.js + TypeScript
Backend:
Node.js + Express + TypeScript
Banco:
PostgreSQL
Estrutura Backend obrigatória:
controller → service → repository → database
Controllers:
Recebem requisição e retornam resposta
Services:
Contêm regras de negócio
Repositories:
Acesso ao banco
Regras:
* Controllers nunca acessam banco diretamente
* Lógica nunca no controller
* Tipagem obrigatória
* Código simples
