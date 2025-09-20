import { useCurrency } from "@/hooks/useCurrency";
import { ResendEmailOptions } from "@/types/email";
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

const VARIANT_TO_FROM_MAP = {
  primary: "Alcora <online@alcorabooks.com>",
  notifications: "Alcora <online@alcorabooks.com>",
  marketing: "Mac from Alcora <online@alcorabooks.com>",
};

export const sendEmailViaResend = async (opts: ResendEmailOptions) => {
  if (!resend) {
    console.info(
      "RESEND_API_KEY is not set in the .env. Skipping sending email."
    );
    return;
  }

  const {
    email,
    from,
    variant = "primary",
    bcc,
    replyTo,
    subject,
    text,
    react,
    scheduledAt,
  } = opts;

  return await resend.emails.send({
    to: email,
    from: from as string /**|| VARIANT_TO_FROM_MAP[variant]**/,
    bcc: bcc,
    replyTo: replyTo || "support@alcorabooks.com",
    subject,
    text,
    react,
    scheduledAt,
    // ...(variant === "marketing" && {
    //   headers: {
    //     "List-Unsubscribe": "https://alcorabooks.com/account/settings",
    //   },
    // }),
  });
};

export async function unsubscribe({ email }: { email: string }) {
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!audienceId) {
    console.error("RESEND_AUDIENCE_ID is not set in the .env. Skipping.");
    return;
  }

  return await resend?.contacts.remove({
    email,
    audienceId,
  });
}

// TODO: EMAIL TEMPLATES/COMPONENTS
/*
- API KEY CREATED
- CAMPAIGN IMPORTED
- API THROTTLES EXCEEDED
- ANALYTICS SUMMARY [SALES FOR NOW]
- SUBSCRIPTION PAID
- SUBSCRIPTION UPGRADE
- REFERRAL INVITE
- TEAM MEMBER INVITE
- NEW SALTE ALERT
- ...ETC
*/
