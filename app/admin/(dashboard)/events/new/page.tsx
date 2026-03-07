import EventForm from '@/components/admin/events/EventForm';

export const metadata = {
    title: '신규 이벤트 생성 | GBZ Web Service',
};

export default function NewEventPage() {
    return (
        <div style={{ maxWidth: 'var(--max-width-md)', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                    이벤트 생성
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    새로운 러닝 이벤트를 추가합니다. 템플릿을 선택하면 기본값이 자동 채워집니다.
                </p>
            </div>

            <EventForm />
        </div>
    );
}
