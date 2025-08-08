-- Função RPC para carregar dados iniciais do usuário
-- Inclui informações do salão e campo has_services

CREATE OR REPLACE FUNCTION load_initial_data()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
    salon_data JSON;
    has_services BOOLEAN;
    salon_id UUID;
BEGIN
    -- Obter o ID do usuário atual
    user_id := auth.uid();
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;

    -- Obter o ID do salão do usuário
    SELECT su.salon_id INTO salon_id
    FROM salon_users su
    WHERE su.user_id = user_id
    LIMIT 1;

    IF salon_id IS NULL THEN
        -- Se não há salão associado, retornar dados vazios
        RETURN json_build_object('salons', '[]'::json);
    END IF;

    -- Verificar se o salão tem serviços ativos
    SELECT EXISTS(
        SELECT 1 
        FROM services 
        WHERE salon_id = salon_id
        AND active = true
    ) INTO has_services;

    -- Buscar dados do salão
    SELECT json_build_object(
        'salons', json_agg(
            json_build_object(
                'id', s.id,
                'name', s.name,
                'subdomain', s.subdomain,
                'public_profile_photo_url', s.public_profile_photo_url,
                'public_display_name', s.public_display_name,
                'has_services', COALESCE(has_services, false)
            )
        )
    )
    FROM salons s
    WHERE s.id = salon_id
    INTO salon_data;

    -- Se não encontrou dados, retornar array vazio
    IF salon_data IS NULL THEN
        RETURN json_build_object('salons', '[]'::json);
    END IF;

    RETURN salon_data;
END;
$$;

-- Conceder permissões
GRANT EXECUTE ON FUNCTION load_initial_data() TO authenticated; 