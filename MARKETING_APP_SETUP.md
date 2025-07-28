# 🚀 Página de Marketing - BelaGestão

## 📋 **Visão Geral**

A página de marketing é uma landing page para captação e cadastro de novos salões no sistema BelaGestão. Ela está disponível em `http://app.localhost:5173` e oferece um formulário completo para criação de novos salões.

---

## 🌐 **Acesso**

- **URL**: `http://app.localhost:5173`
- **Domínio**: `app.localhost`
- **Rota**: Qualquer rota neste domínio mostra a página de marketing

---

## 🎯 **Funcionalidades**

### **1. Landing Page**
- ✅ Design moderno e responsivo
- ✅ Seção de benefícios do sistema
- ✅ Call-to-action claro para cadastro
- ✅ Branding consistente com BelaGestão

### **2. Formulário de Cadastro**
- ✅ **Nome do Salão**: Nome comercial do estabelecimento
- ✅ **Subdomínio**: URL personalizada (ex: `salao-da-maria`)
- ✅ **E-mail do Proprietário**: Para acesso administrativo
- ✅ **Senha**: Senha inicial do proprietário
- ✅ **Validação em tempo real**: Feedback imediato ao usuário

### **3. Integração com Edge Function**
- ✅ Comunicação com `create-salon` Edge Function
- ✅ Tratamento de respostas de sucesso e erro
- ✅ Redirecionamento automático após criação

---

## 🔧 **Implementação Técnica**

### **Estrutura do Payload**
```typescript
interface CreateSalonPayload {
  ownerEmail: string;      // E-mail do futuro dono
  ownerPassword: string;   // Senha desejada (min 6 chars)
  salonName: string;       // Nome comercial do salão
  subdomain: string;       // Subdomínio desejado
}
```

### **Resposta de Sucesso**
```typescript
{
  success: true,
  message: "Salão criado com sucesso!",
  salonUrl: "http://salao-da-maria.localhost:5173"
}
```

### **Resposta de Erro**
```typescript
{
  success: false,
  message: "Este subdomínio já está em uso."
}
```

---

## 🎨 **Design e UX**

### **Layout**
- **Grid responsivo**: 2 colunas em desktop, 1 coluna em mobile
- **Lado esquerdo**: Conteúdo de marketing e benefícios
- **Lado direito**: Formulário de cadastro
- **Cores**: Gradiente roxo-indigo consistente com o sistema

### **Estados da Interface**
- ✅ **Loading**: Spinner durante criação do salão
- ✅ **Erro**: Mensagem vermelha com ícone de alerta
- ✅ **Sucesso**: Tela de confirmação com redirecionamento

### **Validações**
- ✅ **E-mail**: Formato válido obrigatório
- ✅ **Senha**: Mínimo 6 caracteres
- ✅ **Subdomínio**: Mínimo 3 caracteres, auto-normalização
- ✅ **Nome do Salão**: Campo obrigatório

---

## 🔄 **Fluxo do Usuário**

1. **Acesso**: Usuário visita `app.localhost:5173`
2. **Visualização**: Vê landing page com benefícios
3. **Preenchimento**: Completa formulário de cadastro
4. **Validação**: Sistema valida dados em tempo real
5. **Submissão**: Clica em "Criar Meu Salão"
6. **Processamento**: Edge Function `criar-salao` cria salão e usuário
7. **Confirmação**: Tela de sucesso por 2 segundos
8. **Redirecionamento**: Vai para URL do novo salão

---

## 🛠️ **Normalização de Subdomínio**

### **Regras Aplicadas**
```typescript
const normalizeSubdomain = (value: string): string => {
  return value
    .toLowerCase()              // Minúsculas
    .normalize('NFD')           // Decompor acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '')   // Apenas letras, números, espaços e hífens
    .replace(/\s+/g, '-')           // Espaços → hífens
    .replace(/-+/g, '-')            // Múltiplos hífens → um hífen
    .replace(/^-|-$/g, '');         // Remover hífens nas pontas
};
```

### **Exemplos de Normalização**
- `"Salão da Maria"` → `"salao-da-maria"`
- `"Beleza & Estilo"` → `"beleza-estilo"`
- `"Ana's Beauty"` → `"anas-beauty"`

---

## 🔒 **Segurança**

### **Validações Frontend**
- ✅ Campos obrigatórios verificados
- ✅ Formato de e-mail validado
- ✅ Comprimento mínimo da senha
- ✅ Caracteres permitidos no subdomínio

### **Validações Backend** (Edge Function)
- ✅ Verificação de subdomínio único
- ✅ Validação de e-mail válido
- ✅ Criação segura de usuário no Supabase Auth
- ✅ Rollback em caso de erro

---

## 🧪 **Como Testar**

### **1. Configurar Hosts**
```
127.0.0.1       app.localhost
```

### **2. Acessar Página**
```bash
# Abrir no navegador
http://app.localhost:5173
```

### **3. Testar Formulário**
```
Nome do Salão: "Salão de Teste"
Subdomínio: "teste-local"
E-mail: "teste@exemplo.com"
Senha: "123456"
```

### **4. Verificar Resultado**
- ✅ Salão criado no banco
- ✅ Usuário criado no Supabase Auth
- ✅ Redirecionamento para `teste-local.localhost:5173`

---

## 📱 **Responsividade**

### **Desktop** (>= 1024px)
- Layout de 2 colunas
- Formulário lado direito
- Marketing lado esquerdo

### **Tablet** (768px - 1023px)
- Layout de 2 colunas compacto
- Texto de marketing reduzido

### **Mobile** (< 768px)
- Layout de 1 coluna
- Marketing acima do formulário
- Formulário em tela cheia

---

## 🚀 **Melhorias Futuras**

1. **Analytics**: Tracking de conversões
2. **A/B Testing**: Diferentes versões da landing page
3. **SEO**: Meta tags e estrutura otimizada
4. **Domínio próprio**: Migração para domínio de produção
5. **Planos**: Diferentes opções de assinatura
6. **Testimonials**: Depoimentos de clientes
7. **Demo**: Preview do sistema em ação 