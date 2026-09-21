/* ==========================================================================
   CONEXÃO COM O SUPABASE

   Pegue os dois valores em: Supabase > Project Settings > API
     url      = "Project URL"
     anonKey  = chave "anon public"

   A chave anônima é pública de propósito — ela vai no JavaScript do site.
   Quem protege os dados é o RLS configurado em supabase/schema.sql:
   qualquer visitante lê o estoque, só quem tem login altera.
   NUNCA coloque aqui a chave "service_role".

   Enquanto estiver em branco, o site usa os veículos de assets/js/dados.js.
   ========================================================================== */
window.SUPABASE = {
  url: "https://efyxgdfhabshifhvshxe.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmeXhnZGZoYWJzaGlmaHZzaHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5OTc0MjYsImV4cCI6MjEwNTU3MzQyNn0.BzRSbgfTi1yui9kFaVvodj2G1P620pWeO_4yawp37TI",
};
