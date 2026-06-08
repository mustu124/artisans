import { assertAdmin, fail, ok } from "@/lib/api";
import { cloudinary } from "@/lib/cloudinary";

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
};

export async function POST(request: Request) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return fail("A file is required.", 400);
    }

    if (!allowedTypes.includes(file.type)) {
      return fail("Only jpg, png, webp, and mp4 files are supported.", 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resourceType = file.type.startsWith("video/") ? "video" : "image";

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: "artisan-root",
          resource_type: resourceType
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Upload failed."));
            return;
          }

          resolve(uploadResult as CloudinaryUploadResult);
        }
      );

      upload.end(buffer);
    });

    return ok(
      {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      },
      "File uploaded."
    );
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to upload file.");
  }
}
