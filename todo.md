# TODO - Banco de Dados e Histórico de Orçamentos

- [x] Upgrade para web-db-user (banco de dados + storage)
- [x] Criar schema: tabela orcamentos (id, cliente, checklist, resultado, valor, status, comprovante, data)
- [x] Criar rotas API: POST /api/orcamentos, GET /api/orcamentos, PATCH /api/orcamentos/:id, DELETE /api/orcamentos/:id
- [x] Criar rota de upload de comprovante: POST /api/orcamentos/:id/comprovante
- [x] Criar página de histórico com filtros (todos, feitos, não feitos)
- [x] Implementar exclusão de orçamento
- [x] Implementar alteração de status (feito/não feito)
- [x] Implementar upload e visualização de comprovante de pagamento
- [x] Integrar botão "Salvar Orçamento" na calculadora
- [x] Adicionar navegação entre calculadora e histórico
- [x] Escrever testes vitest para rotas de orçamento
- [x] Testar e salvar checkpoint
