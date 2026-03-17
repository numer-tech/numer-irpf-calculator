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

- [x] Adicionar campo 'grupo' ao ItemPrecoConfig e definir grupos no hook
- [x] Atualizar ChecklistSection para renderizar grupos com cabeçalhos visuais
- [x] Testar e salvar checkpoint

# TODO - Sistema de Login e Controle de Acesso

- [x] Adicionar campo userId na tabela de orçamentos (vincular ao criador)
- [x] Atualizar rotas tRPC para filtrar orçamentos por usuário logado
- [x] Criar rota admin que lista todos os orçamentos de todos os usuários
- [x] Adicionar tela de login obrigatória antes de acessar a calculadora
- [x] Implementar painel admin para Higor (master) ver todos os orçamentos
- [x] Filtro por usuário no painel admin
- [x] Atualizar testes vitest
- [x] Testar e salvar checkpoint

# TODO - Autenticação Própria (E-mail e Senha)

- [x] Instalar bcryptjs para hash de senhas
- [x] Criar tabela internalUsers (id, nome, email, passwordHash, role, ativo, createdAt)
- [x] Criar tabela sessions (id, userId, token, expiresAt)
- [x] Criar seed do usuário admin inicial (Higor)
- [x] Implementar rotas: POST /auth/login, POST /auth/logout, GET /auth/me
- [x] Implementar middleware de sessão próprio (cookie com token)
- [x] Criar tela de login com e-mail e senha (identidade Numer)
- [x] Criar painel admin: listar, criar, editar e desativar usuários
- [x] Proteger todas as rotas com a nova autenticação
- [x] Atualizar testes vitest
- [x] Testar e salvar checkpoint

# TODO - Correção de Bug: Erro de Login

- [x] Diagnosticar e corrigir erro de login com e-mail e senha
- [x] Testar login e salvar checkpoint

# TODO - Correção: Valores Iniciais das Fichas

- [x] Corrigir todas as fichas para iniciar com quantidade 0
- [x] Testar e salvar checkpoint
