import fs from "fs";
import path from "path";
import { importJWK, SignJWT } from "jose";

export const getPrivateKey = () => {
  try {
    const privateKeyPath = path.join(
      process.cwd(),
      "certs",
      "private-key.json"
    );
    return JSON.parse(fs.readFileSync(privateKeyPath, "utf8"));
  } catch (error) {
    console.error("Error loading private key:", error);
    throw new Error("Failed to load private key");
  }
};

export async function signToken(
  payload: Record<string, any>,
  expiresIn = "1h"
) {
  const privateKeyData = getPrivateKey();
  const privateKey = await importJWK(privateKeyData);

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: privateKeyData.kid })
    .setIssuedAt()
    .setIssuer("https://alcorabooks.com")
    .setExpirationTime(expiresIn)
    .sign(privateKey);
}

// Verify pk can be loaded
export function verifyKeyAccess() {
  try {
    const key = getPrivateKey();
    return { success: true, kid: key.kid };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// run only if file is executed directly
if (require.main === module) {
  console.log("Testing key access...");
  const result = verifyKeyAccess();
  console.log(result);

  if (result.success) {
    console.log("✅ Successfully accessed private key");
  } else {
    console.log("❌ Failed to access private key");
    console.log("Try these paths:");
    console.log("- process.cwd():", process.cwd());
    console.log("- __dirname:", __dirname);
    console.log(
      "- Expected path:",
      path.join(process.cwd(), "certs", "private-key.json")
    );
  }
}
