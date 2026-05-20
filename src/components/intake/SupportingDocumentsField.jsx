import { useRef, useState } from "react";
import { uuid } from "../../lib/format.js";
import { formatFileSize, readPdfAsDataUrl } from "../../lib/documents.js";
import { Button } from "../ui/Button.jsx";
import { TextInput } from "../ui/FormField.jsx";

function LinkIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

export function SupportingDocumentsField({ documents, onChange }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);

  const addLink = () => {
    onChange([...documents, { id: uuid(), name: "", url: "" }]);
  };

  const updateDoc = (idx, key, value) => {
    onChange(documents.map((d, i) => (i === idx ? { ...d, [key]: value } : d)));
  };

  const removeDoc = (idx) => {
    onChange(documents.filter((_, i) => i !== idx));
  };

  const onPickPdf = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploadError("");
    setUploading(true);
    try {
      const { dataUrl, fileName, size } = await readPdfAsDataUrl(file);
      const baseName = fileName.replace(/\.pdf$/i, "");
      onChange([
        ...documents,
        {
          id: uuid(),
          name: baseName,
          fileName,
          dataUrl,
          fileSize: size,
        },
      ]);
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" type="button" onClick={addLink}>
          + Add link
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading…" : "+ Upload PDF"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={onPickPdf}
        />
      </div>

      {uploadError ? (
        <p className="text-xs text-red-600">{uploadError}</p>
      ) : null}

      {documents.length === 0 ? (
        <p className="text-xs text-slate-400">No documents added yet.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, idx) =>
            doc.dataUrl ? (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-md bg-slate-50 p-3 ring-1 ring-inset ring-slate-200"
              >
                <PdfIcon />
                <div className="min-w-0 flex-1">
                  <TextInput
                    placeholder="Document name"
                    value={doc.name}
                    onChange={(e) => updateDoc(idx, "name", e.target.value)}
                  />
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {doc.fileName}
                    {doc.fileSize ? " · " + formatFileSize(doc.fileSize) : ""}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeDoc(idx)}>
                  Remove
                </Button>
              </div>
            ) : (
              <div
                key={doc.id}
                className="grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-3 ring-1 ring-inset ring-slate-200 sm:grid-cols-[1fr_2fr_auto]"
              >
                <div className="flex items-center gap-2">
                  <LinkIcon />
                  <TextInput
                    placeholder="Document name"
                    value={doc.name}
                    onChange={(e) => updateDoc(idx, "name", e.target.value)}
                  />
                </div>
                <TextInput
                  placeholder="https://..."
                  value={doc.url || ""}
                  onChange={(e) => updateDoc(idx, "url", e.target.value)}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeDoc(idx)}>
                  Remove
                </Button>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
