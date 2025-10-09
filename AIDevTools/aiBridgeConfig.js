/**
 * AI Bridge Configuration
 * 
 * Controls screenshot analysis behavior and cost limits
 */

module.exports = {
  // Auto-analyze screenshots on test failures
  AUTO_ANALYZE_ON_FAILURE: true,
  
  // Maximum AI uploads per test run (cost control)
  MAX_AI_UPLOADS_PER_RUN: 3,
  
  // Where to save analyzed screenshots
  ANALYSIS_SAVE_PATH: 'devtools/screenshots/incoming',
  
  // Where to log analysis results
  LOG_PATH: 'AIDevTools/PHASE_LOG.md',
  
  // OCR language
  OCR_LANGUAGE: 'eng',
  
  // Maximum text length to extract
  MAX_TEXT_LENGTH: 1000,
  
  // Maximum elements to detect
  MAX_ELEMENTS: 50,
  
  // Screenshot analysis endpoint
  ANALYSIS_ENDPOINT: 'http://localhost:5050/ai/analyze-screenshot/local',
  
  // Test credentials (for automated testing)
  TEST_CREDENTIALS: {
    email: 'jeraldjsmith@gmail.com',
    password: 'Gizmo123'
  }
};

