# 🌐 Sistema de Subdomínios - BelaGestão

## 📋 **Configuração para Desenvolvimento Local**

### **1. Configurar Hosts (Já feito)**
```
127.0.0.1       app.localhost
127.0.0.1       salao-a.localhost  
127.0.0.1       salao-b.localhost
```

### **2. URLs de Acesso**
- **Página de Marketing**: `http://app.localhost:5173` (cadastro de novos salões)
- **Domínio Principal**: `http://localhost:5173` (admin/dashboard)
- **Salão A**: `http://salao-a.localhost:5173` (interface do salão)
- **Salão B**: `http://salao-b.localhost:5173` (interface do salão)

---

## 🔧 **Como Funciona**

### **Detecção Automática**
```typescript
// Hook detecta subdomínio automaticamente
const { salonSlug, isMainDomain } = useSubdomain();

// Exemplos:
// localhost:5173 → { salonSlug: null, isMainDomain: true }
// salao-a.localhost:5173 → { salonSlug: "salao-a", isMainDomain: false }
```

### **Carregamento de Dados**
```typescript
// Se tem subdomínio, busca salão pelo subdomínio via RPC
if (salonSlug && !isMainDomain) {
  const salon = await salonService.getSalonBySlug(salonSlug);
  // Chama RPC: get_salon_by_subdomain({ p_subdomain: salonSlug })
}

// Se é domínio principal, usa autenticação tradicional
if (isMainDomain && isAuthenticated) {
  // Carrega salões do usuário
}
```

---

## 🎯 **Fluxos de Uso**

### **1. Domínio Principal** (`localhost:5173`)
- ✅ Tela de login obrigatória
- ✅ Dashboard completo do sistema
- ✅ Gestão de múltiplos salões
- ✅ Configurações globais

### **2. Subdomínio do Salão** (`salao-a.localhost:5173`)
- ✅ Identifica salão automaticamente pelo slug
- ✅ Interface específica do salão
- ✅ Páginas públicas (agendamento) sem login
- ✅ Dashboard do salão com login

### **3. Páginas por Contexto**

#### **Página de Marketing** (`app.localhost:5173`)
- Formulário de cadastro de novos salões
- Chama Edge Function `create-salon`
- Redireciona para novo salão após criação

#### **Subdomínio SEM autenticação:**
- `/agendamento` → Página pública de agendamento (usa RPC para obter dados do salão)
- Qualquer outra rota (incluindo `/`) → Tela de login do salão

#### **Subdomínio COM autenticação:**
- `/agenda` → Dashboard do salão
- `/clientes`, `/servicos`, etc. → Funcionalidades completas

#### **Domínio principal:**
- Sempre requer autenticação
- Dashboard com seleção de salões

---

## 🗃️ **Estrutura de Dados**

### **RPC Function** (necessária)
```sql
-- Função RPC get_salon_by_subdomain já existente
-- Retorna: { id, name, subdomain, public_profile_photo_url, public_display_name }

-- Payload: { "p_subdomain": "salao-da-maria" }
-- Resposta de sucesso: objeto do salão
-- Resposta de erro: error não nulo, data nulo
```

### **Estrutura de Dados**
```typescript
interface SalonData {
  id: string;
  name: string;
  subdomain: string;
  public_profile_photo_url: string | null;
  public_display_name: string | null;
}
```

---

## 🚀 **Implementação Técnica**

### **1. Hook de Subdomínio** (`useSubdomain.ts`)
- ✅ Detecta subdomínio automaticamente
- ✅ Funciona em dev e produção
- ✅ Filtra subdomínios de sistema (www, app, api)

### **2. Serviço de Salão** (`salonService.ts`)
- ✅ `getSalonBySlug()` - Busca salão pelo subdomínio via RPC `get_salon_by_subdomain`
- ✅ `getPublicSalonConfig()` - Dados públicos via RPC
- ✅ `isSlugAvailable()` - Verificar disponibilidade via RPC

### **3. Context Atualizado** (`AppContext.tsx`)
- ✅ Carregamento automático por subdomínio
- ✅ Estados de loading e erro
- ✅ Fallback para domínio principal

### **4. Páginas de Erro**
- ✅ `SalonNotFound` - Quando subdomínio inválido
- ✅ Botões para página principal e recarregar

---

## 🧪 **Como Testar**

### **1. Configurar Dados**
```sql
-- Inserir salão de teste
INSERT INTO salons (id, name, slug, active) VALUES 
('test-salon-id', 'Salão de Teste', 'salao-a', true);
```

### **2. Testar URLs**
```bash
# Página de marketing (cadastro de salões)
http://app.localhost:5173

# Domínio principal (precisa de login)
http://localhost:5173

# Subdomínio válido (carrega salão automaticamente)  
http://salao-a.localhost:5173

# Subdomínio inválido (mostra página de erro)
http://inexistente.localhost:5173
```

### **3. Testar Funcionalidades**
- ✅ Login de funcionários em subdomínio (rota principal `/`)
- ✅ Agendamento público em subdomínio (`/agendamento`)
- ✅ Dashboard completo após autenticação
- ✅ Redirecionamento correto de URLs

---

## 🎨 **UX/UI por Contexto**

### **Domínio Principal**
- Header com seletor de salões
- Menu global com todas as funcionalidades
- Branding geral do BelaGestão

### **Subdomínio do Salão**
- Header com nome do salão específico
- Menu focado nas funcionalidades do salão
- Branding personalizado (futuro)

---

## 🔒 **Segurança e Isolamento**

- ✅ Dados isolados por `salon_id`
- ✅ Verificação de `active = true`
- ✅ Validação de subdomínio no backend
- ✅ Contexto específico por salão
- ✅ Redirecionamento seguro para URLs inválidas

---

## 🔄 **Próximos Passos**

1. **Configurar DNS em produção**
2. **Implementar branding personalizado por salão**
3. **Otimizar SEO por subdomínio**
4. **Analytics separadas por salão**
5. **Certificados SSL wildcard** 