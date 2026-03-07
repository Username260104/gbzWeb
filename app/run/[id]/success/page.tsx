import React from 'react';
import Link from 'next/link';

interface SuccessPageProps {
    searchParams: {
        name?: string;
        course?: string;
        pace?: string;
    };
    params: {
        id: string; // event id
    }
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
    const { name, course, pace } = searchParams;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-8 animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">신청 완료! 🎉</h2>
                    <p className="text-gray-600 text-lg">성공적으로 참가 신청이 접수되었습니다.</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 text-left border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">신청 정보 요약</h3>
                    <dl className="space-y-3">
                        {name && (
                            <div className="flex justify-between">
                                <dt className="text-gray-500">이름</dt>
                                <dd className="font-medium text-gray-900">{name}</dd>
                            </div>
                        )}
                        {course && (
                            <div className="flex justify-between">
                                <dt className="text-gray-500">신청 코스</dt>
                                <dd className="font-medium text-gray-900">{course}</dd>
                            </div>
                        )}
                        {pace && (
                            <div className="flex justify-between">
                                <dt className="text-gray-500">평균 페이스</dt>
                                <dd className="font-medium text-gray-900">{pace}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="pt-4">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 underline transition-colors">
                        홈으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
