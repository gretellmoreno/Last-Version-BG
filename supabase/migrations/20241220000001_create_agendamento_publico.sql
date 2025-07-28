-- =============================================
-- Migração: Criar tabela agendamento_publico
-- Data: 2024-12-20
-- Descrição: Move as configurações de agendamento público 
--           da tabela salons para uma tabela específica
-- =============================================

-- Criar tabela para configurações de agendamento público
CREATE TABLE IF NOT EXISTS agendamento_publico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    
    -- Estado do agendamento online
    ativo BOOLEAN NOT NULL DEFAULT false,
    
    -- Configurações de perfil público
    nome_exibicao TEXT,
    foto_perfil_url TEXT,
    whatsapp TEXT,
    instagram TEXT,
    endereco TEXT,
    
    -- Configurações visuais
    cor_primaria TEXT DEFAULT '#6366f1',
    cor_secundaria TEXT DEFAULT '#4f46e5',
    logotipo_url TEXT,
    mensagem_boas_vindas TEXT DEFAULT 'Bem-vindo ao nosso agendamento online!',
    
    -- Configurações de exibição
    mostrar_precos BOOLEAN DEFAULT true,
    mostrar_duracao_servicos BOOLEAN DEFAULT true,
    
    -- Configurações de agendamento
    intervalo_tempo INTEGER DEFAULT 30, -- em minutos
    tempo_minimo_antecedencia INTEGER DEFAULT 60, -- em minutos
    periodo_maximo_agendamento INTEGER DEFAULT 7, -- em dias
    permitir_cancelamento_cliente BOOLEAN DEFAULT true,
    
    -- Configurações de disponibilidade
    horario_funcionamento JSONB DEFAULT '{
        "segunda": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
        "terca": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
        "quarta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
        "quinta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
        "sexta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
        "sabado": {"ativo": true, "inicio": "08:00", "fim": "16:00"},
        "domingo": {"ativo": false, "inicio": "08:00", "fim": "16:00"}
    }'::jsonb,
    
    -- Configurações de notificação
    notificar_via_whatsapp BOOLEAN DEFAULT true,
    notificar_via_email BOOLEAN DEFAULT false,
    template_confirmacao TEXT DEFAULT 'Olá {cliente_nome}! Seu agendamento foi confirmado para {data} às {horario} com {profissional_nome}.',
    template_lembrete TEXT DEFAULT 'Olá {cliente_nome}! Lembramos que você tem um agendamento amanhã às {horario} com {profissional_nome}.',
    
    -- Configurações avançadas
    configuracoes_extras JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agendamento_publico_salon_id ON agendamento_publico(salon_id);
CREATE INDEX idx_agendamento_publico_ativo ON agendamento_publico(ativo);

