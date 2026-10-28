export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface CategoryRequestDto {
    name: string;
    description?: string
}