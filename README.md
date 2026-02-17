# MoveIn
Plataforma web para orçamentação automática de mobiliário modular.
O sistema permite que clientes mobilhem apartamentos escolhendo combinações de módulos padrão, sem necessidade de projeto personalizado.
## Objetivo
Reduzir visitas presenciais e acelerar o fecho de contratos através de geração automática de orçamento.
## Tipos de utilizador
**Cliente**
Seleciona tipologia, estilo e confirma pedido.
**Parceiro (Fábrica)**
Recebe pedidos e executa produção.
**Administrador**
Acompanha pedidos e gere produção.
## Fluxo principal
1. Escolher tipologia do apartamento (T0–T3)
2. Escolher estilo
3. Gerar orçamento automático
4. Confirmar pedido
5. Produção
6. Entrega
## Regras do produto
* Não existem móveis personalizados
* Apenas módulos pré-definidos
* Preço calculado automaticamente
* Sistema deve ser rápido e previsível
## Stack técnica
Backend: Node.js + Express
Frontend: Next.js
Base de dados: PostgreSQL
Arquitetura em camadas:
controller → service → repository
## Desenvolvimento
O agente deve seguir o arquivo AGENT_START.md antes de qualquer alteração.
