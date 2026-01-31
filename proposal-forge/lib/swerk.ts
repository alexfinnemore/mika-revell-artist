const SWERK_BASE_URL = "https://swerk.goosegroup.co";

export interface SwerkTag {
  id: string;
  name: string;
  color?: string;
  customerId: string;
}

export interface SwerkAsset {
  id: string;
  title: string;
  originalFilename: string | null;
  mimeType: string | null;
  fileSize: number | null;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  body?: string;
  storageUrl?: string | null;
  type: string;
  tags?: SwerkTag[];
}

export interface UploadAssetOptions {
  title: string;
  body?: string;
  tags?: string[];
}

interface AssetsResponse {
  assets: SwerkAsset[];
}

export interface SwerkEntity {
  id: string;
  name: string;
  entityType: string;
  metadata?: Record<string, unknown>;
  customerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwerkChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SwerkChatRequest {
  customerId: string;
  messages: SwerkChatMessage[];
  stream?: boolean;
}

class SwerkClient {
  private apiKey: string;
  private customerId: string;
  private agentId: string;

  constructor() {
    this.apiKey = process.env.SWERK_API_KEY || "";
    this.customerId = process.env.SWERK_CUSTOMER_ID || "";
    this.agentId = process.env.SWERK_AGENT_ID || "";
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${SWERK_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SWERK API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async listAssets(): Promise<SwerkAsset[]> {
    const response = await this.fetch<AssetsResponse>(
      `/api/assets?customerId=${this.customerId}`
    );
    return response.assets || [];
  }

  async getAsset(assetId: string): Promise<SwerkAsset> {
    return this.fetch<SwerkAsset>(`/api/assets/${assetId}`);
  }

  async getAssetContent(assetId: string): Promise<string> {
    const response = await fetch(
      `${SWERK_BASE_URL}/api/assets/${assetId}/content`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch asset content: ${response.status}`);
    }

    return response.text();
  }

  async listEntities(): Promise<SwerkEntity[]> {
    return this.fetch<SwerkEntity[]>(
      `/api/entities?customerId=${this.customerId}`
    );
  }

  async chat(messages: SwerkChatMessage[]): Promise<Response> {
    // SWERK API expects 'message' (singular) with the latest user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop();

    const response = await fetch(`${SWERK_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerId: this.customerId,
        agentId: this.agentId,
        message: lastUserMessage?.content || "",
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`SWERK chat error: ${response.status}`);
    }

    return response;
  }

  async searchAssets(query: string): Promise<SwerkAsset[]> {
    const assets = await this.listAssets();
    const lowerQuery = query.toLowerCase();

    return assets.filter(
      (asset) =>
        asset.title?.toLowerCase().includes(lowerQuery) ||
        asset.originalFilename?.toLowerCase().includes(lowerQuery)
    );
  }

  async uploadAsset(
    file: Blob,
    options: UploadAssetOptions
  ): Promise<SwerkAsset> {
    const formData = new FormData();
    formData.append("file", file, options.title);
    formData.append("customerId", this.customerId);
    formData.append("title", options.title);

    if (options.body) {
      formData.append("body", options.body);
    }

    const response = await fetch(`${SWERK_BASE_URL}/api/assets/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SWERK upload error: ${response.status} - ${error}`);
    }

    const asset = await response.json();

    // If tags provided, assign them after upload
    if (options.tags && options.tags.length > 0) {
      await this.assignTagsByName(asset.id, options.tags);
    }

    return asset;
  }

  async listTags(): Promise<SwerkTag[]> {
    return this.fetch<SwerkTag[]>(`/api/tags?customerId=${this.customerId}`);
  }

  async createTag(name: string, color?: string): Promise<SwerkTag> {
    return this.fetch<SwerkTag>("/api/tags", {
      method: "POST",
      body: JSON.stringify({
        customerId: this.customerId,
        name,
        color,
      }),
    });
  }

  async getAssetTags(assetId: string): Promise<SwerkTag[]> {
    return this.fetch<SwerkTag[]>(`/api/assets/${assetId}/tags`);
  }

  async assignTagsByName(assetId: string, tagNames: string[]): Promise<void> {
    await this.fetch(`/api/assets/${assetId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tagNames }),
    });
  }

  async assignTagsById(assetId: string, tagIds: string[]): Promise<void> {
    await this.fetch(`/api/assets/${assetId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tagIds }),
    });
  }

  async removeTagsFromAsset(assetId: string, tagIds: string[]): Promise<void> {
    await this.fetch(`/api/assets/${assetId}/tags`, {
      method: "DELETE",
      body: JSON.stringify({ tagIds }),
    });
  }

  async updateAssetTags(assetId: string, tagNames: string[]): Promise<SwerkAsset> {
    // Get current tags
    const currentTags = await this.getAssetTags(assetId);

    // Remove all current tags
    if (currentTags.length > 0) {
      await this.removeTagsFromAsset(
        assetId,
        currentTags.map((t) => t.id)
      );
    }

    // Assign new tags
    if (tagNames.length > 0) {
      await this.assignTagsByName(assetId, tagNames);
    }

    // Return updated asset
    return this.getAsset(assetId);
  }
}

export const swerk = new SwerkClient();
