-- ============================================================
-- Seed Certificate Event & Participants from PDF Table
-- Run in Supabase SQL Editor to populate all student records.
-- ============================================================

-- 1. Insert or update KIROverse Certificate Event
insert into public.certificate_events (title, slug, template_url, name_x, name_y, font_size, font_weight, text_color, text_align, is_published)
values (
  'KIROverse — AWS Student Builder Group',
  'kiroverse',
  '/certificates/default-template.png',
  73.8,
  61.5,
  26,
  'bold',
  '#111827',
  'center',
  true
)
on conflict (slug) do update set is_published = true;

-- 2. Insert All Students from PDF List (Demo roll numbers removed)
with kiro_event as (
  select id from public.certificate_events where slug = 'kiroverse' limit 1
)
insert into public.certificate_participants (event_id, roll_number, participant_name)
select kiro_event.id, p.roll_number, p.participant_name
from kiro_event, (values
  ('25BCSE014', 'PRABHDEEP KAUR'),
  ('25BCSE019', 'SIMRANJIT KAUR'),
  ('25BMEAIML001', 'ARSHPREET SINGH'),
  ('25CEAIML001', 'RISHAV RAJ'),
  ('25BCSE023', 'VAIBHAV BANSAL'),
  ('25BCSE004', 'AMANDEEP SINGH'),
  ('25BCSE013', 'NIKHIL BHARDWAJ'),
  ('25BCSEAIML130', 'AMANPREET KAUR'),
  ('25BCSEAIML046', 'JASLEEN KHANNA'),
  ('25BCSEAIML032', 'EKTA RANA'),
  ('25BCSEAIML041', 'HIMANI'),
  ('25BCSEAIML015', 'ANSHU'),
  ('25BCSEAIML004', 'ADITYA'),
  ('25BCSEAIML036', 'GOURAV PAL'),
  ('25BCSEAIML137', 'DEEPAK KUMAR'),
  ('25BCSEAIML028', 'ASHUTOSH KUMAR'),
  ('25BCSEAIML001', 'AARYAN TRIPATHI'),
  ('25BCSEAIML012', 'ANKIT KUMAR YADAV'),
  ('25BCSEAIML018', 'ANUSHKA KUMARI'),
  ('25BCSEAIML045', 'JASHANPREET KAUR'),
  ('25BCSEAIML101', 'ROSHNI'),
  ('25BCSEAIML104', 'SANJANA'),
  ('25BCSEAIML049', 'JIGYASA KUMARI'),
  ('25BCSEAIML074', 'NEHA'),
  ('24BCSEAIML007', 'ANJALI'),
  ('24BCSEAIML039', 'NAGMA'),
  ('25BCSEAIML073', 'NEERAJ'),
  ('25BCSEAIML107', 'SHAINA'),
  ('25BCSEAIML082', 'PAYAL'),
  ('25BCSEAIML070', 'MUKUL'),
  ('25BCSEAIML030', 'AYUSH'),
  ('25BCSEAIML116', 'SUJIT'),
  ('25BCSEDS009', 'PRATEEK'),
  ('25BCSEAIML091', 'PRIYANSHU'),
  ('25BCSEAIML086', 'PRANAV SHARMA'),
  ('25BCSEAIML051', 'KAMALPREET SINGH'),
  ('25BCSEDS008', 'SUKHJEET'),
  ('25BCSEAIML119', 'YUVRAJ'),
  ('25BCSEAIML112', 'SHUBHAM'),
  ('25BCSEAIML135', 'HARSAJAN'),
  ('25BCSE007', 'HARSHIT BANSAL'),
  ('25BCSEAIML035', 'GOURAV'),
  ('25BCSE024', 'YUVRAJ SINGH'),
  ('25BCSEAIML088', 'PREETI'),
  ('25BCSEAIML077', 'NIKHIL'),
  ('25BCSEAIML075', 'NIDHI'),
  ('24BCSEAIML036', 'MEHAKPREET KAUR'),
  ('24BCSEAIML057', 'SIMRANJIT KAUR'),
  ('24BCSEAIML049', 'RESHAM KAUR'),
  ('25BCSEAIML044', 'PARVEENJOT KAUR'),
  ('25BCSEAIML038', 'GURWINDER'),
  ('25BCSEAIML002', 'AASTHA PRASHAR'),
  ('24BCSEAIML054', 'SANYAM'),
  ('24BCSE010', 'FALAK MASOOM'),
  ('24BCSEAIML035', 'MEGHNA VERMA'),
  ('24BCSEAIML028', 'JASPREET KAUR'),
  ('24BCSEAIML002', 'AASHIA'),
  ('24BCSEAIML01', 'SHIVANI YADAV'),
  ('25BEE005', 'MUSKAN'),
  ('25BECEAIML002', 'RIYA GUPTA'),
  ('25BCSEAIML076', 'NIHAR'),
  ('25BCSEAIML059', 'KUNAL'),
  ('25BCSE001', 'ABDUL REHMAN'),
  ('25BCSEAIML124', 'TASHPREET KAUR'),
  ('25BCSEAIML103', 'SAKSHI'),
  ('25BCSECBRS004', 'RAMANDEEP KAUR'),
  ('25BCSEAIML139', 'SNEHA'),
  ('25BCSEAIML083', 'POOJA DEVI'),
  ('25BCSEDS003', 'MANMEET KAUR'),
  ('25BCSEAIML140', 'KULWINDER SINGH'),
  ('25BCSEAIML125', 'TARANPREET SINGH'),
  ('25BCSEAIML061', 'LOVEPREET KAUR'),
  ('25BCSEAIML066', 'MEHAK'),
  ('25BCSEAIML078', 'NIKKI'),
  ('25BCSE017', 'SAPNA KUMARI'),
  ('24BCSEAIML014', 'DHEERAJ GARG'),
  ('24BCSEAIML009', 'ANURAG KUMAR'),
  ('25BCSE009', 'MANJOT KAUR')
) as p(roll_number, participant_name)
on conflict (event_id, roll_number) do update set participant_name = excluded.participant_name;
