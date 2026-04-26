import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const MIN_TEXT_LENGTH = 50; 

export type ExtractedText = {
  text: string;
  mimeType: string;
};

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
): Promise<ExtractedText> {
  if (!buffer || buffer.length === 0) {
    throw new Error('File buffer is empty.');
  }

  let rawText = '';

  if (mimeType === 'application/pdf') {
    rawText = await extractFromPDF(buffer);
  } else if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractFromDOCX(buffer);
  } else {
    throw new Error(`Cannot extract text from MIME type: ${mimeType}`);
  }

  // Normalise: collapse excessive whitespace, remove null bytes
  const cleaned = rawText
    .replace(/\x00/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]{3,}/g, '  ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new Error(
      'Extracted text is too short. The file may be image-based or empty. ' +
        'Please upload a text-based resume.',
    );
  }

  return { text: cleaned, mimeType };
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse reads the text layer; ignores embedded images
    const parseFn =
      (pdfParse as any).pdfParse ??
      (pdfParse as any).default ??
      (typeof (pdfParse as any) === 'function' ? (pdfParse as any) : null);

    let data: any;

    if (typeof parseFn === 'function') {
      data = await parseFn(buffer, {
        // Disable font-width heuristic that sometimes joins words
        normalizeWhitespace: false,
      });
    } else if (typeof (pdfParse as any).PDFParse === 'function') {
      const parser = new (pdfParse as any).PDFParse({ data: buffer });
      data = await parser.getText();
    } else {
      throw new Error('Unsupported pdf-parse export format.');
    }

    if (!data.text) {
      throw new Error('No text layer found in PDF.');
    }
    return data.text;
  } catch (err: any) {
    // pdf-parse throws on corrupted / password-protected files
    throw new Error(`PDF extraction failed: ${err.message}`);
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    // extractRawText strips all formatting – ideal for AI ingestion
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      // mammoth.messages contains non-fatal warnings (e.g. unsupported element)
      console.warn('[TextExtractor] DOCX warnings:', result.messages);
    }

    if (!result.value) {
      throw new Error('No text extracted from DOCX.');
    }
    return result.value;
  } catch (err: any) {
    throw new Error(`DOCX extraction failed: ${err.message}`);
  }
}