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