import { generateKeyPair, exportJWK } from "jose";
import fs from "fs";
import path from "path";

async function generateJwksFile() {
  try {
    const { publicKey, privateKey } = await generateKeyPair("RS256", {
      extractable: true,
    });

    const jwk = await exportJWK(publicKey);

    jwk.use = "sig";
    jwk.alg = "RS256";
    jwk.kid = Date.now().toString();

    // Create JWKS structure
    const jwks = {
      keys: [jwk],
    };

    const wellKnownDir = path.join(process.cwd(), "public", ".well-known");
    const jwksPath = path.join(wellKnownDir, "jwks.json");
    const privateKeyPath = path.join(process.cwd(), "private-key.json");

    if (!fs.existsSync(wellKnownDir)) {
      fs.mkdirSync(wellKnownDir, { recursive: true });
    }

    const privateJwk = await exportJWK(privateKey);
    privateJwk.alg = "RS256";
    privateJwk.kid = jwk.kid;

    fs.writeFileSync(jwksPath, JSON.stringify(jwks, null, 2));
    fs.writeFileSync(privateKeyPath, JSON.stringify(privateJwk, null, 2));

    console.log("JWKS file generated successfully at:", jwksPath);
    console.log("Private key saved to:", privateKeyPath);
    console.log("IMPORTANT: Keep your private key secure!");
  } catch (error) {
    console.error("Error generating JWKS:", error);
  }
}

generateJwksFile();
