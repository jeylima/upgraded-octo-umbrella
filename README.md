# Gestão de Orçamentos — Portas Lisas Premium

Aplicação web leve para uso comercial diário em visitas a clientes de marcenaria.

## Funcionalidades

- Registo de clientes (nome, telefone, localização e observações).
- Um cliente pode ter vários orçamentos.
- Orçamento com portas ilimitadas.
- Cálculo automático de área (m²) e subtotal por linha.
- Preço por m² editável.
- Total geral automático.
- Visualização limpa para apresentação ao cliente.
- Geração de PDF via impressão do navegador (`Gerar PDF`).
- Data automática e espaço para assinatura.
- Persistência local no navegador (LocalStorage).

## Como usar

1. Abra `index.html` no navegador.
2. Crie/seleciona um cliente.
3. Defina o preço por m².
4. Adicione as portas (largura, altura e quantidade).
5. Guarde o orçamento.
6. Use **Gerar PDF** para imprimir/guardar como PDF.

## Estrutura

- `index.html` — interface principal.
- `styles.css` — design premium minimalista e responsivo.
- `app.js` — lógica da aplicação, cálculos e armazenamento local.
