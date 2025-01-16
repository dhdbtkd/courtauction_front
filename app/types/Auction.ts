export interface Auction {
    id: number;
    court: string;
    case_id: string;
    created_at: string;
    address: string;
    area: number;
    sido_code: number;
    sigu_code: number;
    thumbnail_src: string;
    estimated_price: number;
    minimum_price: number;
    status: string;
}
