-- 2025-11-03: UAT prep migration
-- Adds RLS policies placeholders, a daily rollup function and cron job for staging UAT.

-- NOTE: This file is a safe UAT preparation script. It doesn't change core schema.

-- Example: enable RLS on table 'results' and allow only authenticated users to select
-- (Adjust table names/predicates to match production schema before applying to prod)
-- ALTER TABLE IF EXISTS public.results ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY uat_select_authenticated ON public.results
--   FOR SELECT USING (auth.role() IS NOT NULL);

-- Daily rollup function (placeholder)
CREATE OR REPLACE FUNCTION public.uat_daily_rollup()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Implement rollup logic here; e.g., aggregate counts per day into a summary table.
  RAISE NOTICE 'Running UAT daily rollup (placeholder)';
END;
$$;

-- Add cron job (pg_cron or supabase scheduled function) -- here shown as a SQL comment
-- If using supabase scheduled functions, create a scheduled trigger in the Supabase UI:
-- e.g. schedule public.uat_daily_rollup to run at '0 2 * * *' (daily 02:00 UTC)

-- Example policy to isolate partner data by org_id (placeholder):
-- CREATE POLICY partner_isolation ON public.results
--   FOR ALL USING (auth.role() = 'admin' OR auth.claims->>'org_id' = org_id::text);

-- End of UAT prep migration
