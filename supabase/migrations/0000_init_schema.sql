-- 1. 기본 참조 테이블 생성 (members, partners)
-- PRD 상 FK 참조를 위해 기초 테이블을 명시적으로 생성
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 핵심 테이블: guests
CREATE TABLE guests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT UNIQUE NOT NULL,   -- 고유 식별자 (OTP 없이 자가 기재)
  name        TEXT NOT NULL,          -- 가장 최근 입력한 이름으로 upsert
  visit_count INT  DEFAULT 0,         -- 확정 참가 누적 횟수 (Trigger 자동 증가)
  last_seen   TIMESTAMPTZ,            -- 마지막 확정 참가 일시
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. 핵심 테이블: events
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  date           TIMESTAMPTZ NOT NULL,
  location       TEXT NOT NULL,
  course         TEXT,
  distance_km    NUMERIC,
  after_activity TEXT,
  template_type  TEXT,               -- regular | speed | collab | race
  capacity       INT NOT NULL,
  status         TEXT DEFAULT 'draft',
  partner_id     UUID REFERENCES partners(id),
  created_by     UUID REFERENCES members(id),
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 4. 핵심 테이블: registrations
CREATE TABLE registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  guest_id      UUID REFERENCES guests(id),
  member_id     UUID REFERENCES members(id),
  course        TEXT NOT NULL,
  pace          TEXT NOT NULL,
  note          TEXT,
  status        TEXT DEFAULT 'pending',  -- pending | confirmed | cancelled
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (event_id, guest_id),
  UNIQUE (event_id, member_id),
  CHECK (guest_id IS NOT NULL OR member_id IS NOT NULL)
);

-- 5. 동시성 제어 - 정원 초과 방지 Trigger
CREATE OR REPLACE FUNCTION check_event_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INT;
  max_capacity  INT;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM registrations
  WHERE event_id = NEW.event_id AND status != 'cancelled'
  FOR UPDATE;          -- 행 수준 잠금으로 동시 신청 Race Condition 방지

  SELECT capacity INTO max_capacity
  FROM events WHERE id = NEW.event_id;

  IF current_count >= max_capacity THEN
    RAISE EXCEPTION 'EVENT_FULL';  -- 트랜잭션 롤백, 프론트에 에러 반환
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_capacity
BEFORE INSERT ON registrations
FOR EACH ROW EXECUTE FUNCTION check_event_capacity();

-- 6. 참가 확정 시 visit_count 자동 증가 Trigger
CREATE OR REPLACE FUNCTION update_guest_visit_count()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태가 confirmed로 변경될 때만 카운트 증가
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed'
     AND NEW.guest_id IS NOT NULL THEN
    UPDATE guests
    SET visit_count = visit_count + 1,
        last_seen   = now()
    WHERE id = NEW.guest_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_visit_count
AFTER UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_guest_visit_count();

-- 7. 필수 인덱스
CREATE INDEX idx_registrations_event  ON registrations(event_id);
CREATE INDEX idx_registrations_guest  ON registrations(guest_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_guests_phone         ON guests(phone);
CREATE INDEX idx_events_date          ON events(date);
CREATE INDEX idx_events_status        ON events(status);
