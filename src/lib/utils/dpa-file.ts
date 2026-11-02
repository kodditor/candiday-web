export const DPA_PDF_ACCEPT = ".pdf,application/pdf";

export function isValidDpaPdfFile(file: File): boolean {
  if (file.type === "application/pdf") {
    return true;
  }

  return file.name.toLowerCase().endsWith(".pdf");
}
