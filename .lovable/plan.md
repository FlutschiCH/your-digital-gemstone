

# Fix Gallery + Add Password-Protected Media Manager

## Problem
The gallery shows "Failed to load" because the Lovable preview server serves `api.php` as raw text instead of executing it as PHP. This will only work on your real server (flutschi.ch). We need to handle this gracefully and make the admin experience much better.

## What will change

### 1. Set the admin password to `Godzilla_12`
- Update `public/gallery/api.php` to use `Godzilla_12` as the `ADMIN_TOKEN`
- Update `AdminLogin.tsx` to validate against this hardcoded password client-side (so the login works even in preview mode)

### 2. Better error handling for preview vs production
- When the API returns non-JSON (like raw PHP source), show a friendly message: "Gallery requires a PHP server. Deploy to flutschi.ch to see your albums."
- Update `gallery-api.ts` to detect and handle non-JSON responses gracefully

### 3. Replace hidden double-click with a visible Admin button
- Add a small lock/key icon button in the gallery header that opens the login dialog
- Keep it subtle but findable (no more guessing where to click)

### 4. New drag-and-drop Media Manager component
Replace the tiny admin toolbar with a full **password-protected media management area**:

- **Login gate**: Enter password `Godzilla_12` to access admin features
- **Drag-and-drop upload zone**: Large drop area with visual feedback, supports multiple files
- **Folder/album management**:
  - Create new albums from the manager
  - Select which album to upload into via a dropdown
  - Delete albums (with confirmation)
- **Upload progress**: Show individual file upload progress with thumbnails
- **File list**: After uploading, see the files in the current album with delete buttons

### 5. Files to create/modify

| File | Action |
|------|--------|
| `public/gallery/api.php` | Update password to `Godzilla_12` |
| `src/lib/gallery-api.ts` | Add JSON response validation, add `deleteImage` and `deleteAlbum` API functions |
| `src/components/gallery/AdminLogin.tsx` | Simplify login, validate password client-side as fallback |
| `src/components/gallery/AdminPanel.tsx` | Complete rewrite with drag-and-drop upload zone, folder selector, file management |
| `src/components/gallery/GalleryView.tsx` | Add visible admin button, improve error state for non-PHP environments |

## Technical details

- Drag-and-drop uses native HTML5 `onDragOver`/`onDrop` events (no extra dependencies needed)
- Password `Godzilla_12` is checked client-side for UI access, and also sent as `X-Admin-Token` header for server-side validation
- The `fetchAlbums`/`fetchImages` functions will wrap responses in a try/catch that checks `content-type` for `application/json` before parsing
- Admin panel will use existing shadcn components (Button, Input, Dialog, Select) for consistency

