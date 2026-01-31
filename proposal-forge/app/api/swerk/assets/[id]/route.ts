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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await swerk.deleteAsset(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete asset:", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
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
    const body = await request.json();

    // Handle addTags/removeTags for incremental updates
    if (body.addTags) {
      await swerk.assignTagsByName(id, body.addTags);
    }
    if (body.removeTags) {
      const currentTags = await swerk.getAssetTags(id);
      const tagIdsToRemove = currentTags
        .filter((t) => body.removeTags.includes(t.name))
        .map((t) => t.id);
      if (tagIdsToRemove.length > 0) {
        await swerk.removeTagsFromAsset(id, tagIdsToRemove);
      }
    }

    // Handle full tags replacement
    if (body.tags && Array.isArray(body.tags)) {
      await swerk.updateAssetTags(id, body.tags);
    }

    const asset = await swerk.getAsset(id);
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Failed to update asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}
