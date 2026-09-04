/**
 * Embedding Utilities for AI Semantic Search in Parloora
 */

/**
 * Compiles a structured, searchable text block for a parlour, combining its core metadata.
 */
export function getParlourSearchText(parlour: {
  name: string;
  type?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
}): string {
  return [
    `Name: ${parlour.name}`,
    parlour.type ? `Type: ${parlour.type}` : null,
    parlour.description ? `Description: ${parlour.description}` : null,
    parlour.address ? `Address: ${parlour.address}` : null,
    parlour.city ? `City: ${parlour.city}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Generates a 1536-dimensional vector embedding for a given text.
 * Calls OpenAI's `text-embedding-3-small` API. Falls back to a deterministic 
 * mock embedding if the API key is not set, preventing crashes in development.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    console.warn(
      "⚠️ OpenAI API key is missing or is placeholder. Generating deterministic mock embedding of 1536 dimensions."
    );
    
    // Create a deterministic vector of 1536 dimensions based on the text.
    // This allows local search features to function deterministically even without an active key.
    const vector = Array.from({ length: 1536 }, (_, i) => {
      let hash = 0;
      const str = text + "_" + i;
      for (let j = 0; j < str.length; j++) {
        hash = (hash << 5) - hash + str.charCodeAt(j);
        hash |= 0; // Convert to 32bit integer
      }
      // Return a value between -1.0 and 1.0
      return Math.sin(hash);
    });

    // L2 normalize the mock vector so vector cosine distance works perfectly
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => (magnitude > 0 ? val / magnitude : 0));
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: status ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error("Invalid response format from OpenAI embeddings API");
    }

    return data.data[0].embedding;
  } catch (error) {
    console.error("❌ Error generating embedding from OpenAI:", error);
    throw error;
  }
}

/**
 * Helper to fetch a parlour, generate its embedding, and save it in the database.
 */
export async function updateParlourEmbedding(parlourId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()

    // Fetch the parlour to generate embedding from its metadata
    const { data: parlour, error: fetchError } = await supabase
      .from("parlours")
      .select("id, name, type, description, address, city")
      .eq("id", parlourId)
      .single()

    if (fetchError || !parlour) {
      return { success: false, error: fetchError?.message || "Parlour not found" }
    }

    // Generate the searchable text from the parlour metadata
    const searchText = getParlourSearchText(parlour)

    // Generate the vector embedding
    const embedding = await generateEmbedding(searchText)

    // Update the parlour's embedding column in Supabase
    const { error: updateError } = await (supabase
      .from("parlours")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ embedding } as any)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq("id", parlourId) as any)

    if (updateError) {
      console.error("Error updating parlour embedding:", updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error in updateParlourEmbedding:", error)
    return { success: false, error: error?.message || "Internal error" }
  }
}
