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

# TODO - Visualizar e Gerar Proposta no Histórico

- [x] Adicionar botão "Visualizar" e "Gerar Proposta" na listagem do histórico
- [x] Reconstruir dados do orçamento salvo para exibir no ProposalView
- [x] Testar e salvar checkpoint

# TODO - Campos Obrigatórios, Descontos e Proposta Editável

- [x] Tornar nome, CPF e telefone obrigatórios no formulário
- [x] Remover campo de e-mail do formulário e da interface
- [x] Criar sistema de descontos configuráveis (ativar/desativar, descrição editável, múltiplos)
- [x] Adicionar descontos ao cálculo do valor final
- [x] Exibir descontos no painel de resultado em tempo real
- [x] Adicionar aba de Descontos nas configurações
- [x] Criar configurações editáveis da proposta (formas de pagamento, prazo, condições)
- [x] Adicionar aba de Proposta nas configurações
- [x] Atualizar ProposalView para usar as configurações de proposta e descontos
- [x] Atualizar schema/rotas do banco para salvar descontos junto ao orçamento
- [x] Testar e salvar checkpoint

# TODO - White Label (Multi-Tenant)

- [x] Criar tabela 'empresas' (tenant) no schema: id, nome, logo, corPrimaria, corSecundaria, telefone, whatsapp, endereco, cnpj, crc, responsavel, email, site, configProposta
- [x] Vincular tabela internalUsers a uma empresa (tenantId)
- [x] Vincular tabela orcamentos a uma empresa (tenantId)
- [x] Criar rotas tRPC para CRUD de empresa e upload de logo
- [x] Implementar middleware multi-tenant (filtrar dados por empresa do usuário logado)
- [x] Criar painel de personalização no frontend: logo, cores, nome, dados de contato
- [x] Aplicar tema dinâmico (cores CSS variáveis) baseado na empresa do usuário logado
- [x] Atualizar tela de Login para usar logo e cores da empresa
- [x] Atualizar Header para usar logo e nome da empresa
- [x] Atualizar ProposalView para usar dados da empresa na proposta
- [x] Painel super-admin (Higor) para gerenciar todas as empresas
- [x] Testar e salvar checkpoint

# TODO - Bug Fix: Erro de validação de e-mail ao atualizar empresa

- [x] Corrigir validação Zod do campo email na rota empresa.update (aceitar string vazia ou null)
- [x] Corrigir validação Zod do campo email na rota empresa.create
- [x] Testar e salvar checkpoint

# TODO - Cadastro de Usuário Master ao Criar Empresa

- [x] Adicionar campos de usuário admin (nome, email, senha) no formulário de criação de empresa
- [x] Criar rota backend que cria empresa + usuário admin vinculado em uma transação
- [x] Atualizar página Empresas.tsx com os novos campos
- [x] Testar e salvar checkpoint

# TODO - Corrigir seleção de empresa no login

- [x] Investigar como a rota branding seleciona a empresa exibida no login
- [x] Permitir que o login exiba a empresa correta (Numer como principal/padrão)
- [x] Testar e salvar checkpoint

# TODO - Gestão de Usuários por Empresa no Painel Superadmin

- [x] Adicionar botão "Ver Usuários" em cada card de empresa
- [x] Criar painel expandido com lista de usuários da empresa
- [x] Permitir criar novo usuário vinculado à empresa
- [x] Permitir remover usuário da empresa
- [x] Testar e salvar checkpoint

# TODO - Bug Fix: 404 em /login?empresa=2

- [x] Corrigir servidor Express para servir index.html em todas as rotas SPA (incluindo query params)
- [x] Testar e salvar checkpoint

# TODO - Bug Fix: Isolamento Multi-Tenant

- [x] Investigar e corrigir cores da empresa 1 aparecendo na empresa 2
- [x] Investigar e corrigir orçamentos da empresa 2 não aparecendo
- [x] Verificar todas as páginas para garantir isolamento de dados por empresa
- [x] Testar e salvar checkpoint

# TODO - Franquia: 1ª Rend. Trib. PJ incluída no valor base

- [x] Adicionar lógica de franquia no cálculo: item 01 (Rend. Trib. PJ) cobra apenas a partir da 2ª unidade
- [x] Atualizar exibição visual do item 01 para indicar "1ª incluída no valor base"
- [x] Atualizar ProposalView para refletir a franquia no detalhamento
- [x] Testar e salvar checkpoint
