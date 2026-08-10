# LatiControl — Regras de Negócio e Requisitos (Protótipo MVP Fase 1)
 
## Contexto
Sistema para promotores de vendas gerenciarem, por cliente (mercado), lotes de produtos vinculados a um catálogo próprio, recebendo alertas de vencimento e registrando o histórico de contato com cada cliente para ação proativa de reposição.
 
---
 
## Entidades e campos
 
### Usuário (Promotor)
- Nome de usuário (login)
- Senha
- Criado manualmente pela equipe via banco de dados (conforme RN08 e RN18); sem autocadastro nesta fase
### Cliente (Mercado)
- Nome do mercado
- Endereço
- Contato (telefone/WhatsApp)
- Nome do responsável/contato
- Observações (campo livre)
- Status: Ativo / Inativo
- Data de cadastro
### Produto (Catálogo — próprio de cada promotor)
- Nome
- Marca
- Categoria (padrão fixo): Limpeza, Alimentos perecíveis, Alimentos não perecíveis, Higiene, Outros
- Unidade de medida: un, litro, kg, g, ml, pacote, caixa
- Data de cadastro
### Lote
- Produto associado (referência ao catálogo)
- Cliente/mercado associado
- Quantidade
- Número do lote
- Data de fabricação
- Data de validade
- Status manual: Em estoque / Vendido
- Status de validade (calculado automaticamente): Verde / Amarelo / Vermelho
- Observações (campo livre)
- Data de cadastro
### Registro de Contato (histórico vinculado ao lote)
- Lote associado
- Data/hora do registro
- Observação livre (anotação do promotor)
- Status do contato: Aguardando contato / Contato sem retorno / Venda confirmada / Venda recusada / Aguardando decisão
---
 
## Regras de Negócio
 
- **RN01** — Cada promotor visualiza apenas os clientes que ele mesmo cadastrou.
- **RN02** — Um lote de produto pertence a exatamente um cliente/mercado.
- **RN03** — O status de validade do lote é calculado automaticamente com base na data de validade e na data atual:
  - **Verde**: mais de 30 dias para vencer
  - **Amarelo**: entre 15 e 30 dias para vencer
  - **Vermelho**: menos de 15 dias para vencer (ou já vencido)
- **RN04** — O alerta é organizado por cliente e por lote: cada lote gera seu próprio alerta, agrupado dentro do cliente ao qual pertence.
- **RN05** — O status "Em estoque"/"Vendido" é definido manualmente pelo promotor, independente do status de validade calculado pelo sistema.
- **RN06** — Não há campos obrigatórios definidos nesta fase.
- **RN07** — Não há limite de clientes cadastrados por promotor.
- **RN08** — Não há controle de permissões nesta fase; cada promotor tem seu próprio acesso, criado manualmente via banco de dados pela equipe.
- **RN09** — O catálogo de produtos é individual de cada promotor (não compartilhado entre promotores nesta fase).
- **RN10** — Cada variação de embalagem/tamanho de um produto (ex: 500ml vs. 2L) é um cadastro de produto distinto no catálogo.
- **RN11** — As categorias de produto são fixas, definidas pela equipe, e não editáveis pelo promotor.
- **RN12** — Um mesmo produto pode ter vários lotes ativos simultaneamente, inclusive mais de um lote do mesmo produto no mesmo cliente.
- **RN13** — Um cliente não é excluído, apenas inativado. Fica oculto da listagem padrão e é acessível apenas via filtro específico.
- **RN14** — Lotes vinculados a um cliente inativado permanecem visíveis/editáveis, com aviso de que o cliente está desativado.
- **RN15** — O histórico de tentativas de contato de um lote é cumulativo; apenas o registro mais recente define o status atual exibido.
- **RN16** — O status de contato não é editável após criado — uma mudança de status exige a criação de um novo registro (novo "lembrete"), preservando o histórico anterior.
- **RN17** — Alertas não desaparecem automaticamente da central de notificações; permanecem salvos no histórico até serem tratados manualmente pelo promotor.
- **RN18** — O login exige usuário e senha previamente cadastrados no banco pela equipe (RN08); não há autocadastro nesta fase.
- **RN19** — Não há validação de força de senha ou expiração de sessão definida nesta fase (protótipo).
- **RN20** — Não há bloqueio por tentativas incorretas de login nesta fase — fica em aberto para fase futura.
---
 
