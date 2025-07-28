# 📋 Migração: Agendamento Público

## 🎯 **Objetivo da Migração**

Migrar as configurações de agendamento público da tabela `salons` (campo `settings`) para uma tabela específica `agendamento_publico`, melhorando a organização dos dados e facilitando futuras expansões.

---

## 🗄️ **Estrutura da Nova Tabela**

### **Tabela: `agendamento_publico`**

| Campo | Tipo | Descrição | Padrão |
|-------|------|-----------|---------|
| `id` | UUID | Chave primária | `gen_random_uuid()` |
| `salon_id` | UUID | ID do salão (FK) | - |
| `ativo` | BOOLEAN | Status do agendamento online | `false` |
| `nome_exibicao` | TEXT | Nome público do salão | `NULL` |
| `foto_perfil_url` | TEXT | URL da foto do perfil | `NULL` |
| `whatsapp` | TEXT | WhatsApp público | `NULL` |
| `instagram` | TEXT | Instagram público | `NULL` |
| `endereco` | TEXT | Endereço público | `NULL` |
| `cor_primaria` | TEXT | Cor primária da interface | `#6366f1` |
| `cor_secundaria` | TEXT | Cor secundária da interface | `#4f46e5` |
| `logotipo_url` | TEXT | URL do logotipo | `NULL` |
| `mensagem_boas_vindas` | TEXT | Mensagem de boas-vindas | `Bem-vindo ao nosso agendamento online!` |
| `mostrar_precos` | BOOLEAN | Exibir preços dos serviços | `true` |
| `mostrar_duracao_servicos` | BOOLEAN | Exibir duração dos serviços | `true` |
| `intervalo_tempo` | INTEGER | Intervalo entre horários (min) | `30` |
| `tempo_minimo_antecedencia` | INTEGER | Antecedência mínima (min) | `60` |
| `periodo_maximo_agendamento` | INTEGER | Período máximo (dias) | `7` |
| `permitir_cancelamento_cliente` | BOOLEAN | Clientes podem cancelar | `true` |
| `horario_funcionamento` | JSONB | Horários por dia da semana | JSON padrão |
| `notificar_via_whatsapp` | BOOLEAN | Notificações via WhatsApp | `true` |
| `notificar_via_email` | BOOLEAN | Notificações via e-mail | `false` |
| `template_confirmacao` | TEXT | Template de confirmação | Template padrão |
| `template_lembrete` | TEXT | Template de lembrete | Template padrão |
| `configuracoes_extras` | JSONB | Configurações futuras | `{}` |
| `created_at` | TIMESTAMP | Data de criação | `NOW()` |
| `updated_at` | TIMESTAMP | Data de atualização | `NOW()` |

---

## 🔧 **Funções RPC Criadas**

### **1. `get_agendamento_publico_config(p_salon_id UUID)`**
- **Objetivo**: Obter todas as configurações de agendamento público de um salão
- **Parâmetros**: 
  - `p_salon_id`: UUID do salão
- **Retorna**: Todas as configurações da tabela `agendamento_publico`

### **2. `save_agendamento_publico_config(...)`**
- **Objetivo**: Salvar/atualizar configurações de agendamento público
- **Parâmetros**: Todos os campos da tabela (opcionais, permite updates parciais)
- **Retorna**: 
  ```json
  {
    "success": true/false,
    "message": "Mensagem de status",
    "config_id": "UUID da configuração"
  }
  ```

### **3. `migrate_existing_booking_settings()`**
- **Objetivo**: Migrar dados existentes da tabela `salons` para `agendamento_publico`
- **Uso**: Executar uma única vez após a criação da tabela

---

## 📝 **Instruções de Migração**

### **Passo 1: Executar a Migração SQL**
```sql
-- Aplicar o arquivo de migração
-- Este comando criará a tabela e todas as funções
```

### **Passo 2: Migrar Dados Existentes**
```sql
-- Executar a função de migração para mover dados existentes
SELECT migrate_existing_booking_settings();
```

### **Passo 3: Verificar Migração**
```sql
-- Verificar se os dados foram migrados corretamente
SELECT 
    s.name as salon_name,
    ap.ativo,
    ap.nome_exibicao,
    ap.intervalo_tempo,
    ap.tempo_minimo_antecedencia
FROM salons s
LEFT JOIN agendamento_publico ap ON s.id = ap.salon_id
WHERE s.settings IS NOT NULL;
```

