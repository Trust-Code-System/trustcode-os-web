CREATE TABLE IF NOT EXISTS trustcode_workspace_subscriptions (
  workspace_id text PRIMARY KEY,
  revision integer NOT NULL CHECK (revision >= 0),
  subscriptions jsonb NOT NULL CHECK (jsonb_typeof(subscriptions) = 'array'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
