const API_BASE = "/gallery/api.php";

export interface Album {
  name: string;
  thumbnail: string | null;
  count: number;
}

export interface GalleryImage {
  name: string;
  url: string;
  thumbnail: string;
}

class NonJsonResponseError extends Error {
  constructor() {
    super("Server returned non-JSON response. Gallery requires a PHP server.");
    this.name = "NonJsonResponseError";
  }
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new NonJsonResponseError();
  }
  return res.json();
}

export async function fetchAlbums(): Promise<Album[]> {
  const res = await fetch(`${API_BASE}?action=list_albums`);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return parseJsonResponse<Album[]>(res);
}

export async function fetchImages(folder: string): Promise<GalleryImage[]> {
  const res = await fetch(
    `${API_BASE}?action=list_images&folder=${encodeURIComponent(folder)}`
  );
  if (!res.ok) throw new Error("Failed to fetch images");
  return parseJsonResponse<GalleryImage[]>(res);
}

export async function uploadImages(
  folder: string,
  files: FileList | File[],
  token: string
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("folder", folder);
  Array.from(files).forEach((f) => formData.append("images[]", f));

  const res = await fetch(`${API_BASE}?action=upload`, {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function createAlbum(
  name: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("album_name", name);

  const res = await fetch(`${API_BASE}?action=create_album`, {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create album");
  return res.json();
}

export async function deleteImage(
  folder: string,
  image: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("folder", folder);
  formData.append("image", image);

  const res = await fetch(`${API_BASE}?action=delete_image`, {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to delete image");
  return res.json();
}

export async function deleteAlbum(
  name: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("album_name", name);

  const res = await fetch(`${API_BASE}?action=delete_album`, {
    method: "POST",
    headers: { "X-Admin-Token": token },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to delete album");
  return res.json();
}

export { NonJsonResponseError };
