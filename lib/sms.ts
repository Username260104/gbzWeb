export type SendSmsInput = {
    to: string;
    text: string;
};

function getSmsConfig() {
    const apiUrl = process.env.SMS_API_URL;
    const apiKey = process.env.SMS_API_KEY;
    const sender = process.env.SMS_SENDER;

    if (!apiUrl || !sender) {
        throw new Error('SMS 설정이 누락되었습니다. SMS_API_URL, SMS_SENDER를 확인해주세요.');
    }

    return { apiUrl, apiKey, sender };
}

export function isSmsConfigured() {
    return Boolean(process.env.SMS_API_URL && process.env.SMS_SENDER);
}

export async function sendSms({ to, text }: SendSmsInput) {
    const { apiUrl, apiKey, sender } = getSmsConfig();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (apiKey) {
        headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            to,
            from: sender,
            text,
        }),
    });

    if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`SMS 발송 실패(${response.status}): ${responseText.slice(0, 200)}`);
    }
}
