import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage/upload-service";
import { uploadRequestSchema } from "@/lib/validations/upload";

type UploadResponse = {
  key: string;
  url: string;
  size: number;
  mimeType: string;
};

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse | { message: string }>> {
  try {
    const formData = await request.formData();
    const fileValue = formData.get("file");
    const folderValue = formData.get("folder");

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ message: "File wajib diisi." }, { status: 400 });
    }

    const parsedFolder = uploadRequestSchema.safeParse({
      folder: typeof folderValue === "string" ? folderValue : "uploads",
    });

    if (!parsedFolder.success) {
      return NextResponse.json({ message: "Folder upload tidak valid." }, { status: 400 });
    }

    const arrayBuffer = await fileValue.arrayBuffer();
    const result = await uploadFile({
      fileName: fileValue.name,
      mimeType: fileValue.type,
      bytes: new Uint8Array(arrayBuffer),
      folder: parsedFolder.data.folder,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload gagal.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
