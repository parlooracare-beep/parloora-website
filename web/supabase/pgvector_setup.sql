-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to public.parlours table with 1536 dimensions (for OpenAI text-embedding-3-small or text-embedding-ada-002)
ALTER TABLE public.parlours ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create HNSW index for similarity searches using cosine distance
CREATE INDEX IF NOT EXISTS parlours_embedding_hnsw_idx 
ON public.parlours 
USING hnsw (embedding vector_cosine_ops);

-- Create RPC match function
CREATE OR REPLACE FUNCTION public.match_parlours (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  owner_id UUID,
  name TEXT,
  type TEXT,
  description TEXT,
  address TEXT,
  city TEXT,
  phone TEXT,
  website TEXT,
  image TEXT,
  rating DECIMAL(3,2),
  total_bookings INTEGER,
  featured BOOLEAN,
  is_active BOOLEAN,
  status TEXT,
  opening_hours JSONB,
  commission_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.owner_id,
    p.name,
    p.type,
    p.description,
    p.address,
    p.city,
    p.phone,
    p.website,
    p.image,
    p.rating,
    p.total_bookings,
    p.featured,
    p.is_active,
    p.status,
    p.opening_hours,
    p.commission_rate,
    p.created_at,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.parlours p
  WHERE p.is_active = true 
    AND p.status = 'approved'
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
