import sharp from 'sharp';
import { sanitizeImageBuffer, validateImageMagicBytes } from '../src/lib/storage';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✕ FAIL: ${msg}`);
  }
}

async function runImageSanitizationTests() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  Image Metadata Sanitization (Sharp Re-Encoding) Tests');
  console.log('══════════════════════════════════════════════════════════════\n');

  // 1. PNG Sanitization Test
  console.log('─── 1. PNG Image Sanitization ───');
  const rawPng = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 255, g: 0, b: 0, alpha: 1 },
    },
  })
    .png()
    .withMetadata({
      exif: {
        IFD0: {
          ImageDescription: 'Sensitive Private Tenant Location GPS Lat: 30.2672 Long: -97.7431',
        },
      },
    })
    .toBuffer();

  const magicPng = validateImageMagicBytes(rawPng);
  assert(magicPng.valid && magicPng.mime === 'image/png', 'PNG magic bytes identified');

  const cleanPng = await sanitizeImageBuffer(rawPng, 'image/png');
  const cleanPngMeta = await sharp(cleanPng).metadata();
  assert(cleanPngMeta.exif === undefined, 'PNG EXIF/GPS metadata successfully stripped');
  assert(cleanPng.length > 0, 'Clean PNG buffer valid');

  // 2. WebP Sanitization Test
  console.log('\n─── 2. WebP Image Sanitization ───');
  const rawWebp = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 0, g: 255, b: 0 },
    },
  })
    .webp()
    .withMetadata({
      exif: {
        IFD0: {
          Artist: 'Confidential Tenant Document',
        },
      },
    })
    .toBuffer();

  const magicWebp = validateImageMagicBytes(rawWebp);
  assert(magicWebp.valid && magicWebp.mime === 'image/webp', 'WebP magic bytes identified');

  const cleanWebp = await sanitizeImageBuffer(rawWebp, 'image/webp');
  const cleanWebpMeta = await sharp(cleanWebp).metadata();
  assert(cleanWebpMeta.exif === undefined, 'WebP EXIF metadata successfully stripped');
  assert(cleanWebp.length > 0, 'Clean WebP buffer valid');

  // 3. JPEG Sanitization Test
  console.log('\n─── 3. JPEG Image Sanitization ───');
  const rawJpeg = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 0, g: 0, b: 255 },
    },
  })
    .jpeg()
    .withMetadata({
      exif: {
        IFD0: {
          Model: 'Leaked Camera Phone Model',
        },
      },
    })
    .toBuffer();

  const magicJpeg = validateImageMagicBytes(rawJpeg);
  assert(magicJpeg.valid && magicJpeg.mime === 'image/jpeg', 'JPEG magic bytes identified');

  const cleanJpeg = await sanitizeImageBuffer(rawJpeg, 'image/jpeg');
  const cleanJpegMeta = await sharp(cleanJpeg).metadata();
  assert(cleanJpegMeta.exif === undefined, 'JPEG EXIF metadata successfully stripped');
  assert(cleanJpeg.length > 0, 'Clean JPEG buffer valid');

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runImageSanitizationTests().catch((err) => {
  console.error('Image test failed:', err);
  process.exit(1);
});
