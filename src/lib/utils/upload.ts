import { api } from "../request";

export type UploadOptions = {
  type?: string;
  protected?: boolean;
};

export async function uploadFile(
  file: File,
  token?: string | null,
  opts?: UploadOptions,
): Promise<string> {
  const formData = new FormData();
  formData.append("files", file);

  if (opts?.type) {
    formData.append("type", opts.type);
  }

  if (opts?.protected) {
    formData.append("protected", "true");
  }

  const response = await api.post("/assets/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (response.status !== 200 || !response.data.success) {
    throw new Error(response.data.error || "Failed to upload file");
  }

  return response.data.data.links[0];
}
