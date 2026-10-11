import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} (see .env.example)`);
  return v;
}

export function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export async function uploadToR2(key: string, body: Uint8Array | string, contentType = "application/octet-stream") {
  const Bucket = requireEnv("R2_BUCKET_FILES");
  await r2Client().send(new PutObjectCommand({ Bucket, Key: key, Body: body as never, ContentType: contentType }));
  return key;
}

export async function signedDownloadUrl(key: string, expiresIn = 3600) {
  const Bucket = requireEnv("R2_BUCKET_FILES");
  return getSignedUrl(r2Client(), new GetObjectCommand({ Bucket, Key: key }), { expiresIn });
}
