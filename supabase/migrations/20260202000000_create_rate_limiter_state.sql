-- Migration: Create rate_limiter_state table
-- Purpose: Shared rate limiter state for serverless environment
-- Date: 2026-02-02

-- Create rate limiter state table
CREATE TABLE IF NOT EXISTS rate_limiter_state (
  service TEXT PRIMARY KEY,
  last_request_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE rate_limiter_state IS 'Shared rate limiter state for serverless environment';
COMMENT ON COLUMN rate_limiter_state.service IS 'Service name (e.g., nominatim)';
COMMENT ON COLUMN rate_limiter_state.last_request_at IS 'Timestamp of last successful request';
COMMENT ON COLUMN rate_limiter_state.updated_at IS 'Last update timestamp';

-- Insert initial state for Nominatim (allow immediate first request)
INSERT INTO rate_limiter_state (service, last_request_at)
VALUES ('nominatim', NOW() - INTERVAL '2 seconds')
ON CONFLICT (service) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rate_limiter_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_rate_limiter_state_updated_at ON rate_limiter_state;
CREATE TRIGGER trigger_rate_limiter_state_updated_at
  BEFORE UPDATE ON rate_limiter_state
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limiter_state_updated_at();

-- Create function to check rate limit with row locking
-- Returns true if request is allowed, false otherwise
CREATE OR REPLACE FUNCTION check_rate_limit(p_service TEXT, p_min_interval_ms INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_last_request_at TIMESTAMPTZ;
  v_elapsed_ms INTEGER;
BEGIN
  -- Select with row lock to prevent concurrent access
  SELECT last_request_at INTO v_last_request_at
  FROM rate_limiter_state
  WHERE service = p_service
  FOR UPDATE;

  -- If no record exists, allow the request
  IF v_last_request_at IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Calculate elapsed time in milliseconds
  v_elapsed_ms := EXTRACT(EPOCH FROM (NOW() - v_last_request_at)) * 1000;

  -- Return true if enough time has passed
  RETURN v_elapsed_ms >= p_min_interval_ms;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, INTEGER) TO anon;

-- No RLS needed (internal system table)
-- The table is only accessed by server-side code
