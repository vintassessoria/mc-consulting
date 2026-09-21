-- ===========================================================================
-- MC CONSULTING — carga inicial do estoque (7 veiculos)
-- Cole no Supabase: SQL Editor > New query > Run.
-- Pode rodar de novo sem risco: veiculos ja existentes sao ignorados, entao
-- nada que voce editar no painel depois sera sobrescrito.
-- ===========================================================================

insert into public.veiculos
  (slug, marca, modelo, versao, ano_fab, ano_modelo, km, preco, preco_antigo,
   combustivel, cambio, carroceria, cor, cor_detalhe, cor_hex, cidade,
   opcionais, fotos, oferta, vendido, ordem)
values
  ('jaecoo-7-elite-1-6-turbo-aut-2027', 'JAECOO', '7', 'Elite 1.6 Turbo Aut.', 2026, 2027, 2870, 0, 0, 'GASOLINA', 'Automático', 'suv', 'PRETO', null, '#000000', 'Brasília (DF)', '{}', '{}', false, false, 70),
  ('toyota-etios-xs-1-5-hatch', 'TOYOTA', 'ETIOS', 'XS 1.5 Hatch', null, null, 104000, 0, 0, 'FLEX', 'Manual', 'hatch', 'BRANCO', 'Branco Pérola', '#ffffff', 'Brasília (DF)', '{}', '{}', false, false, 60),
  ('jeep-renegade-trailhawk-2-0-diesel-4x4-aut-2016', 'JEEP', 'RENEGADE', 'Trailhawk 2.0 Diesel 4x4 Aut.', 2015, 2016, 137000, 0, 0, 'DIESEL', 'Automático', 'suv', 'PRATA', null, '#cccccc', 'Brasília (DF)', ARRAY['4X4']::text[], '{}', false, false, 50),
  ('honda-civic-lxr-2-0-aut-2014', 'HONDA', 'CIVIC', 'LXR 2.0 Aut.', 2013, 2014, 186000, 0, 0, 'FLEX', 'Automático', 'sedan', 'BRANCO', null, '#ffffff', 'Brasília (DF)', '{}', '{}', false, false, 40),
  ('jeep-compass-longitude-serie-80-anos-1-3-t270-aut-2022', 'JEEP', 'COMPASS', 'Longitude Série 80 Anos 1.3 T270 Aut.', 2021, 2022, 59000, 0, 0, 'FLEX', 'Automático', 'suv', 'CINZA', null, '#8c8c8c', 'Brasília (DF)', '{}', '{}', false, false, 30),
  ('toyota-corolla-cross-xre-2-0-cvt-2023', 'TOYOTA', 'COROLLA CROSS', 'XRE 2.0 CVT', 2023, 2023, 54000, 0, 0, 'FLEX', 'CVT', 'suv', 'BRANCO', 'Branco Pérola', '#ffffff', 'Brasília (DF)', '{}', '{}', false, false, 20),
  ('toyota-hilux-srx-2-8-diesel-4x4-aut-2022', 'TOYOTA', 'HILUX', 'SRX 2.8 Diesel 4x4 Aut.', 2021, 2022, 126000, 0, 0, 'DIESEL', 'Automático', 'caminhonete', 'CINZA', null, '#8c8c8c', 'Brasília (DF)', ARRAY['4X4']::text[], '{}', false, false, 10)
on conflict (slug) do nothing;

-- Confere o resultado
select marca, modelo, versao, ano_fab, ano_modelo, km, preco from public.veiculos order by ordem desc;
