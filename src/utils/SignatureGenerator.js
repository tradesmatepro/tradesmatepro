/**
 * SignatureGenerator - Generate elegant cursive signature images from typed names
 * Used in CompletionAndInvoiceModal, SendInvoiceModal, and invoice emails
 */

/**
 * Generate a simulated signature image from typed name
 * Creates a canvas with elegant cursive-style text and returns as data URL
 * Uses better font sizing and positioning to avoid cutoff
 */
export const generateSignatureImage = (name) => {
  if (!name || name.trim() === '') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw signature line (elegant underline)
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(20, 100);
    ctx.lineTo(480, 100);
    ctx.stroke();

    // Draw signature text in elegant cursive style
    // Start with larger font and scale down if needed
    let fontSize = 60;
    ctx.fillStyle = '#1f2937';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';

    // Use cursive font family for elegant look
    ctx.font = `italic ${fontSize}px 'Brush Script MT', 'Lucida Handwriting', cursive`;

    // Measure text width
    let textWidth = ctx.measureText(name).width;
    console.log(`🖊️ Initial measurement: "${name}" width=${textWidth} at fontSize=${fontSize}`);

    // Scale down if text is too wide
    while (textWidth > 450 && fontSize > 20) {
      fontSize -= 5;
      ctx.font = `italic ${fontSize}px 'Brush Script MT', 'Lucida Handwriting', cursive`;
      textWidth = ctx.measureText(name).width;
      console.log(`🖊️ Scaled down to fontSize=${fontSize}, textWidth=${textWidth}`);
    }

    // Draw the signature text
    // Position at (25, 60) to be centered vertically on the line
    ctx.fillText(name, 25, 60);
    console.log(`🖊️ Drew signature: "${name}" at position (25, 60), textWidth: ${textWidth}`);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    console.log(`✅ Generated signature image, size: ${dataUrl.length} bytes`);
    return dataUrl;
  } catch (e) {
    console.error('❌ Failed to generate signature image:', e);
    return null;
  }
};

export default {
  generateSignatureImage
};

