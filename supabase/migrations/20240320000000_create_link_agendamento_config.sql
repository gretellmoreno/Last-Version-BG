-- Criar tabela de configurações do link de agendamento
CREATE TABLE link_agendamento_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  cor_primaria VARCHAR(7) NOT NULL DEFAULT '#6366F1',
  cor_secundaria VARCHAR(7) NOT NULL DEFAULT '#4F46E5',
  logotipo TEXT,
  mensagem_boas_vindas TEXT NOT NULL DEFAULT 'Bem-vindo ao nosso sistema de agendamento!',
  mostrar_precos BOOLEAN NOT NULL DEFAULT TRUE,
  mostrar_duracao_servicos BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(salon_id)
);

-- Criar função para atualizar o updated_at
CREATE OR REPLACE FUNCTION update_link_agendamento_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o updated_at
CREATE TRIGGER update_link_agendamento_config_updated_at
  BEFORE UPDATE ON link_agendamento_config
  FOR EACH ROW
  EXECUTE FUNCTION update_link_agendamento_config_updated_at();

-- Criar políticas RLS
ALTER TABLE link_agendamento_config ENABLE ROW LEVEL SECURITY;

-- Política para select
CREATE POLICY "Usuários podem ver configurações do seu salão" ON link_agendamento_config
  FOR SELECT USING (
    salon_id IN (
      SELECT salon_id FROM salon_users WHERE user_id = auth.uid()
    )
  );

-- Política para insert
CREATE POLICY "Usuários podem criar configurações para seu salão" ON link_agendamento_config
  FOR INSERT WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM salon_users WHERE user_id = auth.uid()
    )
  );

-- Política para update
CREATE POLICY "Usuários podem atualizar configurações do seu salão" ON link_agendamento_config
  FOR UPDATE USING (
    salon_id IN (
      SELECT salon_id FROM salon_users WHERE user_id = auth.uid()
    )
  );

-- Política para delete
CREATE POLICY "Usuários podem deletar configurações do seu salão" ON link_agendamento_config
  FOR DELETE USING (
    salon_id IN (
      SELECT salon_id FROM salon_users WHERE user_id = auth.uid()
    )
  ); 