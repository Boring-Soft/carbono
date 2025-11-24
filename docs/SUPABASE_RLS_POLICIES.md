# Políticas RLS para Supabase Storage

## Instrucciones

Estas políticas deben aplicarse en el dashboard de Supabase:

1. Ve a: https://supabase.com/dashboard/project/yewmmqabcnqcjmgrxypb/storage/policies
2. Para cada bucket (`project-documents` y `reports`), aplica las políticas correspondientes

---

## Bucket: `project-documents`

### Política 1: SUPERADMIN - Full Access (SELECT)

```sql
-- Nombre: SUPERADMIN can view project documents
-- Operación: SELECT
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 2: SUPERADMIN - Full Access (INSERT)

```sql
-- Nombre: SUPERADMIN can upload project documents
-- Operación: INSERT
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 3: SUPERADMIN - Full Access (UPDATE)

```sql
-- Nombre: SUPERADMIN can update project documents
-- Operación: UPDATE
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 4: SUPERADMIN - Full Access (DELETE)

```sql
-- Nombre: SUPERADMIN can delete project documents
-- Operación: DELETE
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

---

## Bucket: `reports`

### Política 1: SUPERADMIN - Full Access (SELECT)

```sql
-- Nombre: SUPERADMIN can view reports
-- Operación: SELECT
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 2: SUPERADMIN - Full Access (INSERT)

```sql
-- Nombre: SUPERADMIN can upload reports
-- Operación: INSERT
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 3: SUPERADMIN - Full Access (DELETE)

```sql
-- Nombre: SUPERADMIN can delete reports
-- Operación: DELETE
-- Target roles: authenticated

CREATE POLICY "SUPERADMIN can delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (
    SELECT role FROM profiles WHERE user_id = auth.uid()
  ) = 'SUPERADMIN'
);
```

### Política 4: Public Read for Certified Projects Reports

```sql
-- Nombre: Public can view certified project reports
-- Operación: SELECT
-- Target roles: public, authenticated

CREATE POLICY "Public can view certified project reports"
ON storage.objects FOR SELECT
TO public, authenticated
USING (
  bucket_id = 'reports' AND
  name LIKE 'certified/%'
);
```

---

## Verificación

Después de aplicar las políticas, verifica que:

1. ✅ Los buckets tienen RLS habilitado (toggle "Restrict access to bucket based on Row Level Security policies")
2. ✅ Aparecen todas las políticas en la lista
3. ✅ No hay errores de sintaxis SQL

## Estructura de archivos recomendada en Storage

### `project-documents/`
```
project-documents/
  └── {projectId}/
      ├── {documentId}.pdf
      ├── {documentId}.jpg
      └── ...
```

### `reports/`
```
reports/
  ├── certified/              # Reportes públicos de proyectos certificados
  │   ├── 2024-01-national.pdf
  │   └── project-{id}.pdf
  └── internal/               # Reportes internos (solo SUPERADMIN)
      ├── 2024-01-monthly.pdf
      └── department-{name}.pdf
```

---

## Alternativa: Aplicar vía SQL Editor

Si prefieres aplicar todas las políticas de una vez, ve al **SQL Editor** en Supabase y ejecuta este script completo:

```sql
-- =====================================================
-- POLÍTICAS PARA project-documents
-- =====================================================

CREATE POLICY "SUPERADMIN can view project documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "SUPERADMIN can upload project documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "SUPERADMIN can update project documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "SUPERADMIN can delete project documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-documents' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

-- =====================================================
-- POLÍTICAS PARA reports
-- =====================================================

CREATE POLICY "SUPERADMIN can view reports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "SUPERADMIN can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "SUPERADMIN can delete reports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'reports' AND
  (SELECT role FROM profiles WHERE user_id = auth.uid()) = 'SUPERADMIN'
);

CREATE POLICY "Public can view certified project reports"
ON storage.objects FOR SELECT
TO public, authenticated
USING (
  bucket_id = 'reports' AND
  name LIKE 'certified/%'
);
```

**Nota:** Asegúrate de habilitar RLS en ambos buckets antes de ejecutar estas políticas.
