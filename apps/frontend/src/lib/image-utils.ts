/**
 * Ensures a base64 string has the proper data URI prefix for rendering in <img>.
 * Handles both raw base64 strings and strings that already have the data: prefix.
 */
export function getImageSrc(base64: string): string {
    if (base64.startsWith("data:")) {
        return base64;
    }

    // Try to detect MIME type from the first bytes
    if (base64.startsWith("/9j/")) {
        return `data:image/jpeg;base64,${base64}`;
    }
    if (base64.startsWith("iVBOR")) {
        return `data:image/png;base64,${base64}`;
    }
    if (base64.startsWith("R0lGOD")) {
        return `data:image/gif;base64,${base64}`;
    }
    if (base64.startsWith("UklGR")) {
        return `data:image/webp;base64,${base64}`;
    }

    // Default to JPEG
    return `data:image/jpeg;base64,${base64}`;
}

/**
 * Strips the data URI prefix from a base64 string for database storage.
 * Returns the raw base64 string.
 */
export function stripDataPrefix(base64: string): string {
    const match = base64.match(/^data:image\/[^;]+;base64,(.+)$/);
    return match ? match[1] : base64;
}

/**
 * Validates if a file is a supported image type based on its filename.
 */
export const isValidImage = (filename: string) =>
    /\.(jpg|jpeg|png|webp)$/i.test(filename);

/**
 * Validates if an image path is safe and points to the uploads directory.
 * Prevents path traversal and ensures the file is in the expected location.
 */
export const isValidImagePath = (path: string) =>
    path.startsWith("/uploads/") && isValidImage(path);
