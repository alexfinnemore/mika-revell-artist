import { NextRequest, NextResponse } from "next/server";
import { swerk } from "@/lib/swerk";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagsParam = searchParams.get("tags");

    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined;

    const assets = await swerk.listAssets({ tags });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}
