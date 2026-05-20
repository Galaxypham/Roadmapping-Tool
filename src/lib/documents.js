export const MAX_PDF_BYTES = 5 * 1024 * 1024;

export function getDocumentHref(doc) {
  if (doc?.dataUrl) return doc.dataUrl;
  return doc?.url || "#";
}

export function isFileDocument(doc) {
  return Boolean(doc?.dataUrl);
}

export function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function readPdfAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (file.type !== "application/pdf") {
      reject(new Error("Only PDF files are supported."));
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      reject(
        new Error(
          "PDF must be under " + formatFileSize(MAX_PDF_BYTES) + ". Try a smaller file or use a link instead.",
        ),
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve({ dataUrl: reader.result, fileName: file.name, size: file.size });
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function normalizeDocument(doc, meta = {}) {
  if (doc.dataUrl) {
    return {
      id: doc.id,
      name: (doc.name || doc.fileName || "Document").trim(),
      fileName: doc.fileName || doc.name || "document.pdf",
      dataUrl: doc.dataUrl,
      fileSize: doc.fileSize ?? null,
      added_by: meta.added_by,
      added_at: meta.added_at,
    };
  }
  return {
    id: doc.id,
    name: doc.name.trim(),
    url: doc.url.trim(),
    added_by: meta.added_by,
    added_at: meta.added_at,
  };
}

export function isDocumentComplete(doc) {
  if (doc.dataUrl) {
    return Boolean((doc.name || doc.fileName || "").trim());
  }
  return Boolean(doc.name?.trim() && doc.url?.trim());
}
