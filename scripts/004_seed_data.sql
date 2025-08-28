-- Insert default landing page content
INSERT INTO public.landing_content (section_key, title, content, is_active) VALUES
('hero', 'Sistem Manajemen Pengakuan', 'Platform terpadu untuk mengelola proses pengakuan dan sertifikasi program studi', true),
('about', 'Tentang Sistem', 'Sistem ini memungkinkan pengelolaan yang efisien untuk proses pengakuan dengan berbagai peran pengguna', true),
('features', 'Fitur Utama', 'Multi-role management, Dynamic step configuration, Real-time progress tracking', true);

-- Insert default steps for recognition process
INSERT INTO public.steps (name, description, step_type, order_index, form_fields, is_active) VALUES
('Pendaftaran Awal', 'Mengisi formulir pendaftaran awal', 'form', 1, '{"fields": [{"name": "institution_name", "type": "text", "required": true}, {"name": "contact_person", "type": "text", "required": true}]}', true),
('Upload Dokumen', 'Mengunggah dokumen pendukung', 'upload', 2, '{"fields": [{"name": "accreditation_docs", "type": "file", "required": true}, {"name": "curriculum_docs", "type": "file", "required": true}]}', true),
('Review Dokumen', 'Proses review oleh admin', 'review', 3, '{"fields": [{"name": "review_notes", "type": "textarea", "required": false}]}', true),
('Persetujuan Final', 'Persetujuan akhir dari super admin', 'approval', 4, '{"fields": [{"name": "approval_status", "type": "select", "options": ["approved", "rejected"], "required": true}]}', true);

-- Insert sample programs
INSERT INTO public.programs (name, description, is_active) VALUES
('Teknik Informatika', 'Program Studi Teknik Informatika', true),
('Sistem Informasi', 'Program Studi Sistem Informasi', true),
('Teknik Komputer', 'Program Studi Teknik Komputer', true);
