"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SwerkAsset } from "@/lib/swerk";

type Model = "gemini-2.5-flash-image" | "imagen-4.0-fast-generate-001";
type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

interface LocalImage {
  id: string;
  prompt: string;
  imageUrl: string;
  model: Model;
  timestamp: Date;
  assetId?: string;
}

const MODELS: { value: Model; label: string; description: string }[] = [
  {
    value: "gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash",
    description: "Fast multimodal image generation",
  },
  {
    value: "imagen-4.0-fast-generate-001",
    label: "Imagen 4 Fast",
    description: "High quality, photorealistic",
  },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "3:4", label: "Portrait (3:4)" },
];

const PROMPT_SUGGESTIONS = [
  "A rope sculpture suspended between ancient cedar trees in a misty Japanese forest, morning light filtering through",
  "Rammed earth wall with integrated dichroic glass panels, catching rainbow light at sunset",
  "Biomimetic installation inspired by nacre structure, iridescent layers in natural light",
  "Large-scale woven fiber sculpture in a traditional Japanese garden setting",
];

const PROJECT_TAG = "kair-2026";

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<Model>("gemini-2.5-flash-image");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Local images from current session (before SWERK sync)
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);

  // SWERK-persisted images
  const [swerkImages, setSwerkImages] = useState<SwerkAsset[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const promptRef = useRef<HTMLTextAreaElement>(null);

  // Load images from SWERK on mount
  useEffect(() => {
    loadSwerkImages();
  }, []);

  const loadSwerkImages = async () => {
    try {
      setIsLoadingImages(true);
      const response = await fetch(
        `/api/swerk/assets?tags=generated-image,${PROJECT_TAG}`
      );
      if (!response.ok) throw new Error("Failed to load images");
      const assets: SwerkAsset[] = await response.json();
      // Sort by createdAt descending
      assets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setSwerkImages(assets);
    } catch (err) {
      console.error("Failed to load SWERK images:", err);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio,
          projectSlug: PROJECT_TAG,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Generation failed");
      }

      const data = await response.json();

      const newImage: LocalImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl: data.imageUrl,
        model,
        timestamp: new Date(),
        assetId: data.assetId,
      };

      setLocalImages((prev) => [newImage, ...prev]);

      // Refresh SWERK images to get the new one with proper asset data
      if (data.assetId) {
        setTimeout(() => loadSwerkImages(), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  const copyPromptToClipboard = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setPrompt(text);
      promptRef.current?.scrollIntoView({ behavior: "smooth" });
      promptRef.current?.focus();
    },
    [setPrompt]
  );

  const toggleFavorite = async (asset: SwerkAsset) => {
    const isFavorited = asset.tags?.some((t) => t.name === "favorite");

    // Optimistic update
    setSwerkImages((prev) =>
      prev.map((img) => {
        if (img.id !== asset.id) return img;
        const newTags = isFavorited
          ? img.tags?.filter((t) => t.name !== "favorite")
          : [...(img.tags || []), { id: "temp", name: "favorite", customerId: img.customerId }];
        return { ...img, tags: newTags };
      })
    );

    try {
      await fetch(`/api/swerk/assets/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isFavorited ? { removeTags: ["favorite"] } : { addTags: ["favorite"] }
        ),
      });
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      // Revert on error
      loadSwerkImages();
    }
  };

  const deleteImage = async (assetId: string) => {
    if (!confirm("Delete this image?")) return;

    // Optimistic update
    setSwerkImages((prev) => prev.filter((img) => img.id !== assetId));
    setLocalImages((prev) => prev.filter((img) => img.assetId !== assetId));

    try {
      const response = await fetch(`/api/swerk/assets/${assetId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete image:", err);
      // Revert on error
      loadSwerkImages();
    }
  };

  // Merge local images (that don't have assetId yet synced) with SWERK images
  const displayImages = [
    ...localImages.filter(
      (local) => !swerkImages.some((swerk) => swerk.id === local.assetId)
    ),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Image Generator</h1>
        <p className="text-gray-400 mt-1">
          Generate concept images for proposals
        </p>
      </div>

      {/* Generator form */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prompt
            </label>
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent resize-none"
            />
          </div>

          {/* Prompt suggestions */}
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="text-xs px-3 py-1.5 bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition truncate max-w-[200px]"
                title={suggestion}
              >
                {suggestion.slice(0, 40)}...
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as Model)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                {MODELS.find((m) => m.value === model)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                {ASPECT_RATIOS.map((ar) => (
                  <option key={ar.value} value={ar.value}>
                    {ar.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-900 disabled:text-gray-500 font-medium rounded-lg transition"
          >
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>

          <p className="text-gray-500 text-xs text-center">
            Press Cmd/Ctrl + Enter to generate
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isGenerating && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 mb-8 text-center">
          <div className="inline-block w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Generating your image...</p>
        </div>
      )}

      {/* Image Gallery */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Generated Images</h2>
          {isLoadingImages && (
            <span className="text-gray-500 text-sm">Loading...</span>
          )}
        </div>

        {!isLoadingImages &&
          displayImages.length === 0 &&
          swerkImages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No images yet. Generate your first image above.
            </div>
          )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Local images (newly generated, not yet in SWERK) */}
          {displayImages.map((image) => (
            <ImageCard
              key={image.id}
              imageUrl={image.imageUrl}
              prompt={image.prompt}
              isFavorited={false}
              onCopyPrompt={() => copyPromptToClipboard(image.prompt)}
              onToggleFavorite={undefined}
              onDelete={
                image.assetId ? () => deleteImage(image.assetId!) : undefined
              }
            />
          ))}

          {/* SWERK images */}
          {swerkImages.map((asset) => (
            <ImageCard
              key={asset.id}
              imageUrl={asset.storageUrl || ""}
              prompt={asset.body || asset.title}
              isFavorited={asset.tags?.some((t) => t.name === "favorite")}
              onCopyPrompt={() =>
                copyPromptToClipboard(asset.body || asset.title)
              }
              onToggleFavorite={() => toggleFavorite(asset)}
              onDelete={() => deleteImage(asset.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ImageCardProps {
  imageUrl: string;
  prompt: string;
  isFavorited?: boolean;
  onCopyPrompt: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

function ImageCard({
  imageUrl,
  prompt,
  isFavorited,
  onCopyPrompt,
  onToggleFavorite,
  onDelete,
}: ImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative aspect-square bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={prompt}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity duration-200 flex flex-col justify-between p-3 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Prompt text */}
        <p className="text-gray-300 text-xs line-clamp-4">{prompt}</p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          {/* Copy prompt */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopyPrompt();
            }}
            className="p-1.5 hover:bg-white/10 rounded transition"
            title="Copy prompt"
          >
            <CopyIcon className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>

          {/* Favorite */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="p-1.5 hover:bg-white/10 rounded transition"
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <StarIcon
                className={`w-4 h-4 ${
                  isFavorited ? "text-white fill-white" : "text-gray-400 hover:text-white"
                }`}
                filled={isFavorited}
              />
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 hover:bg-white/10 rounded transition"
              title="Delete image"
            >
              <TrashIcon className="w-4 h-4 text-gray-400 hover:text-red-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
      />
    </svg>
  );
}

function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}
