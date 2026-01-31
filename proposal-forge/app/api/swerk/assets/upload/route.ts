import { NextRequest, NextResponse } from "next/server";
import { swerk } from "@/lib/swerk";

export async function POST(request: NextRequest) {
  try {
    const { imageData, title, prompt, tags } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: "imageData is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // Convert base64 data URI to Blob
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Buffer.from(base64Data, "base64");
    const mimeType = imageData.match(/^data:(image\/\w+);base64,/)?.[1] || "image/png";
    const blob = new Blob([binaryData], { type: mimeType });

    // Upload to SWERK
    const asset = await swerk.uploadAsset(blob, {
      title,
      body: prompt,
      tags: tags || [],
    });

    return NextResponse.json({
      assetId: asset.id,
      asset,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
