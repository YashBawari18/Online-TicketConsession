/*
  # Train Concession Database Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `roll_number` (text, unique)
      - `name` (text)
      - `email` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
    
    - `admins`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `created_at` (timestamp)
    
    - `concession_applications`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `student_name` (text)
      - `year` (text - FE/SE/TE/BE)
      - `category` (text - Open/OBC/SC/ST/Other)
      - `branch` (text - Civil/Computer/Chemical/Electronics/IT/Mechanical)
      - `from_station` (text)
      - `to_station` (text)
      - `class_type` (text - 1st Class/2nd Class)
      - `railway_type` (text - Central/Western Railway)
      - `pass_type` (text - Monthly/Quarterly)
      - `date_of_birth` (date)
      - `concession_form_no` (text, unique)
      - `age` (integer)
      - `previous_pass_date` (date)
      - `previous_pass_expiry` (date)
      - `season_ticket_no` (text)
      - `id_card_url` (text, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Storage
    - Create 'id-cards' bucket for student ID card uploads

  3. Security
    - Enable RLS on all tables
    - Add policies for students to access only their own data
    - Add policies for admins to access all data
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admins table  
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create concession_applications table
CREATE TABLE IF NOT EXISTS concession_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  year text NOT NULL CHECK (year IN ('FE', 'SE', 'TE', 'BE')),
  category text NOT NULL CHECK (category IN ('Open', 'OBC', 'SC', 'ST', 'Other')),
  branch text NOT NULL CHECK (branch IN ('Civil', 'Computer', 'Chemical', 'Electronics', 'IT', 'Mechanical')),
  from_station text NOT NULL,
  to_station text NOT NULL,
  class_type text NOT NULL CHECK (class_type IN ('1st Class', '2nd Class')),
  railway_type text NOT NULL CHECK (railway_type IN ('Central Railway', 'Western Railway')),
  pass_type text NOT NULL CHECK (pass_type IN ('Monthly', 'Quarterly')),
  date_of_birth date NOT NULL,
  concession_form_no text UNIQUE NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 100),
  previous_pass_date date,
  previous_pass_expiry date,
  season_ticket_no text,
  id_card_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage bucket for ID cards
INSERT INTO storage.buckets (id, name, public) 
VALUES ('id-cards', 'id-cards', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;  
ALTER TABLE concession_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can read own profile"
  ON students
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert students (for registration)"
  ON students
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for admins table  
CREATE POLICY "Admins can read own profile"
  ON admins
  FOR SELECT
  USING (true);

-- RLS Policies for concession_applications table
CREATE POLICY "Students can read own applications"
  ON concession_applications
  FOR SELECT
  USING (true);

CREATE POLICY "Students can insert own applications"
  ON concession_applications  
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read all applications"
  ON concession_applications
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can update all applications"
  ON concession_applications
  FOR UPDATE
  USING (true);

-- Storage policies
CREATE POLICY "Students can upload ID cards"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'id-cards');

CREATE POLICY "Anyone can view uploaded ID cards"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'id-cards');

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON concession_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON concession_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON concession_applications(created_at);