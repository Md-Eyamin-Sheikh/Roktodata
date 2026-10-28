import crypto from 'crypto';

interface VapidKeys {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function getVapidKeys(): VapidKeys {
  return {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:support@roktodata.org',
  };
}

/**
 * Creates RFC 8292 VAPID Authorization JWT signed with ES256
 */
export function createVapidToken(audience: string, keys: VapidKeys): string {
  const header = {
    typ: 'JWT',
    alg: 'ES256',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 12 * 3600, // 12 hours
    sub: keys.subject,
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Private key in raw base64url format -> Convert to PKCS#8 or JWK
  const jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: Buffer.from(keys.publicKey, 'base64url').subarray(1, 33).toString('base64url'),
    y: Buffer.from(keys.publicKey, 'base64url').subarray(33, 65).toString('base64url'),
    d: keys.privateKey,
  };

  const privKey = crypto.createPrivateKey({ format: 'jwk', key: jwk });
  const signer = crypto.createSign('SHA256');
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign({ key: privKey, dsaEncoding: 'ieee-p1363' });
  const signatureB64 = signature.toString('base64url');

  return `${unsignedToken}.${signatureB64}`;
}

/**
 * Sends a Web Push trigger to a single subscription
 */
export async function sendWebPush(
  endpoint: string,
  payload: any = null
): Promise<{ statusCode: number; success: boolean; expired: boolean }> {
  try {
    const keys = getVapidKeys();
    if (!keys.publicKey || !keys.privateKey) {
      return { statusCode: 500, success: false, expired: false };
    }
    const endpointUrl = new URL(endpoint);
    const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
    const token = createVapidToken(audience, keys);

    const headers: Record<string, string> = {
      Authorization: `vapid t=${token}, k=${keys.publicKey}`,
      TTL: '86400',
      Urgency: 'high',
    };

    // If payload is provided, serialize as JSON text or send trigger
    let body: any = null;
    if (payload) {
      headers['Content-Type'] = 'text/plain; charset=utf-8';
      body = typeof payload === 'string' ? payload : JSON.stringify(payload);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
    });

    const statusCode = response.status;
    const isExpired = statusCode === 404 || statusCode === 410;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    return {
      statusCode,
      success: isSuccess,
      expired: isExpired,
    };
  } catch (err: any) {
    console.warn(`Web push dispatch to ${endpoint.slice(0, 30)}... error:`, err?.message);
    return {
      statusCode: 500,
      success: false,
      expired: false,
    };
  }
}
