-- Função para finalizar fechamento de caixa
CREATE OR REPLACE FUNCTION finalize_cash_closure(
  p_salon_id UUID,
  p_professional_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSON AS $$
DECLARE
  v_cash_closure_id UUID;
  v_total_gross DECIMAL(10,2) := 0;
  v_total_fees DECIMAL(10,2) := 0;
  v_total_commissions DECIMAL(10,2) := 0;
  v_total_net DECIMAL(10,2) := 0;
  v_service_record RECORD;
  v_advance_record RECORD;
  v_advance_ids UUID[] := '{}';
BEGIN
  -- Verificar se o usuário tem acesso ao salão
  IF NOT EXISTS (
    SELECT 1 FROM salon_users 
    WHERE user_id = auth.uid() AND salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'Acesso negado ao salão';
  END IF;

  -- Verificar se o profissional existe e pertence ao salão
  IF NOT EXISTS (
    SELECT 1 FROM professionals 
    WHERE id = p_professional_id AND salon_id = p_salon_id
  ) THEN
    RAISE EXCEPTION 'Profissional não encontrado';
  END IF;

  -- Calcular totais dos serviços no período
  SELECT 
    COALESCE(SUM(s.final_price), 0) as total_gross,
    COALESCE(SUM(s.fee), 0) as total_fees,
    COALESCE(SUM(s.commission), 0) as total_commissions,
    COALESCE(SUM(s.net), 0) as total_net
  INTO v_total_gross, v_total_fees, v_total_commissions, v_total_net
  FROM (
    SELECT 
      COALESCE(aps.custom_price, s.price) as final_price,
      COALESCE(aps.custom_price, s.price) * pm.fee / 100 as fee,
      COALESCE(aps.custom_price, s.price) * p.commission_rate / 100 as commission,
      COALESCE(aps.custom_price, s.price) * (1 - pm.fee / 100 - p.commission_rate / 100) as net
    FROM appointments a
    JOIN appointment_services aps ON a.id = aps.appointment_id
    JOIN services s ON aps.service_id = s.id
    JOIN professionals p ON a.professional_id = p.id
    JOIN payment_methods pm ON a.payment_method_id = pm.id
    WHERE a.salon_id = p_salon_id
      AND a.professional_id = p_professional_id
      AND a.date BETWEEN p_start_date AND p_end_date
      AND a.status = 'completed'
      AND a.cash_closure_id IS NULL
  ) s;

  -- Coletar IDs dos vales disponíveis
  SELECT array_agg(id) INTO v_advance_ids
  FROM advances 
  WHERE salon_id = p_salon_id 
    AND professional_id = p_professional_id
    AND is_discounted = FALSE
    AND created_at::DATE BETWEEN p_start_date AND p_end_date;

  -- Criar registro de fechamento de caixa
  INSERT INTO cash_closures (
    salon_id,
    professional_id,
    start_date,
    end_date,
    total_gross,
    total_fees,
    total_commissions,
    total_net,
    advance_ids,
    created_by
  ) VALUES (
    p_salon_id,
    p_professional_id,
    p_start_date,
    p_end_date,
    v_total_gross,
    v_total_fees,
    v_total_commissions,
    v_total_net,
    v_advance_ids,
    auth.uid()
  ) RETURNING id INTO v_cash_closure_id;

  -- Marcar agendamentos como fechados
  UPDATE appointments 
  SET cash_closure_id = v_cash_closure_id
  WHERE salon_id = p_salon_id
    AND professional_id = p_professional_id
    AND date BETWEEN p_start_date AND p_end_date
    AND status = 'completed'
    AND cash_closure_id IS NULL;

  -- Marcar vales como descontados
  UPDATE advances 
  SET is_discounted = TRUE,
      discounted_at = NOW(),
      cash_closure_id = v_cash_closure_id
  WHERE id = ANY(v_advance_ids);

  -- Retornar sucesso
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Fechamento de caixa realizado com sucesso!',
    'cash_closure_id', v_cash_closure_id,
    'total_gross', v_total_gross,
    'total_fees', v_total_fees,
    'total_commissions', v_total_commissions,
    'total_net', v_total_net,
    'advances_count', array_length(v_advance_ids, 1)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Erro ao finalizar fechamento: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função seja executável por usuários autenticados
GRANT EXECUTE ON FUNCTION finalize_cash_closure TO authenticated;

-- Comentário na função
COMMENT ON FUNCTION finalize_cash_closure IS 'Finaliza o fechamento de caixa de um profissional em um período específico, salvando na tabela cash_closures e marcando serviços e vales como fechados'; 