# Guia Inicial para Cadastro de Serviços

## 📋 Visão Geral

Esta funcionalidade garante que novos usuários cadastrem seus serviços assim que acessam o sistema, orientando-os através de um fluxo intuitivo e à prova de falhas.

## 🎯 Objetivo

Quando um salão não possui nenhum serviço ativo cadastrado, o sistema automaticamente:
1. **Redireciona** o usuário para a página de serviços
2. **Exibe** um modal de orientação
3. **Atualiza** o estado em tempo real conforme serviços são criados/deletados

## 🏗️ Arquitetura

### 1. Fonte da Verdade: Campo `has_services`

O campo `has_services` é retornado pela função RPC `load_initial_data()` e indica:
- `false`: Salão não tem serviços ativos
- `true`: Salão tem pelo menos um serviço ativo

### 2. Contexto Global (`AppContext`)

```typescript
interface AppContextType {
  hasServices: boolean;
  updateHasServices: (hasServices: boolean) => void;
  // ... outros campos
}
```

### 3. Componentes Principais

#### `ServiceRedirect.tsx`
- **Função**: Redireciona automaticamente usuários sem serviços
- **Lógica**: Monitora `hasServices` e redireciona para `/servicos` se `false`

#### `ServiceGuideModal.tsx`
- **Função**: Modal de orientação para novos usuários
- **Conteúdo**: Mensagem de boas-vindas + botão para cadastrar serviço

#### `Servicos.tsx` (Atualizado)
- **Função**: Página de serviços com lógica de atualização
- **Recursos**: 
  - Modal de orientação automático
  - Atualização de `has_services` ao criar/deletar serviços

## 🔄 Fluxo de Funcionamento

### A. Login e Verificação Inicial
```mermaid
graph TD
    A[Usuário faz login] --> B[load_initial_data() é chamada]
    B --> C[has_services é verificado]
    C --> D{has_services = false?}
    D -->|Sim| E[Redireciona para /servicos]
    D -->|Não| F[Fluxo normal]
```

### B. Página de Serviços
```mermaid
graph TD
    A[Usuário acessa /servicos] --> B{has_services = false?}
    B -->|Sim| C[Mostra modal de orientação]
    B -->|Não| D[Página normal]
    C --> E[Usuário clica em "Cadastrar Serviço"]
    E --> F[Abre formulário de serviço]
    F --> G[Serviço é criado]
    G --> H[has_services = true]
    H --> I[Modal desaparece]
```

### C. Atualização em Tempo Real
```mermaid
graph TD
    A[Usuário cria primeiro serviço] --> B[addService() retorna true]
    B --> C[updateHasServices(true)]
    C --> D[Modal desaparece]
    
    E[Usuário deleta último serviço] --> F[removeService()]
    F --> G{services.length === 0?}
    G -->|Sim| H[updateHasServices(false)]
    H --> I[Modal reaparece]
```

## 🛠️ Implementação Técnica

### 1. Função RPC `load_initial_data()`

```sql
CREATE OR REPLACE FUNCTION load_initial_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    salon_data JSON;
    has_services BOOLEAN;
BEGIN
    -- Verificar se o salão tem serviços ativos
    SELECT EXISTS(
        SELECT 1 
        FROM services 
        WHERE salon_id = (SELECT salon_id FROM salon_users WHERE user_id = auth.uid()) 
        AND active = true
    ) INTO has_services;

    -- Retornar dados do salão com has_services
    RETURN json_build_object(
        'salons', json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'has_services', COALESCE(has_services, false)
            )
        )
    );
END;
$$;
```

### 2. Contexto AppContext Atualizado

```typescript
// Carregamento de dados iniciais
const loadInitialData = async (salonId: string) => {
  const { data, error } = await supabaseService.utilityService.getUserContext();
  
  if (data?.salons) {
    const salonData = data.salons.find((salon: any) => salon.id === salonId);
    if (salonData) {
      setHasServices(salonData.has_services || false);
    }
  }
};
```

### 3. Componente de Redirecionamento

```typescript
useEffect(() => {
  if (isReady && currentSalon && !hasServices) {
    navigate('/servicos', { replace: true });
  }
}, [hasServices, isReady, currentSalon, navigate]);
```

## 🎨 Interface do Usuário

### Modal de Orientação
- **Design**: Modal centralizado com ícone de tesoura
- **Mensagem**: "Bem-vindo(a) ao BelaGestão! Para começar a usar a agenda..."
- **Ação**: Botão "Cadastrar Novo Serviço" que abre o formulário

### Estados Visuais
- **Sem serviços**: Modal aparece automaticamente
- **Com serviços**: Modal não aparece, página funciona normalmente
- **Transições**: Suaves e responsivas

## 🔧 Configuração

### 1. Aplicar Migração
```bash
# A função RPC será criada automaticamente
supabase db push
```

### 2. Verificar Contexto
O `AppContext` já está configurado para carregar `has_services` automaticamente.

### 3. Testar Funcionalidade
1. Criar um novo salão sem serviços
2. Fazer login
3. Verificar redirecionamento para `/servicos`
4. Verificar aparecimento do modal
5. Criar um serviço e verificar desaparecimento do modal

## 🐛 Troubleshooting

### Problema: Modal não aparece
**Solução**: Verificar se `hasServices` está sendo carregado corretamente no `AppContext`

### Problema: Redirecionamento não funciona
**Solução**: Verificar se o componente `ServiceRedirect` está envolvendo as rotas

### Problema: Estado não atualiza
**Solução**: Verificar se `updateHasServices()` está sendo chamado corretamente

## 📈 Benefícios

1. **Experiência do Usuário**: Orientação clara e intuitiva
2. **Onboarding**: Reduz abandono de novos usuários
3. **Funcionalidade**: Garante que salões tenham serviços para usar a agenda
4. **Manutenibilidade**: Código modular e bem estruturado
5. **Performance**: Atualizações em tempo real sem reload

## 🔮 Próximos Passos

- [ ] Adicionar analytics para medir eficácia do guia
- [ ] Implementar tour interativo para novos usuários
- [ ] Adicionar dicas contextuais na agenda
- [ ] Criar templates de serviços pré-definidos 