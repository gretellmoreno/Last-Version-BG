-- =============================================
-- Migração: Criar tabela push_subscriptions
-- Data: 2024-12-20
-- Descrição: Tabela para armazenar subscriptions de push notifications
-- =============================================

-- Criar tabela para push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_salon_id ON push_subscriptions(salon_id);
CREATE INDEX idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Garantir que cada usuário tenha apenas uma subscription por salão
CREATE UNIQUE INDEX idx_push_subscriptions_user_salon_unique ON push_subscriptions(user_id, salon_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_subscriptions_updated_at
    BEFORE UPDATE ON push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Função para enviar notificação push via RPC
CREATE OR REPLACE FUNCTION send_push_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    subscription_record RECORD;
    success BOOLEAN := FALSE;
BEGIN
    -- Buscar subscription do usuário
    SELECT subscription INTO subscription_record
    FROM push_subscriptions
    WHERE user_id = p_user_id
    LIMIT 1;

    IF FOUND THEN
        -- Aqui você implementaria a lógica para enviar a notificação
        -- Por enquanto, apenas logamos
        RAISE NOTICE 'Enviando notificação para usuário %: % - %', p_user_id, p_title, p_body;
        success := TRUE;
    END IF;

    RETURN success;
END;
$$;

-- Função para enviar notificação de agendamento
CREATE OR REPLACE FUNCTION notify_new_appointment(
    p_appointment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    appointment_record RECORD;
    salon_owner_id UUID;
BEGIN
    -- Buscar dados do agendamento
    SELECT 
        a.id,
        a.client_name,
        a.service_name,
        a.salon_id,
        s.owner_id
    INTO appointment_record
    FROM appointments a
    JOIN salons s ON a.salon_id = s.id
    WHERE a.id = p_appointment_id;

    IF FOUND THEN
        -- Enviar notificação para o dono do salão
        PERFORM send_push_notification(
            appointment_record.owner_id,
            'Novo Agendamento! 📅',
            format('Novo agendamento para %s - %s', 
                   appointment_record.client_name, 
                   appointment_record.service_name),
            jsonb_build_object(
                'type', 'appointment',
                'appointment_id', appointment_record.id,
                'salon_id', appointment_record.salon_id
            )
        );
        
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$;

-- Trigger para notificar novo agendamento
CREATE OR REPLACE FUNCTION trigger_notify_new_appointment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM notify_new_appointment(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_appointment
    AFTER INSERT ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_notify_new_appointment(); 