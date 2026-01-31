import { NextRequest, NextResponse } from "next/server";
import { gemini, type GeminiModel } from "@/lib/gemini";
import { swerk } from "@/lib/swerk";

export async function POST(request: NextRequest) {
  try {
    const { prompt, model, aspectRatio, projectSlug, skipSave } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const result = await gemini.generateImage({
      prompt,
      model: model as GeminiModel,
      aspectRatio,
    });

    const imageUrl = `data:${result.mimeType};base64,${result.imageData}`;

    // Auto-save to SWERK unless explicitly skipped
    let assetId: string | undefined;
    if (!skipSave) {
      try {
        // Generate a filename from the prompt
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
        const slugifiedPrompt = prompt
          .slice(0, 50)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const title = `${slugifiedPrompt}-${timestamp}.png`;

        // Build tags
        const tags = ["generated-image", "draft"];
        if (projectSlug) {
          tags.push(projectSlug);
        }

        // Convert to blob and upload
        const binaryData = Buffer.from(result.imageData, "base64");
        const blob = new Blob([binaryData], { type: result.mimeType });

        const asset = await swerk.uploadAsset(blob, {
          title,
          body: prompt,
          tags,
        });

        assetId = asset.id;
      } catch (uploadError) {
        // Log but don't fail the request if SWERK upload fails
        console.error("SWERK upload failed (image still returned):", uploadError);
      }
    }

    return NextResponse.json({
      imageUrl,
      assetId,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
