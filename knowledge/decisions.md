# Decisões Técnicas do Projeto
Este arquivo registra decisões permanentes.
O agente deve consultá-lo antes de sugerir mudanças arquiteturais.
---
## Arquitetura
Usamos arquitetura em camadas:
controller → service → repository
Nunca acessar banco diretamente no controller.
---
## Produto
O sistema NÃO permite móveis personalizados.
Apenas módulos padrão.
---
## Filosofia
Preferimos simplicidade a flexibilidade.
Evitar abstrações desnecessárias.
