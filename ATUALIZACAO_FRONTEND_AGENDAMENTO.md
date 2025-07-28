# 🔄 Atualização Frontend - Agendamento Público

## 📋 **Resumo das Mudanças**

Atualização completa do frontend para consumir as novas funções RPC da tabela `agendamento_publico` em vez de usar diretamente a tabela `salons` com campo `settings`.

---

## 🗂️ **Arquivos Modificados**

### **1. `src/lib/supabaseService.ts`**
**Função:** `linkAgendamentoService`

#### **Antes:**
```typescript
// Usava tabela link_agendamento_config (que não existia)
const { data, error } = await supabase
  .from('link_agendamento_config')
  .select('*')
  .eq('salon_id', salonId)
  .single();
```

#### **Depois:**
```typescript
// Usa nova RPC get_agendamento_publico_config
const { data, error } = await supabase.rpc('get_agendamento_publico_config', {
  p_salon_id: salonId
});
```

#### **Novas Funcionalidades:**
- ✅ `getConfig()`: Usa RPC para carregar configurações
- ✅ `saveConfig()`: Usa RPC para salvar/atualizar configurações
- ✅ `toggleStatus()`: Função auxiliar para ativar/desativar agendamento

---

### **2. `src/types/index.ts`**
**Interface:** `LinkAgendamentoConfig`

#### **Campos Adicionados:**
```typescript
export interface LinkAgendamentoConfig {
  // Novos campos da tabela agendamento_publico
  id?: string;
  salon_id?: string;
  ativo: boolean;
  nome_exibicao?: string | null;
  foto_perfil_url?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  endereco?: string | null;
  intervalo_tempo: number;
  tempo_minimo_antecedencia: number;
  periodo_maximo_agendamento: number;
  permitir_cancelamento_cliente: boolean;
  horario_funcionamento?: any;
  notificar_via_whatsapp: boolean;
  notificar_via_email: boolean;
  template_confirmacao: string;
  template_lembrete: string;
  configuracoes_extras?: any;
  
  // Campos legados (compatibilidade)
  corPrimaria?: string; // → cor_primaria
  corSecundaria?: string; // → cor_secundaria
  logotipo?: string; // → logotipo_url
  mensagemBoasVindas?: string; // → mensagem_boas_vindas
}
```

---

### **3. `src/pages/LinkAgendamento.tsx`**
**Mudanças Principais:**

#### **A. Carregamento de Status**
```typescript
// ANTES: Consulta direta à tabela salons
const { data } = await supabase
  .from('salons')
  .select('settings')
  .eq('id', currentSalon.id);

// DEPOIS: Usa RPC
const { data } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
setIsLinkActive(data.ativo);
```

#### **B. Toggle de Status**
```typescript
// ANTES: Atualizava settings na tabela salons
const newSettings = { ...currentSettings, online_booking_enabled: novoStatus };
await supabase.from('salons').update({ settings: newSettings });

// DEPOIS: Usa RPC específica
await supabaseService.linkAgendamento.toggleStatus(currentSalon.id, novoStatus);
```

#### **C. Configurações da Agenda**
```typescript
// ANTES: Carregava settings da tabela salons
const { data } = await supabase.from('salons').select('subdomain, settings');

// DEPOIS: Separado - RPC + consulta direta
const configData = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
const salonData = await supabase.from('salons').select('subdomain');
```

#### **D. Perfil Público**
```typescript
// ANTES: Campos public_* na tabela salons
const { data } = await supabase.from('salons').select('public_display_name, public_whatsapp...');

// DEPOIS: Campos na nova tabela via RPC
const { data } = await supabaseService.linkAgendamento.getConfig(currentSalon.id);
// Usa: nome_exibicao, whatsapp, instagram, endereco, foto_perfil_url
```

---

### **4. `src/pages/AgendamentoPublico.tsx`**
**Compatibilidade com Campos Legados:**

```typescript
// Compatibilidade para nomes de campos
style={{
  '--cor-primaria': config.cor_primaria || config.corPrimaria,
  '--cor-secundaria': config.cor_secundaria || config.corSecundaria,
}}

// Logotipo
src={config.logotipo_url || config.logotipo}

// Mensagem
{config.mensagem_boas_vindas || config.mensagemBoasVindas}
```

---

## 🎯 **Benefícios Implementados**

### **1. Performance**
- ✅ **Menos parsing JSON**: Campos tipados em vez de JSON
- ✅ **Consultas otimizadas**: RPCs específicas
- ✅ **Índices dedicados**: Na nova tabela

### **2. Estrutura de Dados**
- ✅ **Campos tipados**: INTEGER, BOOLEAN, TEXT em vez de JSON
- ✅ **Validações**: A nível de banco de dados
- ✅ **Organização**: Dados específicos em tabela dedicada

