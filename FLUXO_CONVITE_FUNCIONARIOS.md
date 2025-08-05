# 🎯 Fluxo de Convite de Funcionários

## 📋 **Resumo do Fluxo Completo**

1. **Admin cria funcionário** → Edge Function `criar-funcionario`
2. **Edge Function envia convite** → `inviteUserByEmail` 
3. **Funcionário clica no email** → Redireciona para `/definir-senha`
4. **Funcionário define senha** → `supabase.auth.updateUser()`
5. **Redirecionamento automático** → `/agenda` (dashboard)

---

## 🔧 **Implementação Frontend**

### **1. Página de Definição de Senha (`/definir-senha`)**
- ✅ Detecta sessão temporária do convite
- ✅ Formulário para nova senha + confirmação
- ✅ Validação (mínimo 6 caracteres, senhas iguais)
- ✅ Estados de loading e erro
- ✅ Design responsivo e moderno
- ✅ Redirecionamento automático para `/agenda`

### **2. Status na Lista de Funcionários**
- 🟡 **Convite pendente**: `active = false` (amarelo)
- 🟢 **Ativo**: `active = true` (verde)

### **3. Criação via Edge Function**
```typescript
// Frontend chama Edge Function
const response = await fetch(`${supabaseUrl}/functions/v1/criar-funcionario`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseAnonKey}`,
  },
  body: JSON.stringify({
    salon_id: "uuid",
    subdomain: "salaodozed",
    email: "funcionario@email.com",
    name: "Nome do Funcionário", 
    role: "Cargo",
    phone: "11999999999",
    color: "#FF5733",
    commission_rate: 50
  })
});
```

---

## 📱 **UX/UI Features**

### **Página /definir-senha:**
- Logo do BelaGestão
- Título personalizado com email do usuário
- Campos de senha com toggle de visibilidade
- Validação em tempo real
- Mensagens de erro claras
- Loading state durante atualização
- Toast de sucesso
- Design consistente com o resto do app

### **Estados dos Funcionários:**
- **Desktop**: Badge colorido na tabela
- **Mobile**: Texto colorido nos cards
- **Cores**: Verde (ativo), Amarelo (convite pendente)

---

## 🔄 **Como Testar**

1. **Criar funcionário**: Vá em Profissionais → Adicionar → Preencher formulário
2. **Verificar status**: Deve aparecer "Convite pendente" (amarelo)
3. **Verificar email**: Funcionário recebe email com link
4. **Clicar no link**: Abre `/definir-senha` 
5. **Definir senha**: Preencher formulário → Redirect para `/agenda`
6. **Verificar status**: Agora deve aparecer "Ativo" (verde)

---

## 🎯 **Fluxo de Dados**

```mermaid
graph TD
    A[Admin cria funcionário] --> B[Edge Function]
    B --> C[Criar usuário Auth]
    B --> D[Inserir na tabela professionals]
    B --> E[Enviar email convite]
    E --> F[Funcionário clica email]
    F --> G[/definir-senha]
    G --> H[updateUser senha]
    H --> I[Redirect /agenda]
    I --> J[Status: Ativo]
```

---

## 🔒 **Segurança**

- ✅ Link de convite com token temporário
- ✅ Sessão temporária expira automaticamente
- ✅ Validação de senha no frontend e backend
- ✅ Redirecionamento seguro após definir senha
- ✅ Headers de autorização corretos nas requisições 