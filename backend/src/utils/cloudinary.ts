// Cloudinary SDK (Image aur files cloud par save karne ki service)
import { v2 as cloudinary } from 'cloudinary';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_SECRET);

// Agar server me Cloudinary ki keys daali gayi hain, toh use activate karna
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
  });
  console.log('cloudinary.ts: Cloudinary SDK configured successfully.');
} else {
  console.log('cloudinary.ts: Warning - Cloudinary environment variables are missing. File uploads will fallback to default placeholder avatars.');
}

// Ye function user ki profile picture (avatar) upload karne ka kaam karta hai
export async function uploadToCloudinary(base64Image: string, userName: string): Promise<string> {
  // Agar koi image upload nahi ki, toh uske naam ka pehla akshar dikhane wala avatar use hoga
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563eb&color=fff&size=200&bold=true`;

  if (!base64Image) {
    return defaultAvatar;
  }

  if (!isCloudinaryConfigured) {
    return defaultAvatar;
  }

  try {
    // base64Image can be in format: "data:image/png;base64,iVBORw0KGgoAAAANS..." or plain base64.
    // Cloudinary upload API accepts data URI format or base64.
    // Image cloud par 'employee_task_manager_avatars' folder me bhejna aur crop karna
    const uploadResponse = await cloudinary.uploader.upload(base64Image, {
      folder: 'employee_task_manager_avatars',
      transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
    });
    console.log('cloudinary.ts: Successfully uploaded avatar to Cloudinary:', uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('cloudinary.ts: Error uploading image to Cloudinary:', error);
    // Error aane par server crash hone se bachana aur wapas normal avatar de dena
    return defaultAvatar;
  }
}

// Ye function generic documents (PDFs, docs, images) upload karne ke liye hai
export async function uploadDocumentToCloudinary(base64Data: string): Promise<string> {
  if (!base64Data) return '';
  if (!isCloudinaryConfigured) return '';

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: 'employee_task_manager_documents',
      resource_type: 'auto', // Allows uploading PDFs, Word docs, images, etc.
    });
    console.log('cloudinary.ts: Successfully uploaded document to Cloudinary:', uploadResponse.secure_url);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error('cloudinary.ts: Error uploading document to Cloudinary:', error);
    throw new Error('Failed to upload document');
  }
}
