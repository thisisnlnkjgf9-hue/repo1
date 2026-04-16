import multer from 'multer';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const supabaseEndpoint = process.env.SUPABASE_S3_ENDPOINT || '';
const supabaseRegion = process.env.SUPABASE_REGION || 'ap-northeast-1';
const supabaseAccessKeyId = process.env.SUPABASE_ACCESS_KEY_ID || '';
const supabaseSecretAccessKey = process.env.SUPABASE_SECRET_ACCESS_KEY || '';
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
const supabasePublicBaseUrl = process.env.SUPABASE_PUBLIC_BASE_URL || '';
const uploadFolder = process.env.SUPABASE_UPLOAD_FOLDER || 'uploads';

const s3 = (supabaseEndpoint && supabaseAccessKeyId && supabaseSecretAccessKey)
  ? new S3Client({
      region: supabaseRegion,
      endpoint: supabaseEndpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: supabaseAccessKeyId,
        secretAccessKey: supabaseSecretAccessKey
      }
    })
  : null;

if (s3) {
  console.log(`🔥 Supabase Storage initialized successfully. Bucket: ${supabaseBucket}`);
} else {
  console.log('⚠️ Supabase Storage disabled: missing SUPABASE_S3_ENDPOINT, SUPABASE_ACCESS_KEY_ID, or SUPABASE_SECRET_ACCESS_KEY');
}

const memoryStorage = multer.memoryStorage();
const maxUploadSize = 15 * 1024 * 1024;

function imageFileFilter(_req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  return cb(new Error('Only image files are allowed for this upload.'));
}

function pdfFileFilter(_req, file, cb) {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  return cb(new Error('Only PDF files are allowed for medical report upload.'));
}

// Images (blogs/products/doctors)
export const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: maxUploadSize },
  fileFilter: imageFileFilter,
});

// PDF reports in user profile
export const uploadReportPdf = multer({
  storage: memoryStorage,
  limits: { fileSize: maxUploadSize },
  fileFilter: pdfFileFilter,
});

// Backward-compatible export name used in existing code.
export const upload = uploadImage;

export const uploadToCloud = async (req, res, next) => {
  if (!req.file) return next();
  if (!(req.file.mimetype?.startsWith('image/') || req.file.mimetype === 'application/pdf')) {
    return next(new Error('Unsupported file type. Only images and PDFs are allowed.'));
  }

  if (!s3) {
    const err = new Error('Supabase Storage is not configured. Set SUPABASE_S3_ENDPOINT, SUPABASE_ACCESS_KEY_ID, SUPABASE_SECRET_ACCESS_KEY, and SUPABASE_STORAGE_BUCKET.');
    err.status = 503;
    return next(err);
  }

  const filename = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
  const objectPath = `${uploadFolder}/${filename}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: supabaseBucket,
      Key: objectPath,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const publicBase = supabasePublicBaseUrl || supabaseEndpoint.replace(/\/storage\/v1\/s3\/?$/, '');
    req.file.cloudUrl = `${publicBase}/storage/v1/object/public/${supabaseBucket}/${objectPath}`;
  } catch (err) {
    console.error('Supabase Cloud upload failed:', err);
    const reason = err?.message || 'Unknown upload error';
    const status = err?.$metadata?.httpStatusCode || err?.statusCode || 502;
    const uploadErr = new Error(`Cloud upload failed: ${reason}`);
    uploadErr.status = status;
    return next(uploadErr);
  }

  next();
};
