// 알림 관련 타입 정의

export type Sido = {
    id: number;
    sido_code: string;
    sido_name: string;
};

export type Sigu = {
    id: number;
    sido_code: string;
    sido_name: string;
    sigu_code: string;
    sigu_name: string;
};

export type NotificationRule = {
    id: string;
    user_id?: string;
    name: string;
    category: string | null;
    sido_code: string;
    sigu_code: string;
    price_min: number | null;
    price_max: number | null;
    keyword: string | null;
    enabled: boolean;
    created_at: string;
};

export type NotificationChannel = {
    id: string;
    type: string;
    identifier: string;
    enabled: boolean;
};
