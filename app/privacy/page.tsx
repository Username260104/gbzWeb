import React from 'react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">개인정보처리방침</h1>

                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-6">
                        GBZ 크루(이하 &quot;크루&quot;)는 게스트 참가 신청 서비스(이하 &quot;서비스&quot;)를
                        이용하는 정보주체의 개인정보를 매우 중요하게 생각하며, 안전하게 보호하기 위해 최선을 다하고 있습니다.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">1. 수집하는 개인정보의 항목 및 목적</h2>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li><strong>수집 항목:</strong> 이름, 전화번호, 참가 코스, 평균 페이스</li>
                        <li><strong>수집 목적:</strong> 러닝 이벤트 참가 신청 확인, 인원 마감 관리, 비상 연락, 페이스별 그룹 편성</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">2. 개인정보의 보유 및 이용 기간</h2>
                    <p className="mb-4">
                        수집된 개인정보는 원칙적으로 목적 달성 후 지체 없이 파기합니다. 단, 다음의 이유로 해당 기간 동안 보존합니다.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                        <li><strong>이름, 전화번호:</strong> 부정 신청 방지 및 누적 방문 횟수 등 크루 가입 자격 확인을 위해 수집일로부터 <strong>1년</strong> 보관</li>
                        <li><strong>참가 코스, 페이스 등 활동 데이터:</strong> 통계 목적 활용 후 지체 없이 마스킹 처리 또는 수집일로부터 <strong>6개월</strong> 후 파기</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">3. 동의를 거부할 권리</h2>
                    <p className="mb-6">
                        이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 수 있습니다.
                        단, 필수 항목(이름, 전화번호, 코스, 페이스) 등 수집에 동의하지 않을 경우 이벤트 참가 신청이 제한됩니다.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">4. 개인정보의 파기 절차</h2>
                    <p className="mb-6">
                        보유 기간(1년)이 경과한 개인정보는 일괄 파기 자동화 시스템 (CRON)에 의해 복구 불가능한 방법으로 안전하게 완전 파기됩니다.
                    </p>

                    <div className="mt-12 pt-6 border-t border-gray-100 text-sm text-gray-500">
                        <p>시행일자: 2026년 3월 6일</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
