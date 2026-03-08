export type EventTemplate = {
    type: string;
    optionLabel: string;
    badgeLabel: string;
    titlePrefix: string;
    defaultCapacity: number;
};

/**
 * 템플릿 단일 관리 파일
 * - 제목 접두어/표시 라벨/기본 정원/추가·삭제를 여기서만 관리합니다.
 */
export const EVENT_TEMPLATES: EventTemplate[] = [
    {
        type: 'regular',
        optionLabel: '🏃 정기런',
        badgeLabel: '정기런',
        titlePrefix: '정기런 - ',
        defaultCapacity: 0,
    },
    {
        type: 'training',
        optionLabel: '⚡ 훈련',
        badgeLabel: '훈련',
        titlePrefix: '훈련 - ',
        defaultCapacity: 0,
    },
    {
        type: 'tribe sound',
        optionLabel: '💿 트라이브 사운드',
        badgeLabel: '트라이브 사운드',
        titlePrefix: '트라이브 사운드 - ',
        defaultCapacity: 20,
    },
    {
        type: 'race',
        optionLabel: '🏆 마라톤 응원',
        badgeLabel: '마라톤 응원',
        titlePrefix: '마라톤 응원 - ',
        defaultCapacity: 0,
    },
];

export const DEFAULT_TEMPLATE_TYPE = EVENT_TEMPLATES[0]?.type ?? 'regular';

export function getTemplateByType(type: string) {
    return EVENT_TEMPLATES.find((template) => template.type === type) ?? null;
}
