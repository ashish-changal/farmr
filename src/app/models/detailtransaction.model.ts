export interface OrderDetail{
    orderNumber?:string,
    orderKey?:string,
    farmKey?:string,
    produces?:any[],
    price?:number,
    orderDate?:string,
    pickup?:string,
    pickup1?:string,
    pickup2?:string,
    pickup3?:string,
    customerName?:string,
    billingAddress?:string,
    billingAddress1?:string,
    billingAddress2?:string
    orderStatus?:string,
    discountAmount?:number,
    refundAmount?:number,
    cardNumber?:string,
    expMonth:number,
    expYear:number,
    remarks:string
  }

  export interface RefundDetail{
    orderkey?:string,
    amount?:number,
    remarks?:string,
    refundBy?:string,
    chargeId?:string,
    uid?:string
  }

  export interface OrderHistory{
    uid?:string,
    orderNumber?:string,
    produces?:any[],
    amount?:number,
    orderDate?:string,
    salesTax:number,
    pickup1:string,
    pickup2:string,
    pickup3:string,
    farmKey?:string,
    farmName?:string,
    farmAddress1?:string,
    farmAddress2?:string,
    orderStatus?:string,
    contactNumber?:string,
    orderTime?:any,
    discountAmount?:number,
    refundAmount?:number,
    remarks?:string
  }