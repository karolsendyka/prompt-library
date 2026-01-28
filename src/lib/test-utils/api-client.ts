import type { CreatePromptCommand, CreatedPromptDto, PromptListDTO, PaginationDTO } from "../../types";

export interface ListPromptsQuery {
  search?: string;
  tag?: string;
  authorId?: string;
  sortBy?: "created_at" | "updated_at" | "vote_score";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface ListPromptsResponse {
  data: PromptListDTO[];
  pagination: PaginationDTO;
}

/**
 * API client for making REST API calls in tests.
 * Encapsulates all HTTP requests to avoid direct database manipulation.
 */
export class TestApiClient {
  private baseUrl: string;
  private supabase: any; // Supabase client for creating APIContext

  constructor(baseUrl: string, supabase: any) {
    this.baseUrl = baseUrl;
    this.supabase = supabase;
  }

  /**
   * Creates a new prompt via POST /api/prompts
   */
  async createPrompt(data: CreatePromptCommand): Promise<CreatedPromptDto> {
    const response = await this.makeRequest("/api/prompts", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Failed to create prompt: ${response.status} ${JSON.stringify(errorBody)}`);
    }

    return response.json();
  }

  /**
   * Lists prompts via GET /api/prompts
   */
  async listPrompts(query?: ListPromptsQuery): Promise<ListPromptsResponse> {
    const queryString = query
      ? "?" +
        Object.entries(query)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
          .join("&")
      : "";

    const response = await this.makeRequest(`/api/prompts${queryString}`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(`Failed to list prompts: ${response.status} ${JSON.stringify(errorBody)}`);
    }

    return response.json();
  }

  /**
   * Internal method to make HTTP requests using the API handlers directly
   * This avoids needing a running server and uses the handlers directly
   */
  private async makeRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const url = new URL(path, this.baseUrl);
    const request = new Request(url.toString(), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Import handlers dynamically to avoid circular dependencies
    const { GET, POST } = await import("../../pages/api/prompts");
    
    const method = options.method || "GET";
    const handler = method === "POST" ? POST : GET;

    const context = {
      request,
      locals: { supabase: this.supabase },
      params: {},
      props: {},
      site: undefined,
      generator: "test",
      url,
      redirect: () => new Response(),
      cookies: {} as any,
    };

    return handler(context);
  }
}

