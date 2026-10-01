import http from 'node:http';
import sharp from 'sharp';
import { S3StorageProvider } from '../src/lib/storage';

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

async function runS3MinioTest() {
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  S3 Storage Provider / MinIO Compatibility Test');
  console.log('══════════════════════════════════════════════════════════════\n');

  // Spin up lightweight mock MinIO S3 HTTP server on port 9099
  let receivedPut = false;
  let receivedBytes = 0;
  let receivedContentType = '';

  const server = http.createServer((req, res) => {
    if (req.method === 'PUT') {
      receivedPut = true;
      receivedContentType = req.headers['content-type'] || '';
      const chunks: Buffer[] = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        receivedBytes = Buffer.concat(chunks).length;
        res.writeHead(200, { ETag: '"test-etag-123"' });
        res.end();
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  await new Promise<void>((resolve) => server.listen(9099, resolve));

  try {
    process.env.S3_BUCKET_NAME = 'zkrent-media';
    process.env.S3_ENDPOINT = 'http://127.0.0.1:9099';
    process.env.S3_PUBLIC_URL = 'http://127.0.0.1:9099/zkrent-media';

    const provider = new S3StorageProvider();

    const samplePng = await sharp({
      create: {
        width: 64,
        height: 64,
        channels: 4,
        background: { r: 10, g: 100, b: 200, alpha: 1 },
      },
    })
      .png()
      .toBuffer();

    const uploadedUrl = await provider.upload(samplePng, 'property-cover.png', 'image/png');

    assert(receivedPut, 'MinIO/S3 PUT request successfully received by mock S3 endpoint');
    assert(receivedContentType === 'image/png', 'Correct Content-Type image/png transmitted');
    assert(receivedBytes > 0, `Non-empty sanitized image payload received (${receivedBytes} bytes)`);
    assert(uploadedUrl.startsWith('http://127.0.0.1:9099/zkrent-media/properties/'), `Public URL formatted correctly: ${uploadedUrl}`);
  } finally {
    server.close();
  }

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

runS3MinioTest().catch((err) => {
  console.error('S3/MinIO test failed:', err);
  process.exit(1);
});
