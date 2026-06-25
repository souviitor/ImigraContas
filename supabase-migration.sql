-- =============================================
-- SCHEMA: Sistema de Controle de Gastos
-- Imigração Brasil → Espanha
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Tabela de perfis (estende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categorias de gastos
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Gastos
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  description TEXT NOT NULL,
  amount_brl NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_eur NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'BRL' CHECK (currency IN ('BRL', 'EUR')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  phase TEXT NOT NULL DEFAULT 'pre_viagem' CHECK (phase IN ('pre_viagem', 'viagem', 'chegada', 'pos_chegada')),
  is_for_dog BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Budget / Meta de gastos
CREATE TABLE IF NOT EXISTS budget (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_brl NUMERIC(12,2) DEFAULT 0,
  total_eur NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir budget inicial
INSERT INTO budget (total_brl, total_eur, notes) 
VALUES (0, 0, 'Orçamento total da imigração')
ON CONFLICT DO NOTHING;

-- =============================================
-- CATEGORIAS PRÉ-DEFINIDAS
-- =============================================
INSERT INTO categories (name, icon, color) VALUES
  ('Passagens', '✈️', '#3b82f6'),
  ('Hospedagem', '🏠', '#8b5cf6'),
  ('Alimentação', '🍽️', '#f59e0b'),
  ('Documentação', '📄', '#ef4444'),
  ('Pet (Cachorro)', '🐕', '#10b981'),
  ('Saúde', '💊', '#ec4899'),
  ('Transporte', '🚗', '#6366f1'),
  ('Bagagem / Frete', '📦', '#f97316'),
  ('Roupas', '👕', '#14b8a6'),
  ('Eletrônicos', '💻', '#64748b'),
  ('Taxas Consulado', '🏛️', '#dc2626'),
  ('Cursos / Idiomas', '📚', '#7c3aed'),
  ('Seguro de Saúde', '🛡️', '#059669'),
  ('Moradia Espanha', '🏙️', '#0891b2'),
  ('Outros', '💰', '#94a3b8')
ON CONFLICT DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário vê próprio perfil, mas AMBOS os cônjuges podem ver todos os perfis
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Categories: todos veem, apenas autenticados podem ver
CREATE POLICY "categories_select" ON categories FOR SELECT TO authenticated USING (true);

-- Expenses: ambos os usuários autenticados veem TODOS os gastos (família compartilhada)
CREATE POLICY "expenses_select" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "expenses_update" ON expenses FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "expenses_delete" ON expenses FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Budget: todos veem e editam
CREATE POLICY "budget_select" ON budget FOR SELECT TO authenticated USING (true);
CREATE POLICY "budget_update" ON budget FOR UPDATE TO authenticated USING (true);

-- =============================================
-- REALTIME (habilitar para tabelas)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE budget;

-- =============================================
-- TRIGGER: auto-criar profile ao registrar
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_color)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN '#6366f1'
      ELSE '#f59e0b'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
