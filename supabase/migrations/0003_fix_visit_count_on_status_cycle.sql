-- registrations 상태 사이클(대기↔확정↔취소)에서 visit_count를 정확히 유지
-- 규칙:
-- - 비확정 -> 확정: +1
-- - 확정 -> 비확정: -1 (최소 0)
CREATE OR REPLACE FUNCTION update_guest_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 게스트 기반 신청만 카운트 반영
  IF NEW.guest_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 비확정 -> 확정
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    UPDATE guests
    SET visit_count = visit_count + 1,
        last_seen = now()
    WHERE id = NEW.guest_id;
  END IF;

  -- 확정 -> 비확정
  IF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
    UPDATE guests
    SET visit_count = GREATEST(visit_count - 1, 0)
    WHERE id = NEW.guest_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 기존 누적값 보정: 현재 confirmed 상태 건수 기준으로 재계산
UPDATE guests g
SET visit_count = COALESCE(rc.confirmed_count, 0)
FROM (
  SELECT guest_id, COUNT(*)::INT AS confirmed_count
  FROM registrations
  WHERE guest_id IS NOT NULL
    AND status = 'confirmed'
  GROUP BY guest_id
) rc
WHERE g.id = rc.guest_id;

UPDATE guests g
SET visit_count = 0
WHERE NOT EXISTS (
  SELECT 1
  FROM registrations r
  WHERE r.guest_id = g.id
    AND r.status = 'confirmed'
);
