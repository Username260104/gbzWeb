import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import GuestForm from '@/components/run/GuestForm';
import { EVENT_STATUS } from '@/lib/constants';

interface RunPageProps {
    params: {
        id: string;
    };
}

export default async function RunPage({ params }: RunPageProps) {
    const supabase = await createClient();

    // 이벤트 정보 조회
    const { data: event, error } = await supabase
        .from('events')
        .select('id, title, date, status, capacity')
        .eq('id', params.id)
        .single();

    if (error || !event) {
        notFound();
    }

    // 마감된 이벤트 처리
    if (event.status === EVENT_STATUS.CLOSED) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        신청 마감 🏃
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        <strong>{event.title}</strong> 이벤트는 정원이 마감되었거나 신청 기간이 종료되었습니다.
                    </p>
                    <div className="mt-8">
                        <a href="/" className="text-blue-600 hover:underline">홈으로 돌아가기</a>
                    </div>
                </div>
            </div>
        );
    }

    // 취소된 이벤트 등 다른 상태 처리
    if (event.status !== EVENT_STATUS.OPEN) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        신청이 불가능한 이벤트입니다
                    </h2>
                </div>
            </div>
        );
    }

    // 신청 가능한 이벤트
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto relative">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        러닝 게스트 신청
                    </h1>
                    <div className="mt-4 inline-flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-100 w-full">
                        <h2 className="text-xl font-bold text-gray-800">{event.title}</h2>
                        <p className="text-sm text-gray-500 mt-2">일시: {new Date(event.date).toLocaleString('ko-KR')}</p>
                    </div>
                </div>

                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 mb-8 z-10 relative">
                    <GuestForm event={event} />
                </div>
            </div>
        </div>
    );
}
