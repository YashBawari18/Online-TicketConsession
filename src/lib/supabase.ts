import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          roll_number: string;
          name: string;
          email: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          roll_number: string;
          name: string;
          email: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          roll_number?: string;
          name?: string;
          email?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
        };
      };
      concession_applications: {
        Row: {
          id: string;
          student_id: string;
          student_name: string;
          year: string;
          category: string;
          branch: string;
          from_station: string;
          to_station: string;
          class_type: string;
          railway_type: string;
          pass_type: string;
          date_of_birth: string;
          concession_form_no: string;
          age: number;
          previous_pass_date: string;
          previous_pass_expiry: string;
          season_ticket_no: string;
          id_card_url: string | null;
          aadhar_url: string | null;
          fee_receipt_url: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          student_name: string;
          year: string;
          category: string;
          branch: string;
          from_station: string;
          to_station: string;
          class_type: string;
          railway_type: string;
          pass_type: string;
          date_of_birth: string;
          concession_form_no: string;
          age: number;
          previous_pass_date: string;
          previous_pass_expiry: string;
          season_ticket_no: string;
          id_card_url?: string | null;
          aadhar_url?: string | null;
          fee_receipt_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          student_name?: string;
          year?: string;
          category?: string;
          branch?: string;
          from_station?: string;
          to_station?: string;
          class_type?: string;
          railway_type?: string;
          pass_type?: string;
          date_of_birth?: string;
          concession_form_no?: string;
          age?: number;
          previous_pass_date?: string;
          previous_pass_expiry?: string;
          season_ticket_no?: string;
          id_card_url?: string | null;
          aadhar_url?: string | null;
          fee_receipt_url?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};