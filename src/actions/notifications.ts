"use server";

import admin from "firebase-admin";
import { Message } from "firebase-admin/messaging";

if (!admin.apps.length) {
  const serviceAccount = require("@/service_key.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function sendNotification(
  token: string,
  title: string,
  message: string,
  link?: string
) {
  const payload: Message = {
    token,
    notification: {
      title: title,
      body: message,
    },
    webpush: link
      ? {
          fcmOptions: {
            link,
          },
        }
      : undefined,
  };

  try {
    await admin.messaging().send(payload);
    return { success: true, message: "Notification sent!" };
  } catch (error) {
    return { success: false, error };
  }
}
