-- 1. 모든 테이블에 대해 RLS 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- 2. members 테이블 정책
-- 관리자는 모든 멤버 정보를 볼 수 있음
CREATE POLICY "Admin full access to members" ON members
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. partners 테이블 정책
-- 관리자는 모든 파트너 정보를 볼 수 있음
CREATE POLICY "Admin full access to partners" ON partners
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. guests 테이블 정책
-- 관리자는 모든 게스트 정보를 볼 수 있음 (생성은 서비스/서버 계정에서 우회 처리)
CREATE POLICY "Admin full access to guests" ON guests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 익명 사용자는 자신의 전화번호 등 특정 조건으로만 조회할 수 있게 하는 정책이 필요할 수 있으나,
-- 프론트엔드에서 서버측 API (SERVICE_ROLE_KEY)를 통해 대리 수행하므로 클라이언트 오픈 불필요.

-- 5. events 테이블 정책
-- 익명 사용자(게스트)는 draft가 아닌 공개(open, closed) 상태의 이벤트만 볼 수 있음
CREATE POLICY "Public can view published events" ON events
  FOR SELECT
  TO anon, authenticated
  USING (status != 'draft');

-- 관리자는 이벤트를 생성/수정/삭제/모두 조회할 수 있음
CREATE POLICY "Admin full access to events" ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. registrations 테이블 정책
-- 관리자는 모든 신청 정보를 볼 수 있음
CREATE POLICY "Admin full access to registrations" ON registrations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
