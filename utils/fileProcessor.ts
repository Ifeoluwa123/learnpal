
declare const pdfjsLib: any;
declare const mammoth: any;

export interface ExtractedData {
  text: string;
  mimeType?: string;
  base64?: string;
  isImage: boolean;
}

const cleanText = (text: string): string => {
  return text
    .replace(/\s\s+/g, ' ') // Replace multiple spaces with one
    .replace(/\n\s+/g, '\n') // Remove leading spaces on new lines
    .trim();
};

export const processFile = async (file: File): Promise<ExtractedData> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type;

  // Handle Images
  if (mimeType.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        resolve({
          text: "[Image Content]",
          mimeType,
          base64,
          isImage: true
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Handle Text
  if (extension === 'txt') {
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(cleanText(e.target?.result as string));
      reader.readAsText(file);
    });
    return { text, isImage: false };
  }

  // Handle PDF
  if (extension === 'pdf') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });
      
      let lastX = -1;
      let lastY = -1;
      let pageText = '';
      
      for (const item of textContent.items as any[]) {
        const x = item.transform[4];
        const y = item.transform[5];

        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          pageText += '\n';
        } else if (lastX !== -1 && Math.abs(x - (lastX + item.width)) > 2) {
          pageText += ' ';
        }
        
        pageText += item.str;
        lastX = x;
        lastY = y;
      }
      fullText += pageText + '\n\n';
    }
    
    const finalClean = cleanText(fullText);
    if (!finalClean) {
      throw new Error('This PDF appears to be empty or image-based. Try converting it to images first.');
    }

    return { text: finalClean, isImage: false };
  }

  // Handle Word
  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: cleanText(result.value), isImage: false };
  }

  throw new Error('Unsupported file type. Please upload .txt, .pdf, .docx, or images.');
};
