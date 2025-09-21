import { ErrorCode } from "@/lib/globalTypes";

export type AlertType = "error" | "success";

export interface AlertErrorData {
  scope: CheckoutScope;
  code: ErrorCode;
  field: string;
}

export type CustomError =
  | Pick<AlertErrorData, "code">
  | Pick<AlertErrorData, "code" | "field">
  | { message: string };

export interface Alert {
  message: string;
  id: string;
  type: AlertType;
}

export type CheckoutScope =
  | "paymentGatewaysInitialize"
  | "checkoutFinalize"
  | "checkoutShippingUpdate"
  | "checkoutCustomerAttach"
  | "checkoutBillingUpdate"
  | "checkoutAddPromoCode"
  | "checkoutDeliveryMethodUpdate"
  | "userAddressCreate"
  | "userAddressUpdate"
  | "userAddressDelete"
  | "checkoutPay"
  | "userRegister"
  | "requestPasswordReset"
  | "checkoutLinesUpdate"
  | "checkoutLinesDelete"
  | "checkoutEmailUpdate"
  | "resetPassword"
  | "signIn";

export interface CheckoutItem {
  variantId: string;
  quantity: number;
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  streetAddress1: string;
  city: string;
  postalCode: string;
  country: string;
}
