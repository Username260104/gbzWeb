import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EventForm from '@/components/admin/events/EventForm';

export const metadata = {
    title: '이벤트 수정 | GBZ Web Service',
};

export default async function EditEventPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !event) {
        notFound();
    }

    return (
        <div style={{ maxWidth: 'var(--max-width-md)', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                    이벤트 수정
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    기존 이벤트의 내용이나 상태를 수정합니다.
                </p>
            </div>

            <EventForm initialData={event} isEdit={true} />
        </div>
    );
}