## Requisitos Funcionais
 
- **RF01** — Login simples (usuário e senha), sem controle de permissões/perfis.
- **RF02** — Cadastro, edição, listagem e inativação de clientes (mercados), em tela única com todos os campos.
- **RF03** — Cadastro, edição, listagem e exclusão de lotes, vinculados a um cliente e a um produto do catálogo.
- **RF04** — Listagem de clientes com indicador visual de alerta (cor conforme RN03).
- **RF05** — Central de notificações geral: lista todos os alertas de todos os clientes.
- **RF06** — Dentro da tela de cada cliente, exibição apenas das notificações/alertas daquele cliente específico.
- **RF07** — Tela de detalhe do cliente, mostrando todos os lotes associados e seus status.
- **RF08** — Cálculo automático do nível de alerta de validade (verde/amarelo/vermelho) por lote.
- **RF09** — Atualização manual do status do produto (Em estoque / Vendido).
- **RF10** — Cadastro, edição e listagem de produtos no catálogo pessoal do promotor.
- **RF11** — Seleção de um produto já existente do catálogo ao cadastrar um novo lote.
- **RF12** — Modal de registro de contato dentro da central de notificações, exibindo nome e telefone do cliente (para cópia rápida), campo de observação livre e seleção do status de contato.
- **RF13** — Filtros na central de notificações por status e por data (sem filtro por cliente).
- **RF14** — Aviso visual em lotes vinculados a um cliente inativado, informando a condição e permitindo realocação do lote se necessário.
- **RF15** — Tela de login com campos de usuário e senha.
- **RF16** — Validação básica de campos obrigatórios (usuário e senha não podem ficar vazios).
- **RF17** — Mensagem de erro genérica ao inserir credenciais inválidas (ex: "Usuário ou senha incorretos"), sem indicar qual dos dois está errado.
- **RF18** — Ao autenticar com sucesso, redireciona para a tela de Notificações (tela inicial).
- **RF19** — Opção de "mostrar/ocultar senha" no campo de senha.
---
 
## Requisitos Não Funcionais
 
- **RNF01** — Interface responsiva, com prioridade para uso em dispositivos móveis (promotor em campo).
- **RNF02** — Sem exigência de desempenho/tempo de resposta formalizada nesta fase.
- **RNF03** — Sem suporte offline nesta fase — assume-se conexão disponível.
- **RNF04** — Sem requisitos de segurança formalizados nesta fase (protótipo, sem dados reais sensíveis).
---
 
## Navegação e estrutura de telas
 
**Tela de login (ponto de entrada):** campos de usuário e senha → ao autenticar com sucesso, direciona para a tela de Notificações.
 
**Menu inferior (4 ícones):**
1. Notificações (tela inicial após login, mostrando os alertas mais urgentes)
2. Clientes
3. Catálogo (com abas internas: Produtos e Lotes)
4. Configurações (perfil do usuário, sobre o dispositivo, etc.)
**Fluxo de cadastro de cliente:** tela única com todos os campos → ao salvar, retorna para a tela do próprio cliente.
 
---
 
## Status de contato (nomenclatura final)
 
| Status | Significado |
|---|---|
| Aguardando contato | Promotor ainda não tentou contato |
| Contato sem retorno | Tentou contato, não obteve êxito |
| Venda confirmada | Contato realizado, cliente comprou |
| Venda recusada | Contato realizado, cliente não quis comprar |
| Aguardando decisão | Contato realizado, cliente disse que vai pensar |
 
---
 
## Pendências para fases futuras (fora do escopo deste protótipo)
- Importação de catálogo de produtos via XML de nota fiscal
- Cadastro rápido de produto novo direto no fluxo de criação de lote (hoje precisa ser cadastrado separadamente antes)
- Notificação sugerindo cadastro de produtos/lotes logo após o cadastro de um novo cliente
- Compartilhamento de catálogo de produtos entre promotores
- Recuperação de senha e cadastro de novos usuários promotores via autoatendimento
 