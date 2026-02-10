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

export async function fetchAlbums(): Promise<Album[]> {
  const res = await fetch(`${API_BASE}?action=list_albums`);
  if (!res.ok) throw new Error("Failed to fetch albums");
  return res.json();
}

export async function fetchImages(folder: string): Promise<GalleryImage[]> {
  const res = await fetch(
    `${API_BASE}?action=list_images&folder=${encodeURIComponent(folder)}`
  );
  if (!res.ok) throw new Error("Failed to fetch images");
  return res.json();
}

export async function uploadImages(
  folder: string,
  files: FileList,
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
