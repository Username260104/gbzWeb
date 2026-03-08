'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TEMPLATE_TYPE, DEFAULT_CAPACITY, EVENT_STATUS } from '@/lib/constants';

type EventData = {
    id?: string;
    title: string;
    date: string;
    location: string;
    template_type: string;
    status: string;
    capacity: number;
    course?: string;
    distance_km?: number | string | null;
    after_activity?: string;
};

type EventFormProps = {
    initialData?: EventData;
    isEdit?: boolean;
};

type FormData = {
    title: string;
    date: string;
    time: string;
    location: string;
    template_type: string;
    capacity: number;
    course: string;
    distance_km: string;
    after_activity: string;
    status: string;
};

export default function EventForm({ initialData, isEdit = false }: EventFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // initialData가 있으면 Date와 Time 분리해서 초기화
    let initialDate = '';
    let initialTime = '07:00';
    if (initialData?.date) {
        const d = new Date(initialData.date);
        // 클라이언트 로컬 타임존 기준으로 YYYY-MM-DD 와 HH:mm 추출
        initialDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        initialTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    const [formData, setFormData] = useState<FormData>({
        title: initialData?.title || '',
        date: initialDate,
        time: initialTime,
        location: initialData?.location || '',
        template_type: initialData?.template_type || TEMPLATE_TYPE.REGULAR,
        capacity: initialData?.capacity ?? DEFAULT_CAPACITY[TEMPLATE_TYPE.REGULAR],
        course: initialData?.course || '',
        distance_km: initialData?.distance_km?.toString() || '',
        after_activity: initialData?.after_activity || '',
        status: initialData?.status || EVENT_STATUS.DRAFT,
    });

    // 템플릿 변경 시 기본값 자동 세팅
    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const type = e.target.value;
        const defaultCapacity = DEFAULT_CAPACITY[type as keyof typeof DEFAULT_CAPACITY] || 0;

        let initialTitle = '';
        if (type === TEMPLATE_TYPE.REGULAR) initialTitle = '정기런 - ';
        if (type === TEMPLATE_TYPE.SPEED) initialTitle = '스피드 세션 - ';

        setFormData((prev) => ({
            ...prev,
            template_type: type,
            capacity: defaultCapacity,
            title: prev.title === '' ? initialTitle : prev.title
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // 날짜와 시간을 합쳐서 ISO 포맷으로 변환
            const dateTime = new Date(`${formData.date}T${formData.time}:00`).toISOString();

            // time 필드는 UI 전용이므로 DB payload에서 제외
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { time: _time, date: _date, ...rest } = formData;
            const payload = {
                ...rest,
                date: dateTime,
                capacity: Number(formData.capacity),
                distance_km: formData.distance_km ? Number(formData.distance_km) : null,
            };

            const url = isEdit ? `/api/events/${initialData?.id}` : '/api/events';
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || `Failed to ${isEdit ? 'update' : 'create'} event`);
            }

            // 성공 시 목록 페이지로 라우팅
            router.push('/admin/events');
            router.refresh(); // 데이터 갱신
        } catch (err) {
            setError(err instanceof Error ? err.message : '이벤트 처리 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData?.id) return;
        const confirmed = window.confirm('정말 이 이벤트를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.');
        if (!confirmed) return;

        setIsDeleting(true);
        setError(null);

        try {
            const res = await fetch(`/api/events/${initialData.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete event');
            }

            router.push('/admin/events');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : '이벤트 삭제 중 오류가 발생했습니다.');
            setIsDeleting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {error && (
                <div style={{ backgroundColor: '#FEF2F2', color: 'var(--color-error)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
                    {error}
                </div>
            )}

            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="label label-required" htmlFor="template_type">이벤트 템플릿</label>
                    <select
                        id="template_type"
                        name="template_type"
                        className="input"
                        value={formData.template_type}
                        onChange={handleTemplateChange}
                        required
                    >
                        <option value={TEMPLATE_TYPE.REGULAR}>🏃 정기런</option>
                        <option value={TEMPLATE_TYPE.SPEED}>⚡ 스피드 세션</option>
                        <option value={TEMPLATE_TYPE.COLLAB}>🤝 외부 협업 런</option>
                        <option value={TEMPLATE_TYPE.RACE}>🏆 레이스 참가</option>
                    </select>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="label label-required" htmlFor="title">이벤트명</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="input"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="이벤트명 입력"
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div>
                        <label className="label label-required" htmlFor="date">날짜</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            className="input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="label label-required" htmlFor="time">시간</label>
                        <input
                            type="time"
                            id="time"
                            name="time"
                            className="input"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="label label-required" htmlFor="location">집결지</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        className="input"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="집결지 입력"
                        required
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>상세 정보</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div>
                        <label className="label label-required" htmlFor="capacity">최대 정원</label>
                        <input
                            type="number"
                            id="capacity"
                            name="capacity"
                            className="input"
                            value={formData.capacity}
                            onChange={handleChange}
                            min="0"
                            required
                        />
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>0은 무제한</p>
                    </div>
                    <div>
                        <label className="label" htmlFor="distance_km">거리 (km)</label>
                        <input
                            type="number"
                            id="distance_km"
                            name="distance_km"
                            className="input"
                            value={formData.distance_km}
                            onChange={handleChange}
                            step="0.1"
                            min="0"
                            placeholder="예: 5"
                        />
                    </div>
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="label" htmlFor="course">코스 설명</label>
                    <textarea
                        id="course"
                        name="course"
                        className="input"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="코스 설명 입력"
                        rows={2}
                    />
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label className="label" htmlFor="after_activity">애프터 / 기타 사항</label>
                    <input
                        type="text"
                        id="after_activity"
                        name="after_activity"
                        className="input"
                        value={formData.after_activity}
                        onChange={handleChange}
                        placeholder="애프터 활동 입력"
                    />
                </div>

                <div>
                    <label className="label label-required" htmlFor="status">공개 상태 설정</label>
                    <select
                        id="status"
                        name="status"
                        className="input"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value={EVENT_STATUS.DRAFT}>초안 (Draft) - 비공개</option>
                        <option value={EVENT_STATUS.OPEN}>접수 중 (Open) - 공개</option>
                        <option value={EVENT_STATUS.CLOSED}>마감 (Closed) - 공개 불가/만석</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                <div>
                    {isEdit && (
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={isLoading || isDeleting}
                        >
                            {isDeleting ? <span className="spinner" style={{ borderColor: 'var(--color-text-inverse)', borderTopColor: 'transparent' }} /> : '이벤트 삭제'}
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => router.push('/admin/events')}
                        disabled={isLoading || isDeleting}
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading || isDeleting}
                    >
                        {isLoading ? <span className="spinner" /> : (isEdit ? '수정 완료' : '이벤트 생성')}
                    </button>
                </div>
            </div>
        </form>
    );
}
