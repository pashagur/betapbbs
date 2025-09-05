import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const AVATAR_DIR = path.join(process.cwd(), 'avatars');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Ensure avatar directory exists
export async function ensureAvatarDir(): Promise<void> {
  try {
    await fs.access(AVATAR_DIR);
  } catch {
    await fs.mkdir(AVATAR_DIR, { recursive: true });
  }
}

// Validate and download image from URL
export async function downloadAndProcessAvatar(imageUrl: string, userId: string): Promise<string> {
  try {
    // Validate URL format
    const url = new URL(imageUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    // Download image with size limit
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      maxContentLength: MAX_FILE_SIZE,
      timeout: 10000, // 10 seconds timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AvatarBot/1.0)'
      }
    });

    // Check content type
    const contentType = response.headers['content-type'];
    if (!contentType || !SUPPORTED_FORMATS.includes(contentType)) {
      throw new Error('Unsupported image format. Supported formats: JPEG, PNG, WebP, GIF');
    }

    // Ensure avatar directory exists
    await ensureAvatarDir();

    // Process image with sharp - resize and optimize
    const filename = `${userId}_${Date.now()}.webp`;
    const filepath = path.join(AVATAR_DIR, filename);

    await sharp(response.data)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    // Return the relative path to store in database
    return `/avatars/${filename}`;

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to download or process avatar: ${error.message}`);
    }
    throw new Error('Failed to download or process avatar: Unknown error');
  }
}

// Delete old avatar file
export async function deleteAvatarFile(avatarPath: string): Promise<void> {
  try {
    if (avatarPath && avatarPath.startsWith('/avatars/')) {
      const filename = path.basename(avatarPath);
      const filepath = path.join(AVATAR_DIR, filename);
      await fs.unlink(filepath);
    }
  } catch (error) {
    // Log error but don't throw - it's okay if old avatar file doesn't exist
    console.warn(`Failed to delete old avatar file: ${avatarPath}`, error);
  }
}