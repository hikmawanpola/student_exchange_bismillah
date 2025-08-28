-- Update seed data for Telkom University Student Exchange programs
-- Adding Telkom University specific exchange programs

-- Clear existing data and add Telkom University exchange programs
DELETE FROM programs WHERE id IN ('prog_1', 'prog_2', 'prog_3');

INSERT INTO programs (id, name, description, is_active, created_at, updated_at) VALUES
('prog_tel_1', 'Exchange Program - Asia Pacific', 'Program pertukaran mahasiswa dengan universitas partner di kawasan Asia Pasifik termasuk Jepang, Korea Selatan, dan Singapura', true, now(), now()),
('prog_tel_2', 'Exchange Program - Europe', 'Program pertukaran mahasiswa dengan universitas partner di Eropa termasuk Jerman, Belanda, dan Prancis', true, now(), now()),
('prog_tel_3', 'Exchange Program - North America', 'Program pertukaran mahasiswa dengan universitas partner di Amerika Utara termasuk Amerika Serikat dan Kanada', true, now(), now()),
('prog_tel_4', 'Double Degree Program', 'Program gelar ganda dengan universitas partner internasional pilihan', true, now(), now()),
('prog_tel_5', 'Summer Exchange Program', 'Program pertukaran mahasiswa jangka pendek selama musim panas (3-4 bulan)', true, now(), now());

-- Update landing content for Telkom University
UPDATE landing_content SET 
  title = 'Sistem Manajemen Student Exchange Telkom University',
  content = 'Platform terpadu untuk mengelola program pertukaran mahasiswa internasional Telkom University dengan universitas partner terbaik di dunia'
WHERE section_key = 'hero';

UPDATE landing_content SET 
  title = 'Tentang Student Exchange Telkom University',
  content = 'Telkom University berkomitmen memberikan pengalaman pendidikan internasional terbaik melalui program pertukaran mahasiswa dengan universitas partner terkemuka di seluruh dunia. Sistem ini memfasilitasi proses aplikasi, seleksi, dan monitoring yang transparan dan efisien.'
WHERE section_key = 'about';

UPDATE landing_content SET 
  title = 'Fitur Unggulan Sistem Exchange',
  content = 'Sistem yang dirancang khusus untuk memudahkan mahasiswa Telkom University dalam mengakses program pertukaran internasional dengan berbagai fitur canggih dan user-friendly'
WHERE section_key = 'features';

-- Update steps for exchange process
DELETE FROM steps WHERE program_id IN ('prog_1', 'prog_2', 'prog_3');

-- Add exchange-specific steps for all programs
INSERT INTO steps (id, program_id, name, description, step_order, step_type, form_fields, is_active, created_at, updated_at) VALUES
-- Steps for Asia Pacific Exchange
('step_tel_1_1', 'prog_tel_1', 'Pendaftaran Awal', 'Mengisi formulir pendaftaran dan upload dokumen dasar', 1, 'form', '{"fields": [{"name": "motivation_letter", "type": "textarea", "label": "Surat Motivasi", "required": true}, {"name": "transcript", "type": "file", "label": "Transkrip Nilai", "required": true}]}', true, now(), now()),
('step_tel_1_2', 'prog_tel_1', 'Tes Bahasa', 'Upload sertifikat kemampuan bahasa (TOEFL/IELTS)', 2, 'upload', '{"fields": [{"name": "language_cert", "type": "file", "label": "Sertifikat Bahasa", "required": true}]}', true, now(), now()),
('step_tel_1_3', 'prog_tel_1', 'Interview', 'Wawancara dengan tim seleksi', 3, 'review', '{}', true, now(), now()),
('step_tel_1_4', 'prog_tel_1', 'Approval Akhir', 'Persetujuan dari universitas partner', 4, 'approval', '{}', true, now(), now()),

-- Steps for Europe Exchange  
('step_tel_2_1', 'prog_tel_2', 'Pendaftaran Awal', 'Mengisi formulir pendaftaran dan upload dokumen dasar', 1, 'form', '{"fields": [{"name": "motivation_letter", "type": "textarea", "label": "Surat Motivasi", "required": true}, {"name": "transcript", "type": "file", "label": "Transkrip Nilai", "required": true}]}', true, now(), now()),
('step_tel_2_2', 'prog_tel_2', 'Tes Bahasa', 'Upload sertifikat kemampuan bahasa (TOEFL/IELTS)', 2, 'upload', '{"fields": [{"name": "language_cert", "type": "file", "label": "Sertifikat Bahasa", "required": true}]}', true, now(), now()),
('step_tel_2_3', 'prog_tel_2', 'Interview', 'Wawancara dengan tim seleksi', 3, 'review', '{}', true, now(), now()),
('step_tel_2_4', 'prog_tel_2', 'Approval Akhir', 'Persetujuan dari universitas partner', 4, 'approval', '{}', true, now(), now());