-- Garantir que cada salão tenha apenas uma configuração
CREATE UNIQUE INDEX idx_agendamento_publico_salon_unique ON agendamento_publico(salon_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_agendamento_publico_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agendamento_publico_updated_at
    BEFORE UPDATE ON agendamento_publico
    FOR EACH ROW
    EXECUTE FUNCTION update_agendamento_publico_updated_at();

-- Função para migrar dados existentes da tabela salons (opcional - executar manualmente se necessário)
CREATE OR REPLACE FUNCTION migrate_existing_booking_settings()
RETURNS VOID AS $$
DECLARE
    salon_record RECORD;
    booking_settings JSONB;
BEGIN
    -- Iterar pelos salões que têm configurações no campo settings
    FOR salon_record IN 
        SELECT id, subdomain, settings, 
               public_display_name, public_profile_photo_url, 
               public_whatsapp, public_instagram, public_address
        FROM salons 
        WHERE settings IS NOT NULL
    LOOP
        -- Extrair configurações do campo settings
        booking_settings := salon_record.settings;
        
        -- Inserir na nova tabela (se ainda não existe)
        INSERT INTO agendamento_publico (
            salon_id,
            ativo,
            nome_exibicao,
            foto_perfil_url,
            whatsapp,
            instagram,
            endereco,
            intervalo_tempo,
            tempo_minimo_antecedencia,
            periodo_maximo_agendamento,
            permitir_cancelamento_cliente
        ) VALUES (
            salon_record.id,
            COALESCE((booking_settings->>'online_booking_enabled')::boolean, false),
            salon_record.public_display_name,
            salon_record.public_profile_photo_url,
            salon_record.public_whatsapp,
            salon_record.public_instagram,
            salon_record.public_address,
            COALESCE((booking_settings->>'slot_interval')::integer, 30),
            COALESCE((booking_settings->>'min_booking_notice')::integer, 60),
            COALESCE((booking_settings->>'max_booking_period')::integer, 7),
            COALESCE((booking_settings->>'allow_client_cancellation')::boolean, true)
        ) ON CONFLICT (salon_id) DO UPDATE SET
            ativo = EXCLUDED.ativo,
            nome_exibicao = EXCLUDED.nome_exibicao,
            foto_perfil_url = EXCLUDED.foto_perfil_url,
            whatsapp = EXCLUDED.whatsapp,
            instagram = EXCLUDED.instagram,
            endereco = EXCLUDED.endereco,
            intervalo_tempo = EXCLUDED.intervalo_tempo,
            tempo_minimo_antecedencia = EXCLUDED.tempo_minimo_antecedencia,
            periodo_maximo_agendamento = EXCLUDED.periodo_maximo_agendamento,
            permitir_cancelamento_cliente = EXCLUDED.permitir_cancelamento_cliente,
            updated_at = NOW();
    END LOOP;
    
    RAISE NOTICE 'Migração concluída com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- Função RPC para obter configurações de agendamento público
CREATE OR REPLACE FUNCTION get_agendamento_publico_config(p_salon_id UUID)
RETURNS TABLE (
    id UUID,
    salon_id UUID,
    ativo BOOLEAN,
    nome_exibicao TEXT,
    foto_perfil_url TEXT,
    whatsapp TEXT,
    instagram TEXT,
    endereco TEXT,
    cor_primaria TEXT,
    cor_secundaria TEXT,
    logotipo_url TEXT,
    mensagem_boas_vindas TEXT,
    mostrar_precos BOOLEAN,
    mostrar_duracao_servicos BOOLEAN,
    intervalo_tempo INTEGER,
    tempo_minimo_antecedencia INTEGER,
    periodo_maximo_agendamento INTEGER,
    permitir_cancelamento_cliente BOOLEAN,
    horario_funcionamento JSONB,
    notificar_via_whatsapp BOOLEAN,
    notificar_via_email BOOLEAN,
    template_confirmacao TEXT,
    template_lembrete TEXT,
    configuracoes_extras JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.id,
        ap.salon_id,
        ap.ativo,
        ap.nome_exibicao,
        ap.foto_perfil_url,
        ap.whatsapp,
        ap.instagram,
        ap.endereco,
        ap.cor_primaria,
        ap.cor_secundaria,
        ap.logotipo_url,
        ap.mensagem_boas_vindas,
        ap.mostrar_precos,
        ap.mostrar_duracao_servicos,
        ap.intervalo_tempo,
        ap.tempo_minimo_antecedencia,
        ap.periodo_maximo_agendamento,
        ap.permitir_cancelamento_cliente,
        ap.horario_funcionamento,
        ap.notificar_via_whatsapp,
        ap.notificar_via_email,
        ap.template_confirmacao,
        ap.template_lembrete,
        ap.configuracoes_extras,
        ap.created_at,
        ap.updated_at
    FROM agendamento_publico ap
    WHERE ap.salon_id = p_salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para salvar configurações de agendamento público
CREATE OR REPLACE FUNCTION save_agendamento_publico_config(
    p_salon_id UUID,
    p_ativo BOOLEAN DEFAULT NULL,
    p_nome_exibicao TEXT DEFAULT NULL,
    p_foto_perfil_url TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL,
    p_instagram TEXT DEFAULT NULL,
    p_endereco TEXT DEFAULT NULL,
    p_cor_primaria TEXT DEFAULT NULL,
    p_cor_secundaria TEXT DEFAULT NULL,
    p_logotipo_url TEXT DEFAULT NULL,
    p_mensagem_boas_vindas TEXT DEFAULT NULL,
    p_mostrar_precos BOOLEAN DEFAULT NULL,
    p_mostrar_duracao_servicos BOOLEAN DEFAULT NULL,
    p_intervalo_tempo INTEGER DEFAULT NULL,
    p_tempo_minimo_antecedencia INTEGER DEFAULT NULL,
    p_periodo_maximo_agendamento INTEGER DEFAULT NULL,
    p_permitir_cancelamento_cliente BOOLEAN DEFAULT NULL,
    p_horario_funcionamento JSONB DEFAULT NULL,
    p_notificar_via_whatsapp BOOLEAN DEFAULT NULL,
    p_notificar_via_email BOOLEAN DEFAULT NULL,
    p_template_confirmacao TEXT DEFAULT NULL,
    p_template_lembrete TEXT DEFAULT NULL,
    p_configuracoes_extras JSONB DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    config_id UUID
) AS $$
DECLARE
    v_config_id UUID;
BEGIN
    -- Upsert na tabela agendamento_publico
    INSERT INTO agendamento_publico (
        salon_id,
        ativo,
        nome_exibicao,
        foto_perfil_url,
        whatsapp,
        instagram,
        endereco,
        cor_primaria,
        cor_secundaria,
        logotipo_url,
        mensagem_boas_vindas,
        mostrar_precos,
        mostrar_duracao_servicos,
        intervalo_tempo,
        tempo_minimo_antecedencia,
        periodo_maximo_agendamento,
        permitir_cancelamento_cliente,
        horario_funcionamento,
        notificar_via_whatsapp,
        notificar_via_email,
        template_confirmacao,
        template_lembrete,
        configuracoes_extras
    ) VALUES (
        p_salon_id,
        COALESCE(p_ativo, false),
        p_nome_exibicao,
        p_foto_perfil_url,
        p_whatsapp,
        p_instagram,
        p_endereco,
        COALESCE(p_cor_primaria, '#6366f1'),
        COALESCE(p_cor_secundaria, '#4f46e5'),
        p_logotipo_url,
        COALESCE(p_mensagem_boas_vindas, 'Bem-vindo ao nosso agendamento online!'),
        COALESCE(p_mostrar_precos, true),
        COALESCE(p_mostrar_duracao_servicos, true),
        COALESCE(p_intervalo_tempo, 30),
        COALESCE(p_tempo_minimo_antecedencia, 60),
        COALESCE(p_periodo_maximo_agendamento, 7),
        COALESCE(p_permitir_cancelamento_cliente, true),
        COALESCE(p_horario_funcionamento, '{
            "segunda": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
            "terca": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
            "quarta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
            "quinta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
            "sexta": {"ativo": true, "inicio": "08:00", "fim": "18:00"},
            "sabado": {"ativo": true, "inicio": "08:00", "fim": "16:00"},
            "domingo": {"ativo": false, "inicio": "08:00", "fim": "16:00"}
        }'::jsonb),
        COALESCE(p_notificar_via_whatsapp, true),
        COALESCE(p_notificar_via_email, false),
        COALESCE(p_template_confirmacao, 'Olá {cliente_nome}! Seu agendamento foi confirmado para {data} às {horario} com {profissional_nome}.'),
        COALESCE(p_template_lembrete, 'Olá {cliente_nome}! Lembramos que você tem um agendamento amanhã às {horario} com {profissional_nome}.'),
        COALESCE(p_configuracoes_extras, '{}'::jsonb)
    ) ON CONFLICT (salon_id) DO UPDATE SET
        ativo = COALESCE(p_ativo, agendamento_publico.ativo),
        nome_exibicao = COALESCE(p_nome_exibicao, agendamento_publico.nome_exibicao),
        foto_perfil_url = COALESCE(p_foto_perfil_url, agendamento_publico.foto_perfil_url),
        whatsapp = COALESCE(p_whatsapp, agendamento_publico.whatsapp),
        instagram = COALESCE(p_instagram, agendamento_publico.instagram),
        endereco = COALESCE(p_endereco, agendamento_publico.endereco),
        cor_primaria = COALESCE(p_cor_primaria, agendamento_publico.cor_primaria),
        cor_secundaria = COALESCE(p_cor_secundaria, agendamento_publico.cor_secundaria),
        logotipo_url = COALESCE(p_logotipo_url, agendamento_publico.logotipo_url),
        mensagem_boas_vindas = COALESCE(p_mensagem_boas_vindas, agendamento_publico.mensagem_boas_vindas),
        mostrar_precos = COALESCE(p_mostrar_precos, agendamento_publico.mostrar_precos),
        mostrar_duracao_servicos = COALESCE(p_mostrar_duracao_servicos, agendamento_publico.mostrar_duracao_servicos),
        intervalo_tempo = COALESCE(p_intervalo_tempo, agendamento_publico.intervalo_tempo),
        tempo_minimo_antecedencia = COALESCE(p_tempo_minimo_antecedencia, agendamento_publico.tempo_minimo_antecedencia),
        periodo_maximo_agendamento = COALESCE(p_periodo_maximo_agendamento, agendamento_publico.periodo_maximo_agendamento),
        permitir_cancelamento_cliente = COALESCE(p_permitir_cancelamento_cliente, agendamento_publico.permitir_cancelamento_cliente),
        horario_funcionamento = COALESCE(p_horario_funcionamento, agendamento_publico.horario_funcionamento),
        notificar_via_whatsapp = COALESCE(p_notificar_via_whatsapp, agendamento_publico.notificar_via_whatsapp),
        notificar_via_email = COALESCE(p_notificar_via_email, agendamento_publico.notificar_via_email),
        template_confirmacao = COALESCE(p_template_confirmacao, agendamento_publico.template_confirmacao),
        template_lembrete = COALESCE(p_template_lembrete, agendamento_publico.template_lembrete),
        configuracoes_extras = COALESCE(p_configuracoes_extras, agendamento_publico.configuracoes_extras),
        updated_at = NOW()
    RETURNING id INTO v_config_id;

    RETURN QUERY SELECT true::BOOLEAN, 'Configurações salvas com sucesso!'::TEXT, v_config_id;

EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT false::BOOLEAN, SQLERRM::TEXT, NULL::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários sobre a tabela
COMMENT ON TABLE agendamento_publico IS 'Configurações específicas para agendamento público online de cada salão';
COMMENT ON COLUMN agendamento_publico.salon_id IS 'ID do salão - chave estrangeira';
COMMENT ON COLUMN agendamento_publico.ativo IS 'Se o agendamento online está ativo ou não';
COMMENT ON COLUMN agendamento_publico.intervalo_tempo IS 'Intervalo entre horários disponíveis em minutos';
COMMENT ON COLUMN agendamento_publico.tempo_minimo_antecedencia IS 'Tempo mínimo de antecedência para agendamento em minutos';
COMMENT ON COLUMN agendamento_publico.periodo_maximo_agendamento IS 'Período máximo para agendamento em dias';
COMMENT ON COLUMN agendamento_publico.horario_funcionamento IS 'Horários de funcionamento por dia da semana em formato JSON';
COMMENT ON COLUMN agendamento_publico.configuracoes_extras IS 'Configurações adicionais em formato JSON para futuras expansões'; 