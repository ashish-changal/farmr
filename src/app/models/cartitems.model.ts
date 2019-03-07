export interface CartItems {
    farmName?: string,
    farmkey?: string,
    farmAddress1?: string,
    farmAddress2?: string,
    produces?: any[],
    phonenumber?: string,
    totalAmount: number,
    marketname?:string;
    streetdropzone1?: string
    streetdropzone2?: string
    citydropzone?: string
    statedropzone?: string
    zipcodedropzone?: string
    defaultCard?: string,
    totalproduces?: number,
    deliverytime?: string,
    pickupOption?: string,
    pickup?: string
}

export interface Card {
    key?: string,
    number?: string,
    name?: string,
    address_line1?: string,
    address_line2?: string,
    address_city?: string,
    address_state?: string,
    postal_code?: string,
    nickName?: string,
    cvc?: string,
    date?: string,
    expMonth?: number,
    expYear?: number,
    encodedNumber?: string
}