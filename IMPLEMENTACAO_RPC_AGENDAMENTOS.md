# Implementação das Funções RPC para Agendamentos

## Resumo das Alterações

Este documento detalha as implementações feitas no projeto para seguir a documentação das funções RPC `create_appointment` e `update_appointment_time`.

## 1. Funções RPC Implementadas

### 1.1 `create_appointment`

**Localização:** `src/lib/supabaseService.ts`

**Alterações:**
- Adicionado parâmetro `services` (array de objetos com `service_id`, `custom_price`, `custom_time`)
- Removido parâmetro `status` (será definido pela função RPC)
- Atualizado para enviar `p_services_json` conforme documentação
- Resposta agora retorna o agendamento completo se `success` for `true`

```typescript
async create(params: {
  salonId: string
  clientId: string
  professionalId: string
  date: string
  startTime: string
  services: Array<{
    service_id: string
    custom_price?: number
    custom_time?: number
  }>
  notes?: string
}): Promise<RPCResponse<any>>
```

### 1.2 `update_appointment_time`

**Localização:** `src/lib/supabaseService.ts`

**Nova função adicionada:**
- Específica para arrastar/redimensionar agendamentos
- Segue exatamente os parâmetros da documentação
- Retorna `success` e `appointment_id` ou `message` em caso de erro

```typescript
async updateTime(params: {
  appointmentId: string
  salonId: string
  newDate: string
  newStartTime: string
  newEndTime: string
  newProfessionalId: string
}): Promise<RPCResponse<any>>
```

### 1.3 `find_or_create_client`

**Localização:** `src/lib/supabaseService.ts`

**Nova função adicionada:**
- Permite encontrar cliente existente ou criar novo
- Retorna `client_id` para uso nas funções de agendamento

```typescript
async findOrCreate(params: {
  salonId: string
  name: string
  phone: string
  email?: string
}): Promise<RPCResponse<{ client_id: string }>>
```

## 2. Atualizações nos Contextos

### 2.1 BookingContext

**Localização:** `src/contexts/BookingContext.tsx`

**Alterações na função `addAgendamento`:**
- Implementa chamada para `find_or_create_client` quando necessário
- Prepara array de serviços no formato correto (`service_id`)
- Usa a nova estrutura da função `create_appointment`

## 3. Atualizações na Interface

### 3.1 Página Agenda

**Localização:** `src/pages/Agenda.tsx`

**Alterações em drag-and-drop:**
- `handleEventMove`: Atualizado para usar `updateTime` com todos os parâmetros necessários
- `handleEventResize`: Atualizado para usar `updateTime` mantendo profissional e data
- Formato de datas e horários ajustado (AAAA-MM-DD e HH:MM:SS)

### 3.2 Modal de Agendamento

**Localização:** `src/components/BookingModal.tsx`

**Alterações na função `createAgendamento`:**
- Prepara array `services` com `service_id` de cada serviço selecionado
- Usa nova estrutura da função `create_appointment`

## 4. Formatos de Dados

### 4.1 Entrada para `create_appointment`
```json
{
  "p_salon_id": "uuid",
  "p_client_id": "uuid",
  "p_professional_id": "uuid", 
  "p_date": "AAAA-MM-DD",
  "p_start_time": "HH:MM:SS",
  "p_services_json": [
    {
      "service_id": "uuid",
      "custom_price": 100.00,
      "custom_time": 60
    }
  ],
  "p_notes": "Observações"
}
```

### 4.2 Entrada para `update_appointment_time`
```json
{
  "p_appointment_id": "uuid",
  "p_salon_id": "uuid",
  "p_new_date": "AAAA-MM-DD",
  "p_new_start_time": "HH:MM:SS",
  "p_new_end_time": "HH:MM:SS",
  "p_new_professional_id": "uuid"
}
```

### 4.3 Resposta Esperada

Para `create_appointment`:
```json
{
  "success": true,
  "appointment": {
    "id": "uuid",
    "date": "AAAA-MM-DD",
    "start_time": "HH:MM:SS",
    "end_time": "HH:MM:SS",
    "client": { "name": "Nome", "id": "uuid" },
    "professional": { "name": "Nome", "id": "uuid" },
    "services": [...]
  }
}
```

Para `update_appointment_time`:
```json
{
  "success": true,
  "appointment_id": "uuid"
}
```

## 5. Observações Importantes

1. **Retrocompatibilidade:** A função `update` original foi mantida para outras atualizações
2. **Validação:** Todas as funções incluem tratamento de erro e validação de dados
3. **Tipos:** Mantida tipagem TypeScript para todas as novas funções
4. **Logs:** Implementados logs detalhados para debug das operações

## 6. Próximos Passos

1. Testar as funções RPC no backend do Supabase
2. Verificar se os formatos de resposta estão corretos
3. Implementar validações adicionais se necessário
4. Adicionar campos personalizados de preço e tempo nos formulários 