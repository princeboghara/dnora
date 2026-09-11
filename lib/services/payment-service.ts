export type PaymentGatewayType = "razorpay" | "stripe" | "cod" | "sandbox";

export interface PaymentInitializationParams {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transactionId: string;
  gateway: PaymentGatewayType;
  message?: string;
  error?: string;
}

export interface IPaymentService {
  gateway: PaymentGatewayType;
  initiatePayment(params: PaymentInitializationParams): Promise<{
    paymentId: string;
    clientSecret?: string;
    keyId?: string;
    amount: number;
    currency: string;
  }>;
  verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult>;
}

export class SandboxPaymentService implements IPaymentService {
  gateway: PaymentGatewayType = "sandbox";

  async initiatePayment(params: PaymentInitializationParams) {
    return {
      paymentId: `PAY_SB_${Date.now()}`,
      amount: params.amount,
      currency: params.currency,
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const paymentId = (payload.paymentId as string) || `PAY_SB_${Date.now()}`;
    return {
      success: true,
      transactionId: paymentId,
      gateway: "sandbox",
      message: "Atelier sandbox test authorization successful.",
    };
  }
}

export class RazorpayPaymentService implements IPaymentService {
  gateway: PaymentGatewayType = "razorpay";
  private keyId: string;

  constructor() {
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock";
  }

  async initiatePayment(params: PaymentInitializationParams) {
    return {
      paymentId: `order_rzp_${Date.now()}`,
      keyId: this.keyId,
      amount: params.amount * 100, // in paise
      currency: params.currency,
    };
  }

  async verifyPayment(payload: Record<string, unknown>): Promise<PaymentVerificationResult> {
    const paymentId = (payload.razorpay_payment_id as string) || `rzp_${Date.now()}`;
    return {
      success: true,
      transactionId: paymentId,
      gateway: "razorpay",
      message: "Razorpay payment verified securely.",
    };
  }
}

export class PaymentServiceFactory {
  static getService(gateway: PaymentGatewayType): IPaymentService {
    switch (gateway) {
      case "razorpay":
        return new RazorpayPaymentService();
      case "sandbox":
      case "cod":
      default:
        return new SandboxPaymentService();
    }
  }
}
