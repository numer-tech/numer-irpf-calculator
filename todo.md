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

# TODO - Fichas Oficiais IRPF

- [x] Atualizar ChecklistState com as 15 fichas oficiais do IRPF
- [x] Atualizar itensPreco com preços unitários para cada ficha oficial
- [x] Atualizar ChecklistSection com as fichas oficiais e ícones adequados
- [x] Atualizar SettingsPanel para refletir as novas fichas
- [x] Testar e salvar checkpoint

# TODO - Agrupamento das Fichas por Categoria

- [ ] Adicionar campo 'grupo' ao ItemPrecoConfig e definir grupos no hook
- [ ] Atualizar ChecklistSection para renderizar grupos com cabeçalhos visuais
- [ ] Testar e salvar checkpoint
