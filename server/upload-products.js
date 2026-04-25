/**
 * upload-products.js
 * Uploads all images in public/productimagesforshow/ to Supabase
 * and prints their public CDN URLs.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dir     = dirname(__filename);

const ENDPOINT   = 'https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/s3';
const ACCESS_KEY = 'f984880ceb08ff030c17956f5358b7b1';
const SECRET_KEY = 'ec43ce100f5b24830448ebf3513c196fc9668763aa73181cce5135dde1555f48';
const REGION     = 'ap-northeast-1';
const BUCKET     = 'nouryum';
const FOLDER     = 'site/products';

const CDN_BASE = `https://zhbnmlroytjmdykkvwhn.storage.supabase.co/storage/v1/object/public/${BUCKET}/${FOLDER}`;

const s3 = new S3Client({
  endpoint: ENDPOINT,
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
  forcePathStyle: true,
});

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp',
};

const DIR = join(__dir, '..', 'public', 'productimagesforshow');
const files = readdirSync(DIR).sort();

console.log(`\n📂 Found ${files.length} file(s) in public/productimagesforshow:\n`);

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const ext  = extname(file).toLowerCase();
  const mime = MIME[ext] || 'image/jpeg';
  const dest = `product${i + 1}${ext}`;
  const key  = `${FOLDER}/${dest}`;
  const body = readFileSync(join(DIR, file));

  process.stdout.write(`  Uploading "${file}" → ${dest} … `);
  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET, Key: key, Body: body,
      ContentType: mime, CacheControl: 'public, max-age=31536000',
    }));
    console.log(`✅  ${CDN_BASE}/${dest}`);
  } catch (err) {
    console.log('❌', err.message);
  }
}

console.log('\n✨ Done!\n');
