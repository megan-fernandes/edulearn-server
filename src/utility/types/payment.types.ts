export interface ICreatePayment {
  studentId: string;
  courseId: string;
  amount: number;
}

export interface IStripeLineItem {
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: {
      name: string;
      images?: string[];
    };
  };
  quantity: number;
}
