export interface ScrapingElement {
    name: string | undefined;
    label?: string;
}

interface DeliveryOption {
    mode: string;
    delay: number;
    price: number;
}

export interface Offer {
    gtin?: string;
    sku?: string;
    mpn?: string;
    discount?: boolean;
    recommededPrice?: number;
    originalPrice: number;
    seller?: string;
    deliveryOptions?: Array<DeliveryOption>;
}

export interface Selector {
    url: string;
    element: ScrapingElement;
    path: string;
    language?: "css" | "xpath";
}