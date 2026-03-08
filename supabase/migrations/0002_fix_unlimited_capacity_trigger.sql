-- capacity = 0(또는 음수)는 무제한으로 간주하도록 정원 체크 트리거 보정
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  max_capacity  INT;
BEGIN
  SELECT capacity INTO max_capacity
  FROM events
  WHERE id = NEW.event_id;

  -- 0 이하(및 NULL)는 무제한 처리
  IF max_capacity IS NULL OR max_capacity <= 0 THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM registrations
  WHERE event_id = NEW.event_id
    AND status != 'cancelled'
  FOR UPDATE;

  IF current_count >= max_capacity THEN
    RAISE EXCEPTION 'EVENT_FULL';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
