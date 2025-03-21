DROP TABLE IF EXISTS process_instances;

CREATE TABLE process_instances (
    id VARCHAR(50) PRIMARY KEY,
    doc JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: A trigger to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_process_instances_updated_at
BEFORE UPDATE ON process_instances
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
