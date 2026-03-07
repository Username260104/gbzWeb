"use client";

import React, { useState } from 'react';
import { EVENT_STATUS, PACE_OPTIONS, DEFAULT_COURSE_OPTIONS } from '@/lib/constants';
import { formatPhoneInput } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface GuestFormProps {
    event: {
        id: string;
        title: string;
        date: string;
        status: string;
        capacity: number;
        // In a real app we might have specific courses per event, 
        // using DEFAULT_COURSE_OPTIONS for now as per SPEC
    };
}

export default function GuestForm({ event }: GuestFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        course: '',
        pace: '',
        notes: '',
        consentGiven: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [duplicateChecking, setDuplicateChecking] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);

    // 이벤트가 접수 중이 아니면 폼 자체를 가림 (보안/UX)
    if (event.status !== EVENT_STATUS.OPEN) {
        return (
            <div className="card text-center p-8">
                <h3 className="text-xl font-bold mb-2">신청이 마감되었습니다</h3>
                <p className="text-gray-500">현재 이 이벤트는 신청을 받고 있지 않습니다.</p>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (name === 'phone') {
            // 전화번호 입력 시 자동 하이픈 추가
            const formatted = formatPhoneInput(value);
            setFormData(prev => ({ ...prev, [name]: formatted }));
            // 번호가 수정되면 중복 상태 초기화
            setIsDuplicate(false);
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneBlur = async () => {
        // 전화번호 형식이 대략 완성되었을 때만 검사 (010-XXXX-XXXX)
        if (formData.phone.length < 12) return;

        setDuplicateChecking(true);
        setError('');

        try {
            const res = await fetch(`/api/registrations/check?eventId=${event.id}&phone=${encodeURIComponent(formData.phone)}`);
            if (!res.ok) throw new Error('중복 확인 실패');

            const data = await res.json();
            setIsDuplicate(data.exists);

            if (data.exists) {
                setError('이미 신청 완료된 전화번호입니다.');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            console.error('Phone check error', err);
            // 에러가 나도 진행을 막지는 않음 (서버 제출 시에도 검사하므로)
        } finally {
            setDuplicateChecking(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isDuplicate) {
            setError('이미 신청 완료된 전화번호입니다.');
            return;
        }

        if (!formData.name || !formData.phone || !formData.course || !formData.pace || !formData.consentGiven) {
            setError('필수 항목을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const res = await fetch('/api/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    ...formData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // 고유 제약 조건 위반 (중복) 또는 정원 초과 등 에러 처리
                throw new Error(data.error || '신청 처리 중 오류가 발생했습니다.');
            }

            // 성공 시 완료 페이지로 이동
            router.push(`/run/${event.id}/success?name=${encodeURIComponent(formData.name)}&course=${encodeURIComponent(formData.course)}&pace=${encodeURIComponent(formData.pace)}`);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('신청 처리 중 오류가 발생했습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="input w-full"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        전화번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            className={`input w-full ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`}
                            placeholder="010-0000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handlePhoneBlur}
                        />
                        {duplicateChecking && (
                            <span className="absolute right-3 top-2.5 text-xs text-gray-400">
                                확인 중...
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                        참가 코스 <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="course"
                        name="course"
                        required
                        className="input w-full"
                        value={formData.course}
                        onChange={handleChange}
                    >
                        <option value="" disabled>코스를 선택해주세요</option>
                        {DEFAULT_COURSE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        평균 페이스 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {PACE_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, pace: opt.value }))}
                                className={`py-2 px-3 text-sm rounded-md border transition-colors ${formData.pace === opt.value
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        특이사항 (선택)
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="부상 기록, 질문 등"
                        value={formData.notes}
                        onChange={handleChange}
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="consentGiven"
                            required
                            checked={formData.consentGiven}
                            onChange={handleChange}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm text-gray-600 leading-tight">
                            개인정보 수집 및 이용에 동의합니다.{' '}
                            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                자세히 보기
                            </a>
                            <span className="text-red-500 ml-1">*</span>
                        </span>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting || !formData.consentGiven || duplicateChecking || isDuplicate}
                className="btn-primary w-full py-3 text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? '신청 처리 중...' : '참가 신청하기'}
            </button>
        </form>
    );
}