### **3. Funcionalidades Avançadas**
- ✅ **Horário de funcionamento**: JSONB estruturado
- ✅ **Templates de notificação**: Personalizáveis
- ✅ **Configurações extras**: JSONB para expansões futuras
- ✅ **Timestamps**: `created_at` e `updated_at` automáticos

### **4. Manutenibilidade**
- ✅ **Código mais limpo**: Menos lógica de parsing
- ✅ **Debugging melhor**: Logs específicos e estruturados
- ✅ **Compatibilidade**: Mantém campos legados

---

## 🔄 **Mapeamento de Campos**

| Campo Antigo (salons) | Campo Novo (agendamento_publico) | Tipo |
|----------------------|----------------------------------|------|
| `settings.online_booking_enabled` | `ativo` | BOOLEAN |
| `public_display_name` | `nome_exibicao` | TEXT |
| `public_profile_photo_url` | `foto_perfil_url` | TEXT |
| `public_whatsapp` | `whatsapp` | TEXT |
| `public_instagram` | `instagram` | TEXT |
| `public_address` | `endereco` | TEXT |
| `settings.slot_interval` | `intervalo_tempo` | INTEGER |
| `settings.min_booking_notice` | `tempo_minimo_antecedencia` | INTEGER |
| `settings.max_booking_period` | `periodo_maximo_agendamento` | INTEGER |
| `settings.allow_client_cancellation` | `permitir_cancelamento_cliente` | BOOLEAN |

---

## 🔧 **Funções RPC Utilizadas**

### **1. `get_agendamento_publico_config(p_salon_id UUID)`**
- **Uso**: Carregar todas as configurações de agendamento público
- **Retorna**: Objeto completo com todas as configurações
- **Fallback**: Configurações padrão quando não existe registro

### **2. `save_agendamento_publico_config(...)`**
- **Uso**: Salvar/atualizar configurações (UPSERT)
- **Parâmetros**: Todos os campos opcionais (permite updates parciais)
- **Retorna**: `{success: boolean, message: string, config_id: UUID}`

---

## 🚨 **Pontos de Atenção**

### **1. Compatibilidade Legada**
- ✅ **Campos antigos preservados**: Interface mantém compatibilidade
- ✅ **Fallbacks implementados**: `config.cor_primaria || config.corPrimaria`
- ✅ **Migrations seguras**: Dados antigos não são perdidos

### **2. Dados Ainda na Tabela `salons`**
- ⚠️ **Subdomínio**: Ainda salvo em `salons.subdomain`
- ⚠️ **Razão**: Link de agendamento ainda usa subdomínio da tabela principal
- 📝 **Futuro**: Pode ser migrado para `agendamento_publico.subdomain` se necessário

### **3. Upload de Fotos**
- ✅ **Storage mantido**: Continua usando `salon-profiles` bucket
- ✅ **Referência atualizada**: URL salva na nova tabela
- ✅ **Limpeza**: Estado local atualizado corretamente

---

## 🧪 **Como Testar**

### **1. Status do Agendamento**
```bash
# Verificar se toggle funciona
1. Acessar /link-agendamento
2. Clicar no switch de ativar/desativar
3. Verificar se status persiste após refresh
```

### **2. Configurações da Agenda**
```bash
# Testar salvamento de configurações
1. Acessar "Configurações da Agenda"
2. Alterar intervalos, períodos, etc.
3. Salvar e verificar persistência
```

### **3. Perfil Público**
```bash
# Testar dados de perfil público
1. Acessar "Perfil Público"
2. Preencher nome, whatsapp, instagram, endereço
3. Fazer upload de foto
4. Salvar e verificar no /agendamento
```

### **4. Agendamento Público**
```bash
# Verificar página pública
1. Acessar salao-x.localhost:5173/agendamento
2. Verificar se dados do perfil aparecem
3. Verificar cores e logotipo personalizados
```

---

## 📊 **Monitoramento**

### **Logs Implementados:**
- 🔍 **Carregamento**: `console.log('✅ Configurações carregadas via RPC')`
- 💾 **Salvamento**: `console.log('✅ Status atualizado com sucesso via RPC')`
- ❌ **Erros**: `console.error('❌ Erro ao carregar configurações RPC')`
- 📸 **Upload**: `console.log('✅ Foto do perfil atualizada com sucesso via RPC')`

### **Verificações de Banco:**
```sql
-- Verificar se dados estão sendo salvos corretamente
SELECT * FROM agendamento_publico WHERE salon_id = 'uuid-do-salao';

-- Verificar atividade recente
SELECT salon_id, ativo, updated_at 
FROM agendamento_publico 
ORDER BY updated_at DESC;
```

---

## 🎉 **Status da Migração**

- ✅ **Backend**: Tabela e RPCs criadas
- ✅ **Frontend**: Atualizado para usar novas RPCs
- ✅ **Compatibilidade**: Mantida com campos legados
- ✅ **Testes**: Fluxos principais funcionando
- ✅ **Documentação**: Completa e atualizada

**🚀 A migração está completa e pronta para uso!** 