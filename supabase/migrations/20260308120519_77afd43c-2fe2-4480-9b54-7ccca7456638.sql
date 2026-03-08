
-- Create report_shares table
CREATE TABLE public.report_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid NOT NULL,
  shared_with_email text NOT NULL,
  shared_with_user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage shares for their reports
CREATE POLICY "Report owners can manage shares"
  ON public.report_shares
  FOR ALL
  TO authenticated
  USING (shared_by = auth.uid())
  WITH CHECK (shared_by = auth.uid());

-- Shared users can view their shares
CREATE POLICY "Shared users can view their shares"
  ON public.report_shares
  FOR SELECT
  TO authenticated
  USING (shared_with_user_id = auth.uid());

-- Allow shared users to SELECT reports shared with them
CREATE POLICY "Users can view shared reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.report_shares
      WHERE report_shares.report_id = reports.id
      AND report_shares.shared_with_user_id = auth.uid()
    )
  );
