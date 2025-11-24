-- =====================================================
-- POLÍTICAS RLS PARA STORAGE BUCKETS
-- Ejecutar en: SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- BUCKET: project-documents
-- =====================================================

-- Política 1: SUPERADMIN puede ver documentos de proyectos
CREATE POLICY "SUPERADMIN can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 2: SUPERADMIN puede subir documentos de proyectos
CREATE POLICY "SUPERADMIN can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 3: SUPERADMIN puede actualizar documentos de proyectos
CREATE POLICY "SUPERADMIN can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 4: SUPERADMIN puede eliminar documentos de proyectos
CREATE POLICY "SUPERADMIN can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- =====================================================
-- BUCKET: reports
-- =====================================================

-- Política 1: SUPERADMIN puede ver reportes
CREATE POLICY "SUPERADMIN can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 2: SUPERADMIN puede subir reportes
CREATE POLICY "SUPERADMIN can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 3: SUPERADMIN puede eliminar reportes
CREATE POLICY "SUPERADMIN can delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE "userId" = auth.uid()::text) = 'SUPERADMIN'
);

-- Política 4: Público puede ver reportes certificados
CREATE POLICY "Public can view certified project reports"
ON storage.objects FOR SELECT
TO public, authenticated
USING (
  bucket_id = 'reports' AND
  name LIKE 'certified/%'
);

-- =====================================================
-- FIN
-- =====================================================
