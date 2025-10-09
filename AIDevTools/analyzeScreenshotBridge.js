/**
 * Screenshot Analysis Bridge
 * 
 * Local API handler for screenshot intake and analysis
 * Enables AI to "see" screenshots without cloud uploads
 * 
 * Features:
 * - Save screenshots locally
 * - OCR text extraction
 * - UI element detection
 * - Structured analysis results
 * - Cost control (no cloud uploads)
 */

const fs = require('fs');
const path = require('path');
const { createWorker } = require('tesseract.js');

const ROOT = process.cwd();
const INCOMING_DIR = path.join(ROOT, 'devtools', 'screenshots', 'incoming');
const RESULTS_FILE = path.join(ROOT, 'AIDevTools', 'visual_analysis_results.json');
const LOG_FILE = path.join(ROOT, 'AIDevTools', 'PHASE_LOG.md');

// Ensure directories exist
if (!fs.existsSync(INCOMING_DIR)) {
  fs.mkdirSync(INCOMING_DIR, { recursive: true });
}

// Initialize results file if it doesn't exist
if (!fs.existsSync(RESULTS_FILE)) {
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ analyses: [] }, null, 2));
}

/**
 * Save screenshot to disk
 */
function saveScreenshot(imageBase64, context) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${context || 'screenshot'}.png`;
  const filepath = path.join(INCOMING_DIR, filename);
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  
  fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
  
  return {
    filename,
    filepath,
    timestamp
  };
}

/**
 * Log to PHASE_LOG.md
 */
function logToPhaseLog(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `\n[${timestamp}] ${message}\n`;
  
  try {
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (err) {
    console.error('Failed to write to PHASE_LOG.md:', err.message);
  }
}

/**
 * Save analysis result
 */
function saveAnalysisResult(result) {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    data.analyses.push(result);
    
    // Keep only last 100 analyses
    if (data.analyses.length > 100) {
      data.analyses = data.analyses.slice(-100);
    }
    
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to save analysis result:', err.message);
  }
}

/**
 * Get recent analysis results
 */
function getRecentAnalyses(limit = 10) {
  try {
    const data = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    return data.analyses.slice(-limit).reverse();
  } catch (err) {
    console.error('Failed to read analysis results:', err.message);
    return [];
  }
}

/**
 * Perform OCR and UI analysis on screenshot
 */
async function analyzeScreenshot(filepath, context) {
  const worker = await createWorker('eng');
  
  try {
    console.log(`🔍 Analyzing screenshot: ${filepath}`);
    
    // Perform OCR
    const { data } = await worker.recognize(filepath);
    
    // Extract text
    const extractedText = data.text.trim();
    const words = data.words || [];
    
    // Detect UI elements based on text patterns
    const elements = [];
    
    // Look for buttons (common button text patterns)
    const buttonPatterns = /\b(create|save|send|cancel|delete|edit|view|submit|confirm|close|add|remove|update|login|logout|sign in|sign up)\b/gi;
    const buttonMatches = extractedText.match(buttonPatterns) || [];
    buttonMatches.forEach(text => {
      elements.push({ type: 'button', text: text.trim() });
    });
    
    // Look for links (URLs or navigation text)
    const linkPatterns = /\b(home|dashboard|quotes|jobs|invoices|customers|settings|profile|help|about)\b/gi;
    const linkMatches = extractedText.match(linkPatterns) || [];
    linkMatches.forEach(text => {
      if (!buttonMatches.includes(text)) {
        elements.push({ type: 'link', text: text.trim() });
      }
    });
    
    // Look for alerts/messages
    const alertPatterns = /\b(error|warning|success|info|alert|notice|no .+ found|.+ required|.+ failed)\b/gi;
    const alertMatches = extractedText.match(alertPatterns) || [];
    alertMatches.forEach(text => {
      elements.push({ type: 'alert', text: text.trim() });
    });
    
    // Look for form fields
    const fieldPatterns = /\b(email|password|username|name|address|phone|search|filter)\b/gi;
    const fieldMatches = extractedText.match(fieldPatterns) || [];
    fieldMatches.forEach(text => {
      elements.push({ type: 'input', text: text.trim() });
    });
    
    // Generate summary
    const summary = generateSummary(extractedText, elements);
    
    const result = {
      timestamp: new Date().toISOString(),
      context,
      filepath,
      summary,
      extractedText: extractedText.substring(0, 500), // Limit text length
      elements: elements.slice(0, 20), // Limit elements
      confidence: data.confidence || 0,
      wordCount: words.length
    };
    
    console.log(`✅ Analysis complete: ${summary}`);
    
    return result;
    
  } catch (err) {
    console.error('❌ Analysis failed:', err.message);
    return {
      timestamp: new Date().toISOString(),
      context,
      filepath,
      summary: `Analysis failed: ${err.message}`,
      extractedText: '',
      elements: [],
      error: err.message
    };
  } finally {
    await worker.terminate();
  }
}

/**
 * Generate human-readable summary
 */
function generateSummary(text, elements) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  // Check for common page types
  if (text.toLowerCase().includes('login') || text.toLowerCase().includes('sign in')) {
    return 'Login page detected';
  }
  
  if (text.toLowerCase().includes('quote') && text.toLowerCase().includes('table')) {
    const quoteCount = (text.match(/quote/gi) || []).length;
    return `Quotes page with approximately ${quoteCount} quote references`;
  }
  
  if (text.toLowerCase().includes('dashboard')) {
    return 'Dashboard page detected';
  }
  
  if (text.toLowerCase().includes('no') && text.toLowerCase().includes('found')) {
    return 'Empty state - no items found';
  }
  
  // Generic summary
  const buttonCount = elements.filter(e => e.type === 'button').length;
  const linkCount = elements.filter(e => e.type === 'link').length;
  const alertCount = elements.filter(e => e.type === 'alert').length;
  
  return `Page with ${buttonCount} buttons, ${linkCount} links, ${alertCount} alerts/messages`;
}

/**
 * Register routes with Express app
 */
function registerScreenshotRoutes(app) {
  console.log('📸 Registering screenshot analysis routes...');
  
  // Route 1: Save screenshot
  app.post('/ai/analyze-screenshot', async (req, res) => {
    try {
      const { image_base64, context } = req.body;
      
      if (!image_base64) {
        return res.status(400).json({ error: 'Missing image_base64' });
      }
      
      const saved = saveScreenshot(image_base64, context);
      
      const log = {
        timestamp: new Date().toISOString(),
        context: context || 'unknown',
        saved: saved.filepath
      };
      
      logToPhaseLog(`📸 Screenshot received: ${JSON.stringify(log)}`);
      
      return res.json({
        status: 'ok',
        saved: saved.filepath,
        filename: saved.filename
      });
      
    } catch (err) {
      console.error('Error saving screenshot:', err);
      return res.status(500).json({ error: err.message });
    }
  });
  
  // Route 2: Analyze screenshot with OCR
  app.post('/ai/analyze-screenshot/local', async (req, res) => {
    try {
      const { image_base64, context, filepath } = req.body;
      
      let imagePath;
      
      if (filepath) {
        // Use existing file
        imagePath = filepath;
      } else if (image_base64) {
        // Save new file
        const saved = saveScreenshot(image_base64, context);
        imagePath = saved.filepath;
      } else {
        return res.status(400).json({ error: 'Missing image_base64 or filepath' });
      }
      
      // Perform analysis
      const result = await analyzeScreenshot(imagePath, context);
      
      // Save result
      saveAnalysisResult(result);
      
      // Log to PHASE_LOG
      logToPhaseLog(`🔍 Screenshot analyzed: ${result.summary}`);
      
      return res.json({
        status: 'ok',
        analysis: result
      });
      
    } catch (err) {
      console.error('Error analyzing screenshot:', err);
      return res.status(500).json({ error: err.message });
    }
  });
  
  // Route 3: Get recent analyses
  app.get('/ai/analyze-screenshot/report', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const analyses = getRecentAnalyses(limit);
      
      return res.json({
        status: 'ok',
        count: analyses.length,
        analyses
      });
      
    } catch (err) {
      console.error('Error getting report:', err);
      return res.status(500).json({ error: err.message });
    }
  });
  
  console.log('✅ Screenshot analysis routes registered');
}

module.exports = {
  registerScreenshotRoutes,
  saveScreenshot,
  analyzeScreenshot,
  getRecentAnalyses
};

