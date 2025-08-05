# Deploy em Produção - Belagestão

## ✅ Correção do Erro de Deploy

### **Problema Resolvido:**
- ❌ **Erro anterior**: "Conflicting functions and builds configuration"
- ✅ **Solução**: Removido conflito no `vercel.json`

### **Configuração Corrigida:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## Configurações Implementadas

### 1. Domínio Principal
- **URL**: `https://belagestao.com`
- **Subdomínios**: `salao-a.belagestao.com`, `salao-b.belagestao.com`, etc.

### 2. Configurações de Ambiente

#### Arquivos Atualizados:
- ✅ `src/hooks/useSubdomain.ts` - Suporte a belagestao.com
- ✅ `src/config/environment.ts` - Configuração centralizada
- ✅ `src/pages/SalonNotFound.tsx` - Redirecionamento correto
- ✅ `src/pages/MarketingApp.tsx` - URLs atualizadas
- ✅ `src/components/LoginForm.tsx` - URLs atualizadas
- ✅ `vercel.json` - Configuração corrigida (sem conflitos)

### 3. Estrutura de URLs

#### Desenvolvimento:
- `localhost:5173` - Domínio principal
- `salao-a.localhost:5173` - Subdomínio do salão

#### Produção:
- `https://belagestao.com` - Domínio principal
- `https://salao-a.belagestao.com` - Subdomínio do salão

### 4. Configurações do Vercel

#### Domínio Principal:
1. Conectar domínio `belagestao.com` no Vercel
2. Configurar DNS para apontar para o Vercel
3. Configurar SSL/HTTPS automaticamente

#### Subdomínios:
1. Configurar wildcard DNS: `*.belagestao.com`
2. O Vercel automaticamente roteará subdomínios
3. Cada subdomínio será uma instância separada da aplicação

### 5. Variáveis de Ambiente

#### No Vercel Dashboard:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
NODE_ENV=production
```

### 6. Configurações do Supabase

#### CORS Settings:
Adicionar no Supabase Dashboard:
```
https://belagestao.com
https://*.belagestao.com
https://*.vercel.app
```

#### RLS Policies:
Verificar se as políticas de segurança estão configuradas para produção.

### 7. Deploy Steps

1. **Preparar o código:**
   ```bash
   npm run build
   ```

2. **Deploy no Vercel:**
   ```bash
   vercel --prod
   ```

3. **Configurar domínio:**
   - No Vercel Dashboard, adicionar domínio `belagestao.com`
   - Configurar DNS conforme instruções do Vercel

4. **Testar subdomínios:**
   - Criar um salão de teste
   - Acessar via subdomínio: `teste.belagestao.com`

### 8. Monitoramento

#### Logs:
- Vercel Function Logs
- Supabase Logs
- Console do navegador

#### Métricas:
- Performance do Vercel
- Uptime do domínio
- Erros de CORS

### 9. Troubleshooting

#### Problemas Comuns:

1. **CORS Errors:**
   - Verificar configurações no Supabase
   - Adicionar domínios na whitelist

2. **Subdomínios não funcionam:**
   - Verificar DNS wildcard
   - Verificar configurações do Vercel

3. **SSL/HTTPS:**
   - Configurar automaticamente no Vercel
   - Verificar certificados

4. **Deploy Error - Conflicting Configuration:**
   - ✅ **Resolvido**: Removido conflito entre `builds` e `functions`
   - ✅ **Configuração correta**: Usando apenas `rewrites` para SPA

### 10. Backup e Rollback

#### Backup:
- Código no GitHub
- Banco de dados no Supabase
- Configurações no Vercel

#### Rollback:
- Reverter para versão anterior no Vercel
- Restaurar banco se necessário

## Status do Deploy

- ✅ Configurações de ambiente
- ✅ Suporte a subdomínios
- ✅ Configuração do Vercel corrigida
- ✅ URLs atualizadas
- ✅ Erro de deploy resolvido
- 🚀 Pronto para deploy! 