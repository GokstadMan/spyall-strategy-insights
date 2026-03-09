CREATE TABLE public.user_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  stripe_session_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
ON public.user_purchases
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases"
ON public.user_purchases
FOR INSERT
TO service_role
WITH CHECK (true);