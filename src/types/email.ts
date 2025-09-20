import { CreateEmailOptions } from "resend";

export interface ResendEmailOptions
  extends Omit<CreateEmailOptions, "to" | "from"> {
  email: string;
  from?: string;
  variant?: "primary" | "notifications" | "marketing" | "analytics" | "summary";
}
// We will start with e-mail summaries to feed critical insights instead of whatsapp
