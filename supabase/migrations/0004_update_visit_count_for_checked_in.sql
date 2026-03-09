-- 출석(checked_in) 상태 도입에 맞춰 visit_count 계산 기준 보정
-- 참가 처리 상태: confirmed, checked_in
CREATE OR REPLACE FUNCTION update_guest_visit_count()
RETURNS TRIGGER AS $$
DECLARE
  old_attended BOOLEAN;
  new_attended BOOLEAN;
BEGIN
  IF NEW.guest_id IS NULL THEN
    RETURN NEW;
  END IF;

  old_attended := OLD.status IN ('confirmed', 'checked_in');
  new_attended := NEW.status IN ('confirmed', 'checked_in');

  -- 비참가 -> 참가 처리 상태
  IF (NOT old_attended) AND new_attended THEN
    UPDATE guests
    SET visit_count = visit_count + 1,
        last_seen = now()
    WHERE id = NEW.guest_id;
  END IF;

  -- 참가 처리 상태 -> 비참가
  IF old_attended AND (NOT new_attended) THEN
    UPDATE guests
    SET visit_count = GREATEST(visit_count - 1, 0)
    WHERE id = NEW.guest_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 누적값 보정: confirmed + checked_in 기준으로 재계산
UPDATE guests g
SET visit_count = COALESCE(rc.attended_count, 0)
FROM (
  SELECT guest_id, COUNT(*)::INT AS attended_count
  FROM registrations
  WHERE guest_id IS NOT NULL
    AND status IN ('confirmed', 'checked_in')
  GROUP BY guest_id
) rc
WHERE g.id = rc.guest_id;

UPDATE guests g
SET visit_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM registrations r
  WHERE r.guest_id = g.id
    AND r.status IN ('confirmed', 'checked_in')
);
