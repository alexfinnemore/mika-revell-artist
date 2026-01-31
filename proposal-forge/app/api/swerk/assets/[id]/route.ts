import { NextRequest, NextResponse } from "next/server";
import { swerk } from "@/lib/swerk";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await swerk.getAsset(id);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Failed to fetch asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { tags } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: "tags array is required" },
        { status: 400 }
      );
    }

    const asset = await swerk.updateAssetTags(id, tags);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Failed to update asset tags:", error);
    return NextResponse.json(
      { error: "Failed to update asset tags" },
      { status: 500 }
    );
  }
}
