-- ============================================================
-- Expand the languages list to the full set (32 languages).
-- Safe to run multiple times — ON CONFLICT does nothing on repeats.
-- Run this in the Neon SQL Editor after schema.sql.
-- ============================================================

INSERT INTO languages (code, name, native_name) VALUES
    ('sw',  'Swahili',     'Kiswahili'),
    ('ki',  'Kikuyu',      'Gĩkũyũ'),
    ('luo', 'Luo',         'Dholuo'),
    ('luy', 'Luhya',       'Luluhya'),
    ('rw',  'Kinyarwanda', 'Ikinyarwanda'),
    ('rn',  'Kirundi',     'Ikirundi'),
    ('lg',  'Luganda',     'Luganda'),
    ('ln',  'Lingala',     'Lingála'),
    ('am',  'Amharic',     'አማርኛ'),
    ('om',  'Oromo',       'Afaan Oromoo'),
    ('ti',  'Tigrinya',    'ትግርኛ'),
    ('so',  'Somali',      'Soomaali'),
    ('ar',  'Arabic',      'العربية'),
    ('yo',  'Yoruba',      'Yorùbá'),
    ('ig',  'Igbo',        'Igbo'),
    ('tw',  'Twi',         'Twi'),
    ('ak',  'Akan',        'Akan'),
    ('ee',  'Ewe',         'Eʋegbe'),
    ('ff',  'Fula',        'Fulfulde'),
    ('wo',  'Wolof',       'Wolof'),
    ('zu',  'Zulu',        'isiZulu'),
    ('xh',  'Xhosa',       'isiXhosa'),
    ('st',  'Sotho',       'Sesotho'),
    ('tn',  'Tswana',      'Setswana'),
    ('af',  'Afrikaans',   'Afrikaans'),
    ('nd',  'Ndebele',     'isiNdebele'),
    ('sn',  'Shona',       'chiShona'),
    ('ny',  'Chichewa',    'Chichewa'),
    ('nya', 'Nyanja',      'Chinyanja'),
    ('bem', 'Bemba',       'Ichibemba'),
    ('toi', 'Tonga',       'Chitonga'),
    ('tum', 'Tumbuka',     'Chitumbuka')
ON CONFLICT (code) DO NOTHING;

-- Also make sure the country list covers the new representative countries.
INSERT INTO countries (code, name) VALUES
    ('TZ','Tanzania'), ('KE','Kenya'), ('UG','Uganda'), ('RW','Rwanda'),
    ('BI','Burundi'), ('CD','DR Congo'), ('NG','Nigeria'), ('GH','Ghana'),
    ('ZA','South Africa'), ('ZW','Zimbabwe'), ('BW','Botswana'), ('MW','Malawi'),
    ('ET','Ethiopia'), ('ER','Eritrea'), ('SO','Somalia'), ('EG','Egypt'),
    ('SN','Senegal'), ('ZM','Zambia')
ON CONFLICT (code) DO NOTHING;