---

## 🔄 **Mapeamento de Dados**

### **Da Tabela `salons` para `agendamento_publico`:**

| Campo Antigo (salons) | Campo Novo (agendamento_publico) |
|----------------------|----------------------------------|
| `settings.online_booking_enabled` | `ativo` |
| `public_display_name` | `nome_exibicao` |
| `public_profile_photo_url` | `foto_perfil_url` |
| `public_whatsapp` | `whatsapp` |
| `public_instagram` | `instagram` |
| `public_address` | `endereco` |
| `settings.slot_interval` | `intervalo_tempo` |
| `settings.min_booking_notice` | `tempo_minimo_antecedencia` |
| `settings.max_booking_period` | `periodo_maximo_agendamento` |
| `settings.allow_client_cancellation` | `permitir_cancelamento_cliente` |

---

## 💻 **Atualização do Frontend**

### **Antes (usando `salons.settings`):**
```typescript
// Buscar configurações
const { data } = await supabase
  .from('salons')
  .select('settings, public_display_name, public_whatsapp')
  .eq('id', salonId)
  .single();

// Salvar configurações
const newSettings = { ...currentSettings, online_booking_enabled: true };
await supabase
  .from('salons')
  .update({ settings: newSettings })
  .eq('id', salonId);
```

### **Depois (usando nova tabela):**
```typescript
// Buscar configurações
const { data } = await supabase.rpc('get_agendamento_publico_config', {
  p_salon_id: salonId
});

// Salvar configurações
await supabase.rpc('save_agendamento_publico_config', {
  p_salon_id: salonId,
  p_ativo: true,
  p_nome_exibicao: 'Novo Nome',
  p_intervalo_tempo: 30
});
```

---

## 🎯 **Benefícios da Nova Estrutura**

### **1. Organização**
- ✅ Dados específicos em tabela dedicada
- ✅ Campos tipados e com constraints
- ✅ Índices otimizados para consultas

### **2. Performance**
- ✅ Consultas mais rápidas (sem parsing de JSON)
- ✅ Índices específicos para agendamento público
- ✅ Queries mais eficientes

### **3. Manutenibilidade**
- ✅ Schema claro e documentado
- ✅ Validações a nível de banco
- ✅ Facilita futuras expansões

### **4. Funcionalidades Futuras**
- ✅ Horários de funcionamento por dia
- ✅ Templates de notificação personalizáveis
- ✅ Configurações avançadas em JSON
- ✅ Histórico de mudanças com timestamps

---

## 🚨 **Cuidados e Validações**

### **Antes de Executar:**
1. ✅ Fazer backup da tabela `salons`
2. ✅ Testar migração em ambiente de desenvolvimento
3. ✅ Verificar se todas as configurações existentes serão preservadas

### **Após a Migração:**
1. ✅ Validar que todos os salões têm configurações na nova tabela
2. ✅ Testar funcionamento do agendamento público
3. ✅ Verificar se as RPCs estão funcionando corretamente
4. ✅ Atualizar código frontend para usar novas RPCs

### **Rollback (se necessário):**
```sql
-- Em caso de problemas, a tabela original permanece intacta
-- Os dados podem ser recuperados do campo settings da tabela salons
DROP TABLE IF EXISTS agendamento_publico CASCADE;
```

---

## 📊 **Monitoramento Pós-Migração**

### **Queries de Verificação:**
```sql
-- 1. Verificar quantidade de configurações migradas
SELECT COUNT(*) FROM agendamento_publico;

-- 2. Verificar salões sem configuração na nova tabela
SELECT s.name 
FROM salons s 
LEFT JOIN agendamento_publico ap ON s.id = ap.salon_id 
WHERE ap.id IS NULL AND s.settings IS NOT NULL;

-- 3. Verificar configurações ativas
SELECT COUNT(*) FROM agendamento_publico WHERE ativo = true;
```

---

## 🔮 **Próximos Passos**

1. **Imediato**: Atualizar frontend para usar novas RPCs
2. **Curto prazo**: Remover dependências do campo `settings` em `salons`
3. **Médio prazo**: Implementar funcionalidades avançadas (horários, templates)
4. **Longo prazo**: Considerar remoção do campo `settings` da tabela `salons` 