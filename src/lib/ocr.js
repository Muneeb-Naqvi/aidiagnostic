import { PDFDocument } from 'pdf-lib';

export async function extractTextFromImage(imageUrl) {
  try {
    const apiKey = process.env.OCRSPACE_API_KEY;
    if (!apiKey) {
      console.error("OCRSPACE_API_KEY is missing");
      return "";
    }

    // Handle relative URLs for local uploads
    let finalUrl = imageUrl;
    if (imageUrl.startsWith("/")) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      finalUrl = `${baseUrl}${imageUrl}`;
      console.log(`[OCR] Converted relative URL to absolute: ${finalUrl}`);
    }

    // Try to guess file type from URL or default to JPG
    let fileType = "JPG";
    const lowerUrl = finalUrl.toLowerCase();
    if (lowerUrl.endsWith(".pdf")) fileType = "PDF";
    else if (lowerUrl.endsWith(".png")) fileType = "PNG";
    else if (lowerUrl.endsWith(".gif")) fileType = "GIF";
    else if (lowerUrl.includes("image/upload")) fileType = "JPG";

    // 1. Download the file locally first to bypass OCRSPACE download errors
    console.log(`[OCR] Downloading file from: ${finalUrl}`);
    const fileResponse = await fetch(finalUrl);
    if (!fileResponse.ok) throw new Error(`Failed to download file: ${fileResponse.statusText}`);

    const blob = await fileResponse.blob();

    // 2. If PDF, Check Page Count & Chunk if necessary
    if (fileType === "PDF") {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();

        if (pageCount > 3) {
          console.log(`[OCR] PDF has ${pageCount} pages. Splitting into 3-page chunks to bypass free tier limit...`);
          return await processPdfInChunks(pdfDoc, apiKey);
        }
      } catch (pdfError) {
        console.warn("[OCR] PDF processing error (likely encrypted or invalid), falling back to standard upload:", pdfError.message);
      }
    }

    // Standard processing for Images or Short PDFs
    const fileName = lowerUrl.split('/').pop() || (fileType === "PDF" ? "report.pdf" : "report.jpg");
    return await sendToOcrSpace(blob, apiKey, fileType, fileName);

  } catch (error) {
    console.error("OCR extraction failed:", error);
    return "";
  }
}

async function processPdfInChunks(pdfDoc, apiKey) {
  const pageCount = pdfDoc.getPageCount();
  const chunkSize = 3;
  let fullText = "";

  for (let i = 0; i < pageCount; i += chunkSize) {
    try {
      const chunkDoc = await PDFDocument.create();
      const end = Math.min(i + chunkSize, pageCount);
      const pageIndices = [];
      for (let j = i; j < end; j++) pageIndices.push(j);

      const copiedPages = await chunkDoc.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => chunkDoc.addPage(page));

      const chunkBytes = await chunkDoc.save();
      const chunkBlob = new Blob([chunkBytes], { type: 'application/pdf' });

      console.log(`[OCR] Processing Chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(pageCount / chunkSize)} (Pages ${i + 1}-${end})...`);

      const chunkText = await sendToOcrSpace(chunkBlob, apiKey, "PDF", `chunk_${i}.pdf`);
      fullText += chunkText + " ";

      // Small delay to be nice to the API
      if (i + chunkSize < pageCount) await new Promise(r => setTimeout(r, 500));

    } catch (chunkError) {
      console.error(`[OCR] Error processing chunk starting at page ${i}:`, chunkError);
    }
  }

  return fullText.trim();
}

async function sendToOcrSpace(fileBlob, apiKey, fileType, fileName) {
  const formData = new FormData();
  formData.append("apikey", apiKey);
  formData.append("file", fileBlob, fileName);
  formData.append("isOverlayRequired", "false");
  formData.append("detectOrientation", "true");
  formData.append("scale", "true");
  formData.append("OCREngine", "2");
  formData.append("filetype", fileType);

  console.log(`[OCR] Uploading ${fileName} to OCRSPACE (Size: ${fileBlob.size} bytes)...`);

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (data.OCRExitCode === 1) {
    let text = "";
    data.ParsedResults?.forEach((result) => {
      text += result.ParsedText + " ";
    });
    return text.trim();
  } else {
    console.error(`[OCR] API Error for ${fileName}:`, data.ErrorMessage || data.ErrorDetails);
    return "";
  }
}