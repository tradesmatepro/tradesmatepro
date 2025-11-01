/**
 * PDF Generator Server - Uses Puppeteer for professional-quality PDF generation
 * Generates native PDFs (not image-based) with perfect quality and small file sizes
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * Initialize Puppeteer browser instance
 */
async function initBrowser() {
  if (!browser) {
    console.log('🚀 Launching Puppeteer browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    console.log('✅ Puppeteer browser launched');
  }
  return browser;
}

/**
 * Generate PDF from HTML using Puppeteer
 * Returns binary PDF Buffer (not base64)
 */
async function generatePDFFromHTML(htmlContent) {
  let browser = null;
  let page = null;

  try {
    // Create a fresh browser instance for each PDF to avoid connection issues
    console.log('🚀 Creating fresh browser instance for PDF generation...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1
    });

    console.log('📝 Setting HTML content...');
    // Load HTML content with shorter timeout
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 20000
    });

    // Ensure fonts/images are ready
    try {
      await page.evaluate(() => {
        return (typeof document !== 'undefined' && document.fonts && document.fonts.ready) || null;
      });
    } catch (e) {
      console.warn('⚠️ fonts.ready wait skipped:', e?.message || e);
    }
    try { await page.emulateMediaType('screen'); } catch {}

    console.log('⏳ Waiting for rendering...');
    // Wait a bit for CSS and images to render
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('🖨️ Generating PDF...');
    // Generate PDF with optimal settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      printBackground: true,
      scale: 1,
      preferCSSPageSize: true
    });

    console.log(`✅ PDF generated: ${pdfBuffer.length} bytes (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);

    return pdfBuffer;  // Return binary Buffer, not base64
  } catch (error) {
    console.error('❌ PDF generation error:', error.message);
    throw error;
  } finally {
    // Always close page and browser to avoid connection issues
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.warn('⚠️ Error closing page:', closeError.message);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('⚠️ Error closing browser:', closeError.message);
      }
    }
  }
}

/**
 * POST /api/generate-pdf
 * Generate PDF from HTML content
 * Returns binary PDF directly (not base64)
 *
 * Request body:
 * {
 *   "html": "<html>...</html>"
 * }
 *
 * Response:
 * Binary PDF data with Content-Type: application/pdf
 */
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required'
      });
    }

    console.log('📄 Generating PDF from HTML...');
    console.log('📏 HTML size:', html.length, 'bytes');

    const pdfBuffer = await generatePDFFromHTML(html);

    // Validate PDF
    console.log('🔍 PDF type:', typeof pdfBuffer, 'isBuffer:', Buffer.isBuffer(pdfBuffer), 'length:', pdfBuffer?.length);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF generation returned invalid data');
    }

    console.log(`✅ PDF validation passed: ${pdfBuffer.length} bytes`);

    // Debug: check magic header and persist latest PDF for inspection
    const magic = pdfBuffer.slice(0, 5).toString('ascii');
    console.log('🔏 PDF magic header:', magic);
    try {
      const tmpDir = path.join(__dirname, 'tmp');
      fs.mkdirSync(tmpDir, { recursive: true });
      const outPath = path.join(tmpDir, `latest.pdf`);
      fs.writeFileSync(outPath, pdfBuffer);
      console.log('💾 Wrote debug PDF to:', outPath);
    } catch (e) {
      console.warn('⚠️ Failed to write debug PDF:', e.message);
    }

    // Return as binary PDF (no base64 conversion)
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', 'inline; filename=invoice.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ PDF generation endpoint error:', error.message);
    console.error('❌ Error stack:', error?.stack || error);
    // Persist last HTML for debugging
    try {
      const tmpDir = path.join(__dirname, 'tmp');
      fs.mkdirSync(tmpDir, { recursive: true });
      const htmlPath = path.join(tmpDir, 'latest.html');
      fs.writeFileSync(htmlPath, req?.body?.html || '');
      console.log('💾 Wrote debug HTML to:', htmlPath);
    } catch (e) {
      console.warn('⚠️ Failed to write debug HTML:', e.message);
    }
    res.status(500).json({
      success: false,
      error: error.message || 'PDF generation failed',
      stack: (error && error.stack) ? String(error.stack).split('\n').slice(0, 5) : undefined
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pdf-generator' });
});

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('🛑 Shutting down PDF generator...');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Start server
 */
const PORT = process.env.PDF_GENERATOR_PORT || 3005;
app.listen(PORT, () => {
  console.log(`🎯 PDF Generator running on port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/generate-pdf`);
});

