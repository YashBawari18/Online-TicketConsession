-- Migration script to add Aadhar and Fee Receipt document URL fields
-- Run this in your Supabase SQL editor

ALTER TABLE concession_applications 
ADD COLUMN aadhar_url TEXT,
ADD COLUMN fee_receipt_url TEXT;

-- Create the new storage buckets for Aadhar and Fee Receipt documents
-- (You'll need to create these manually in the Supabase dashboard under Storage > Buckets)
-- 1. Create bucket named: aadhar-cards
-- 2. Create bucket named: fee-receipts
-- 3. Set both buckets to be public with the same policies as id-cards bucket

-- Optional: Add comments to document the new columns
COMMENT ON COLUMN concession_applications.aadhar_url IS 'URL to uploaded Aadhar card document';
COMMENT ON COLUMN concession_applications.fee_receipt_url IS 'URL to uploaded fee receipt document';

-- ================================
-- Concession Expiry & Renewal Feature
-- ================================

-- Add validity fields
ALTER TABLE concession_applications
ADD COLUMN valid_from TIMESTAMP DEFAULT NOW(),
ADD COLUMN valid_until TIMESTAMP,
ADD COLUMN is_expired BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN concession_applications.valid_from IS 'Date when concession becomes valid';
COMMENT ON COLUMN concession_applications.valid_until IS 'Date when concession expires';
COMMENT ON COLUMN concession_applications.is_expired IS 'Flag for expired concession';

-- Function to expire concessions automatically
CREATE OR REPLACE FUNCTION expire_concessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE concession_applications
  SET is_expired = TRUE
  WHERE valid_until < NOW()
    AND is_expired = FALSE;
END;
$$;

-- Schedule the expiry function to run daily at midnight
SELECT cron.schedule(
  'concession-expiry',
  '0 0 * * *',
  $$CALL expire_concessions();$$
);
