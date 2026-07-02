-- Indian celebrity migration for celebrity_sitelinks
-- Generated 2026-07-02T15:27:32.574Z from src/data/indianCelebrities.ts
-- 598 entries

-- Step 1: Add new columns (idempotent)
ALTER TABLE celebrity_sitelinks
  ADD COLUMN IF NOT EXISTS known_for TEXT,
  ADD COLUMN IF NOT EXISTS tier TEXT;

-- Step 2: Insert Indian celebrities (skip existing by name + birth_month_day)
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mahatma Gandhi', '1869-10-02', '10-02', 'Freedom Fighter', 'Father of the Nation, leader of Indian independence movement through nonviolent civil disobedience', 'Indian', 'IN', 'historical', '1948-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mahatma Gandhi') AND birth_month_day = '10-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Jawaharlal Nehru', '1889-11-14', '11-14', 'Politician', 'First Prime Minister of India, architect of modern India, Children''s Day celebrated on his birthday', 'Indian', 'IN', 'historical', '1964-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jawaharlal Nehru') AND birth_month_day = '11-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Subhas Chandra Bose', '1897-01-23', '01-23', 'Freedom Fighter', 'Netaji — leader of Indian National Army, "Give me blood and I will give you freedom"', 'Indian', 'IN', 'historical', '1945-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Subhas Chandra Bose') AND birth_month_day = '01-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bhimrao Ambedkar', '1891-04-14', '04-14', 'Social Reformer', 'Father of Indian Constitution, champion of Dalit rights, jurist and economist', 'Indian', 'IN', 'historical', '1956-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhimrao Ambedkar') AND birth_month_day = '04-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rabindranath Tagore', '1861-05-07', '05-07', 'Poet', 'Nobel Prize in Literature 1913, wrote Jana Gana Mana, Gitanjali, Rabindra Sangeet', 'Indian', 'IN', 'historical', '1941-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rabindranath Tagore') AND birth_month_day = '05-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Swami Vivekananda', '1863-01-12', '01-12', 'Philosopher', 'Vedanta philosopher, introduced Hinduism to the West at Chicago Parliament of Religions 1893', 'Indian', 'IN', 'historical', '1902-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Swami Vivekananda') AND birth_month_day = '01-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bal Gangadhar Tilak', '1856-07-23', '07-23', 'Freedom Fighter', '"Swaraj is my birthright" — first leader of Indian independence movement', 'Indian', 'IN', 'historical', '1920-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bal Gangadhar Tilak') AND birth_month_day = '07-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bhagat Singh', '1907-09-28', '09-28', 'Freedom Fighter', 'Revolutionary freedom fighter, martyred at age 23, symbol of Indian resistance', 'Indian', 'IN', 'historical', '1931-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhagat Singh') AND birth_month_day = '09-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sardar Vallabhbhai Patel', '1875-10-31', '10-31', 'Politician', 'Iron Man of India, unified 562 princely states into Indian Union, first Home Minister', 'Indian', 'IN', 'historical', '1950-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sardar Vallabhbhai Patel') AND birth_month_day = '10-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Aryabhata', '0476-04-13', '04-13', 'Mathematician', 'Ancient mathematician and astronomer, discovered zero and decimal system, calculated pi', 'Indian', 'IN', 'historical', '550-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Aryabhata') AND birth_month_day = '04-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Chanakya', '0371-01-01', '01-01', 'Philosopher', 'Ancient Indian philosopher, economist, teacher of Chandragupta Maurya, wrote Arthashastra', 'Indian', 'IN', 'historical', '283-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chanakya') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Maulana Abul Kalam Azad', '1888-11-11', '11-11', 'Freedom Fighter', 'Youngest President of Indian National Congress, first Education Minister of India', 'Indian', 'IN', 'historical', '1958-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Maulana Abul Kalam Azad') AND birth_month_day = '11-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Gopal Krishna Gokhale', '1866-05-09', '05-09', 'Freedom Fighter', 'Political mentor of Gandhi, social reformer, founder of Servants of India Society', 'Indian', 'IN', 'historical', '1915-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gopal Krishna Gokhale') AND birth_month_day = '05-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Lala Lajpat Rai', '1865-01-28', '01-28', 'Freedom Fighter', 'Lion of Punjab, led protest against Simon Commission, died from police lathi charge', 'Indian', 'IN', 'historical', '1928-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lala Lajpat Rai') AND birth_month_day = '01-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bipin Chandra Pal', '1858-11-07', '11-07', 'Freedom Fighter', 'One of the Lal Bal Pal trio, champion of Swaraj and Swadeshi movements', 'Indian', 'IN', 'historical', '1932-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bipin Chandra Pal') AND birth_month_day = '11-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Annie Besant', '1847-10-01', '10-01', 'Freedom Fighter', 'First woman President of Indian National Congress, theosophist, Home Rule League founder', 'Indian', 'IN', 'historical', '1933-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Annie Besant') AND birth_month_day = '10-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sarojini Naidu', '1879-02-13', '02-13', 'Freedom Fighter', 'Nightingale of India, poet, first woman President of Indian National Congress', 'Indian', 'IN', 'historical', '1949-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sarojini Naidu') AND birth_month_day = '02-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Chandra Shekhar Azad', '1906-07-23', '07-23', 'Freedom Fighter', 'Revolutionary freedom fighter, vowed never to be captured alive, died free', 'Indian', 'IN', 'historical', '1931-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chandra Shekhar Azad') AND birth_month_day = '07-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ram Prasad Bismil', '1897-06-11', '06-11', 'Freedom Fighter', 'Revolutionary poet and freedom fighter, Kakori conspiracy, "Sarfaroshi ki tamanna"', 'Indian', 'IN', 'historical', '1927-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ram Prasad Bismil') AND birth_month_day = '06-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ashfaqulla Khan', '1900-10-22', '10-22', 'Freedom Fighter', 'Revolutionary freedom fighter, Kakori conspiracy, close friend of Ram Prasad Bismil', 'Indian', 'IN', 'historical', '1927-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ashfaqulla Khan') AND birth_month_day = '10-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Vinoba Bhave', '1895-09-11', '09-11', 'Social Reformer', 'Bhoodan movement, Gandhi''s spiritual heir, first Individual Satyagrahi', 'Indian', 'IN', 'historical', '1982-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vinoba Bhave') AND birth_month_day = '09-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Subramania Bharati', '1882-12-11', '12-11', 'Poet', 'Tamil poet and freedom fighter, Mahakavi Bharati, champion of women''s rights', 'Indian', 'IN', 'historical', '1921-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Subramania Bharati') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bankim Chandra Chattopadhyay', '1838-06-27', '06-27', 'Author', 'Wrote Vande Mataram, Anandamath, father of Bengali novel', 'Indian', 'IN', 'historical', '1894-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bankim Chandra Chattopadhyay') AND birth_month_day = '06-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ishwar Chandra Vidyasagar', '1820-09-26', '09-26', 'Social Reformer', 'Champion of widow remarriage, women''s education, Bengali Renaissance figure', 'Indian', 'IN', 'historical', '1891-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ishwar Chandra Vidyasagar') AND birth_month_day = '09-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ram Mohan Roy', '1772-05-22', '05-22', 'Social Reformer', 'Father of Bengal Renaissance, abolished sati, founded Brahmo Samaj', 'Indian', 'IN', 'historical', '1833-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ram Mohan Roy') AND birth_month_day = '05-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dayananda Saraswati', '1824-02-12', '02-12', 'Philosopher', 'Founded Arya Samaj, championed Vedic Hinduism, "Back to the Vedas"', 'Indian', 'IN', 'historical', '1883-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dayananda Saraswati') AND birth_month_day = '02-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Guru Nanak Dev', '1469-04-15', '04-15', 'Spiritual Leader', 'Founder of Sikhism, first of the ten Sikh Gurus, "Ik Onkar"', 'Indian', 'IN', 'historical', '1539-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Guru Nanak Dev') AND birth_month_day = '04-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mirabai', '1498-01-01', '01-01', 'Poet', 'Medieval poet-saint and devotee of Krishna, her bhajans remain central to Hindu devotion', 'Indian', 'IN', 'historical', '1547-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mirabai') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Kabir Das', '1440-06-01', '06-01', 'Poet', 'Mystic poet and saint whose verses appear in Guru Granth Sahib and Adi Granth', 'Indian', 'IN', 'historical', '1518-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kabir Das') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Tulsidas', '1532-08-11', '08-11', 'Poet', 'Author of Ramcharitmanas, Hanuman Chalisa — most widely read Hindi literature', 'Indian', 'IN', 'historical', '1623-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tulsidas') AND birth_month_day = '08-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Srila Prabhupada', '1896-09-01', '09-01', 'Spiritual Leader', 'Founder of ISKCON (Hare Krishna movement), brought Bhagavad Gita and Vaishnavism to the West', 'Indian', 'IN', 'historical', '1977-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Srila Prabhupada') AND birth_month_day = '09-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ramana Maharshi', '1879-12-30', '12-30', 'Spiritual Leader', 'Sage of Arunachala, self-enquiry ("Who am I?") meditation, one of the greatest modern sages', 'Indian', 'IN', 'historical', '1950-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ramana Maharshi') AND birth_month_day = '12-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sri Aurobindo', '1872-08-15', '08-15', 'Philosopher', 'Freedom fighter turned philosopher and yogi, Integral Yoga, The Life Divine', 'Indian', 'IN', 'historical', '1950-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sri Aurobindo') AND birth_month_day = '08-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Paramahansa Yogananda', '1893-01-05', '01-05', 'Spiritual Leader', 'Autobiography of a Yogi, introduced Kriya Yoga to the West, Self-Realization Fellowship', 'Indian', 'IN', 'historical', '1952-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Paramahansa Yogananda') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Osho Rajneesh', '1931-12-11', '12-11', 'Philosopher', 'Controversial spiritual teacher, neo-sannyas movement, 650+ books, global following', 'Indian', 'IN', 'historical', '1990-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Osho Rajneesh') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'J. Krishnamurti', '1895-05-12', '05-12', 'Philosopher', 'Independent philosopher, rejected all organised religion and gurus, The First and Last Freedom', 'Indian', 'IN', 'historical', '1986-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('J. Krishnamurti') AND birth_month_day = '05-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ramakrishna Paramahamsa', '1836-02-18', '02-18', 'Spiritual Leader', 'Mystic and yogi, guru of Swami Vivekananda, "All religions lead to the same God"', 'Indian', 'IN', 'historical', '1886-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ramakrishna Paramahamsa') AND birth_month_day = '02-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Swami Sivananda', '1887-09-08', '09-08', 'Spiritual Leader', 'Founded Divine Life Society, prolific author of 200+ books on yoga and Vedanta', 'Indian', 'IN', 'historical', '1963-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Swami Sivananda') AND birth_month_day = '09-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sai Baba of Shirdi', '1838-09-28', '09-28', 'Spiritual Leader', 'Revered saint worshipped by both Hindus and Muslims, "Sabka Malik Ek"', 'Indian', 'IN', 'historical', '1918-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sai Baba of Shirdi') AND birth_month_day = '09-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Maharishi Mahesh Yogi', '1917-01-12', '01-12', 'Spiritual Leader', 'Founder of Transcendental Meditation, taught The Beatles, global meditation movement', 'Indian', 'IN', 'historical', '2008-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Maharishi Mahesh Yogi') AND birth_month_day = '01-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sadhguru Jaggi Vasudev', '1957-09-03', '09-03', 'Spiritual Leader', 'Founder of Isha Foundation, yogi and author, Save Soil movement, global spiritual teacher', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sadhguru Jaggi Vasudev') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sri Sri Ravi Shankar', '1956-05-13', '05-13', 'Spiritual Leader', 'Founder of Art of Living Foundation, Sudarshan Kriya, global peace ambassador', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sri Sri Ravi Shankar') AND birth_month_day = '05-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Baba Ramdev', '1965-12-25', '12-25', 'Spiritual Leader', 'Yoga guru, founder of Patanjali Ayurved, popularised pranayama across India', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Baba Ramdev') AND birth_month_day = '12-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mata Amritanandamayi', '1953-09-27', '09-27', 'Spiritual Leader', 'The Hugging Saint, Amma, humanitarian and spiritual leader, embraced over 37 million people', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mata Amritanandamayi') AND birth_month_day = '09-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sarvepalli Radhakrishnan', '1888-09-05', '09-05', 'Philosopher', 'Second President of India, philosopher of Hindu religion, Teachers'' Day celebrated on his birthday', 'Indian', 'IN', 'historical', '1975-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sarvepalli Radhakrishnan') AND birth_month_day = '09-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'APJ Abdul Kalam', '1931-10-15', '10-15', 'Scientist', 'Missile Man of India, 11th President of India, PSLV and Agni missile programs', 'Indian', 'IN', 'public_figure', '2015-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('APJ Abdul Kalam') AND birth_month_day = '10-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'CV Raman', '1888-11-07', '11-07', 'Scientist', 'Nobel Prize in Physics 1930 for Raman Effect, National Science Day on his discovery date', 'Indian', 'IN', 'historical', '1970-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('CV Raman') AND birth_month_day = '11-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Srinivasa Ramanujan', '1887-12-22', '12-22', 'Mathematician', 'Self-taught mathematical genius, infinite series, mock theta functions, Hardy-Ramanujan number 1729', 'Indian', 'IN', 'historical', '1920-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Srinivasa Ramanujan') AND birth_month_day = '12-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Homi Bhabha', '1909-10-30', '10-30', 'Scientist', 'Father of Indian nuclear programme, founded TIFR and BARC', 'Indian', 'IN', 'historical', '1966-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Homi Bhabha') AND birth_month_day = '10-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Vikram Sarabhai', '1919-08-12', '08-12', 'Scientist', 'Father of Indian space programme, founded ISRO, established IIM Ahmedabad', 'Indian', 'IN', 'historical', '1971-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vikram Sarabhai') AND birth_month_day = '08-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Satyen Bose', '1894-01-01', '01-01', 'Scientist', 'Bose-Einstein statistics, Bose-Einstein condensate, Bosons named after him', 'Indian', 'IN', 'historical', '1974-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Satyen Bose') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Meghnad Saha', '1893-10-06', '10-06', 'Scientist', 'Saha ionization equation, astrophysics pioneer, planned India''s river valley projects', 'Indian', 'IN', 'historical', '1956-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Meghnad Saha') AND birth_month_day = '10-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Subrahmanyan Chandrasekhar', '1910-10-19', '10-19', 'Scientist', 'Nobel Prize in Physics 1983, Chandrasekhar limit for white dwarf stars', 'Indian', 'IN', 'historical', '1995-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Subrahmanyan Chandrasekhar') AND birth_month_day = '10-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amartya Sen', '1933-11-03', '11-03', 'Economist', 'Nobel Prize in Economics 1998, welfare economics, capability approach, Development as Freedom', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amartya Sen') AND birth_month_day = '11-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Venkatraman Ramakrishnan', '1952-04-01', '04-01', 'Scientist', 'Nobel Prize in Chemistry 2009 for ribosome structure, President of Royal Society', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Venkatraman Ramakrishnan') AND birth_month_day = '04-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Indira Gandhi', '1917-11-19', '11-19', 'Politician', 'First and only female Prime Minister of India, "Iron Lady of India", Green Revolution', 'Indian', 'IN', 'historical', '1984-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Indira Gandhi') AND birth_month_day = '11-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rajiv Gandhi', '1944-08-20', '08-20', 'Politician', 'Youngest Prime Minister of India, computer and telecom revolution in India', 'Indian', 'IN', 'historical', '1991-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajiv Gandhi') AND birth_month_day = '08-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Atal Bihari Vajpayee', '1924-12-25', '12-25', 'Politician', 'Prime Minister of India, Pokhran nuclear tests, Lahore bus diplomacy, poet-politician', 'Indian', 'IN', 'historical', '2018-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Atal Bihari Vajpayee') AND birth_month_day = '12-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Narendra Modi', '1950-09-17', '09-17', 'Politician', 'Current Prime Minister of India, Digital India, Make in India, Swachh Bharat', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Narendra Modi') AND birth_month_day = '09-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rahul Gandhi', '1970-06-19', '06-19', 'Politician', 'Indian National Congress leader, Member of Parliament, Bharat Jodo Yatra', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rahul Gandhi') AND birth_month_day = '06-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Manmohan Singh', '1932-09-26', '09-26', 'Politician', 'Prime Minister of India 2004-2014, architect of 1991 economic liberalisation as Finance Minister', 'Indian', 'IN', 'public_figure', '2024-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Manmohan Singh') AND birth_month_day = '09-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Pranab Mukherjee', '1935-12-11', '12-11', 'Politician', '13th President of India, longest-serving Finance Minister, Bharat Ratna 2019', 'Indian', 'IN', 'public_figure', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pranab Mukherjee') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Lal Bahadur Shastri', '1904-10-02', '10-02', 'Politician', 'Second Prime Minister of India, "Jai Jawan Jai Kisan", led India in 1965 war with Pakistan', 'Indian', 'IN', 'historical', '1966-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lal Bahadur Shastri') AND birth_month_day = '10-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonia Gandhi', '1946-12-09', '12-09', 'Politician', 'President of Indian National Congress, longest-serving Congress President, Italian-born Indian leader', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonia Gandhi') AND birth_month_day = '12-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arvind Kejriwal', '1968-08-16', '08-16', 'Politician', 'Chief Minister of Delhi, founder of Aam Aadmi Party, anti-corruption movement', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arvind Kejriwal') AND birth_month_day = '08-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mamata Banerjee', '1955-01-05', '01-05', 'Politician', 'Chief Minister of West Bengal, founder of Trinamool Congress, Didi', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mamata Banerjee') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mayawati', '1956-01-15', '01-15', 'Politician', 'Four-time Chief Minister of Uttar Pradesh, Bahujan Samaj Party, Dalit rights champion', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mayawati') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sharad Pawar', '1940-12-12', '12-12', 'Politician', 'Veteran politician, BCCI President, founder of Nationalist Congress Party', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sharad Pawar') AND birth_month_day = '12-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amitabh Bachchan', '1942-10-11', '10-11', 'Actor', 'Shahenshah of Bollywood, over 200 films, Deewar, Sholay, KBC host, Padma Vibhushan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amitabh Bachchan') AND birth_month_day = '10-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shah Rukh Khan', '1965-11-02', '11-02', 'Actor', 'King of Bollywood, DDLJ, Dilwale, My Name is Khan, global Indian cinema ambassador', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shah Rukh Khan') AND birth_month_day = '11-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Salman Khan', '1965-12-27', '12-27', 'Actor', 'Dabangg, Tiger franchise, Bajrangi Bhaijaan, Being Human, highest-paid Bollywood actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Salman Khan') AND birth_month_day = '12-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Aamir Khan', '1965-03-14', '03-14', 'Actor', 'Mr. Perfectionist, Lagaan, 3 Idiots, Dangal, PK, Taare Zameen Par, Satyamev Jayate host', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Aamir Khan') AND birth_month_day = '03-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hrithik Roshan', '1974-01-10', '01-10', 'Actor', 'Kaho Na Pyaar Hai, Koi Mil Gaya, Dhoom 2, Jodha Akbar, War, Greek God of Bollywood', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hrithik Roshan') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ranbir Kapoor', '1982-09-28', '09-28', 'Actor', 'Rockstar, Barfi, Sanju, Brahmastra, Animal, one of Bollywood''s most versatile actors', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ranbir Kapoor') AND birth_month_day = '09-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ranveer Singh', '1985-07-06', '07-06', 'Actor', 'Goliyon Ki Raasleela Ram-Leela, Bajirao Mastani, Padmaavat, Gully Boy, 83', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ranveer Singh') AND birth_month_day = '07-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Akshay Kumar', '1967-09-09', '09-09', 'Actor', 'Khiladi, Toilet Ek Prem Katha, Padman, Mission Mangal, most prolific Bollywood star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Akshay Kumar') AND birth_month_day = '09-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ajay Devgn', '1969-04-02', '04-02', 'Actor', 'Phool Aur Kaante, Singham, Tanhaji, Drishyam, Gangajal, one of India''s top action stars', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ajay Devgn') AND birth_month_day = '04-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shahid Kapoor', '1981-02-25', '02-25', 'Actor', 'Vivah, Kaminey, Haider, Udta Punjab, Kabir Singh, Jab We Met', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shahid Kapoor') AND birth_month_day = '02-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Irrfan Khan', '1967-01-07', '01-07', 'Actor', 'The Lunchbox, Piku, Hindi Medium, Slumdog Millionaire, Life of Pi, Jurassic World', 'Indian', 'IN', 'entertainment', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Irrfan Khan') AND birth_month_day = '01-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nawazuddin Siddiqui', '1974-05-19', '05-19', 'Actor', 'Gangs of Wasseypur, The Lunchbox, Badlapur, Sacred Games, Serious Men', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nawazuddin Siddiqui') AND birth_month_day = '05-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rajkummar Rao', '1984-08-31', '08-31', 'Actor', 'Kai Po Che, Shahid, Bareilly Ki Barfi, Newton, Stree, The White Tiger', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajkummar Rao') AND birth_month_day = '08-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pankaj Tripathi', '1976-09-05', '09-05', 'Actor', 'Mirzapur, Sacred Games, Stree, Fukrey, Gunjan Saxena, one of India''s finest character actors', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pankaj Tripathi') AND birth_month_day = '09-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rajesh Khanna', '1942-12-29', '12-29', 'Actor', 'First superstar of Bollywood, Anand, Aradhana, Kati Patang, 15 consecutive solo hits', 'Indian', 'IN', 'entertainment', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajesh Khanna') AND birth_month_day = '12-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dilip Kumar', '1922-12-11', '12-11', 'Actor', 'Tragedy King of Bollywood, Devdas, Mughal-e-Azam, Naya Daur, Bharat Ratna 2015', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dilip Kumar') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dev Anand', '1923-09-26', '09-26', 'Actor', 'Evergreen hero of Bollywood, Guide, Jewel Thief, Hare Rama Hare Krishna', 'Indian', 'IN', 'historical', '2011-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dev Anand') AND birth_month_day = '09-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Raj Kapoor', '1924-12-14', '12-14', 'Actor', 'Showman of Bollywood, Awaara, Shree 420, Bobby, directed and produced classics of Indian cinema', 'Indian', 'IN', 'historical', '1988-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Raj Kapoor') AND birth_month_day = '12-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dharmendra', '1935-12-08', '12-08', 'Actor', 'He-Man of Bollywood, Sholay, Phool Aur Patthar, Seeta Aur Geeta, Chupke Chupke', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dharmendra') AND birth_month_day = '12-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sunny Deol', '1956-10-19', '10-19', 'Actor', 'Gadar, Border, Damini, Ghayal, Barsaat, action hero of 1980s-90s Bollywood', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sunny Deol') AND birth_month_day = '10-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Deepika Padukone', '1986-01-05', '01-05', 'Actress', 'Om Shanti Om, Cocktail, Piku, Bajirao Mastani, Padmaavat, global brand ambassador', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Deepika Padukone') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Priyanka Chopra', '1982-07-18', '07-18', 'Actress', 'Miss World 2000, Barfi, Mary Kom, Quantico (ABC), global superstar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Priyanka Chopra') AND birth_month_day = '07-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Aishwarya Rai Bachchan', '1973-11-01', '11-01', 'Actress', 'Miss World 1994, Hum Dil De Chuke Sanam, Devdas, Jodhaa Akbar, Cannes regular', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Aishwarya Rai Bachchan') AND birth_month_day = '11-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kareena Kapoor Khan', '1980-09-21', '09-21', 'Actress', 'Kabhi Khushi Kabhie Gham, Jab We Met, 3 Idiots, Heroine, Laal Singh Chaddha', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kareena Kapoor Khan') AND birth_month_day = '09-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Katrina Kaif', '1983-07-16', '07-16', 'Actress', 'Namastey London, Mere Brother Ki Dulhan, Tiger franchise, Zero, Phone Bhoot', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Katrina Kaif') AND birth_month_day = '07-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Alia Bhatt', '1993-03-15', '03-15', 'Actress', 'Highway, Udta Punjab, Raazi, Gully Boy, Gangubai Kathiawadi, RRR, Heart of Stone', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Alia Bhatt') AND birth_month_day = '03-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Madhuri Dixit', '1967-05-15', '05-15', 'Actress', 'Dhak Dhak girl, Tezaab, Dil To Pagal Hai, Devdas, Hum Aapke Hain Koun, dancing queen', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Madhuri Dixit') AND birth_month_day = '05-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kajol', '1974-08-05', '08-05', 'Actress', 'DDLJ, Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, My Name is Khan, Dilwale', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kajol') AND birth_month_day = '08-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rekha', '1954-10-10', '10-10', 'Actress', 'Umrao Jaan, Silsila, Khubsoorat, Khoon Bhari Maang, eternal beauty of Bollywood', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rekha') AND birth_month_day = '10-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sridevi', '1963-08-13', '08-13', 'Actress', 'Sadma, Nagina, Mr. India, ChaalBaaz, English Vinglish, Mom, first female superstar of India', 'Indian', 'IN', 'entertainment', '2018-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sridevi') AND birth_month_day = '08-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kangana Ranaut', '1987-03-23', '03-23', 'Actress', 'Queen, Tanu Weds Manu, Manikarnika, Thalaivii, most decorated female actor at Filmfare', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kangana Ranaut') AND birth_month_day = '03-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Taapsee Pannu', '1987-08-01', '08-01', 'Actress', 'Pink, Badla, Thappad, Haseen Dillruba, Shabaash Mithu, Dunki', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Taapsee Pannu') AND birth_month_day = '08-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vidya Balan', '1979-01-01', '01-01', 'Actress', 'Parineeta, The Dirty Picture, Kahaani, Tumhari Sulu, Mission Mangal, Shakuntala Devi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vidya Balan') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rajinikanth', '1950-12-12', '12-12', 'Actor', 'Superstar of Indian cinema, Baasha, Muthu, Sivaji, Enthiran, Kabali, global cult following', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajinikanth') AND birth_month_day = '12-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kamal Haasan', '1954-11-07', '11-07', 'Actor', 'Nayakan, Pushpak, Indian, Anbe Sivam, Hey Ram, Vishwaroopam, India''s most versatile actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kamal Haasan') AND birth_month_day = '11-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vijay', '1974-06-22', '06-22', 'Actor', 'Thalapathy, Mersal, Bigil, Master, Beast, Varisu, highest-grossing Tamil star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vijay') AND birth_month_day = '06-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ajith Kumar', '1971-05-01', '05-01', 'Actor', 'Thala, Mankatha, Vedalam, Viswasam, Valimai, Tamil cinema superstar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ajith Kumar') AND birth_month_day = '05-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Allu Arjun', '1983-04-08', '04-08', 'Actor', 'Stylish Star, Arya, Desamuduru, Pushpa franchise, first Telugu actor to win National Award', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Allu Arjun') AND birth_month_day = '04-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prabhas', '1979-10-23', '10-23', 'Actor', 'Darling, Baahubali franchise, Saaho, Radhe Shyam, Adipurush, Kalki 2898-AD', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prabhas') AND birth_month_day = '10-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jr NTR', '1983-05-20', '05-20', 'Actor', 'Young Tiger, RRR, Janatha Garage, Aravinda Sametha, Telugu cinema icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jr NTR') AND birth_month_day = '05-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ram Charan', '1985-03-27', '03-27', 'Actor', 'Mega Power Star, Magadheera, Rangasthalam, RRR, RC 15, son of Chiranjeevi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ram Charan') AND birth_month_day = '03-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mohanlal', '1960-05-21', '05-21', 'Actor', 'Complete Actor of Malayalam cinema, Kireedam, Bharatham, Drishyam, Lucifer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mohanlal') AND birth_month_day = '05-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mammootty', '1951-09-07', '09-07', 'Actor', 'Megastar of Malayalam cinema, Oru CBI Diary Kurippu, Mathilukal, The Great Father', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mammootty') AND birth_month_day = '09-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kajal Aggarwal', '1985-06-19', '06-19', 'Actress', 'Magadheera, Baadshah, Singham, Mr. Perfect, leading actress in Telugu and Tamil cinema', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kajal Aggarwal') AND birth_month_day = '06-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Trisha Krishnan', '1983-05-04', '05-04', 'Actress', '96, Ghilli, Varsham, Nuvvostanante Nenoddantana, leading Tamil and Telugu actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Trisha Krishnan') AND birth_month_day = '05-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nayanthara', '1984-11-18', '11-18', 'Actress', 'Lady Superstar, Junglee Pictures, Chandramukhi, Ghajini, Atlee films, Jawan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nayanthara') AND birth_month_day = '11-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'SS Rajamouli', '1973-10-10', '10-10', 'Director', 'Baahubali franchise, RRR, Magadheera, India''s most successful director globally', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('SS Rajamouli') AND birth_month_day = '10-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sachin Tendulkar', '1973-04-24', '04-24', 'Cricketer', 'God of Cricket, 100 international centuries, 34,357 international runs, Bharat Ratna 2014', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sachin Tendulkar') AND birth_month_day = '04-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'MS Dhoni', '1981-07-07', '07-07', 'Cricketer', 'Captain Cool, won 2007 T20 WC, 2010 Asia Cup, 2011 ODI WC, 2013 Champions Trophy, CSK captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('MS Dhoni') AND birth_month_day = '07-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Virat Kohli', '1988-11-05', '11-05', 'Cricketer', 'Run machine, 80+ international centuries, fastest to 8000/9000/10000 ODI runs, King Kohli', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Virat Kohli') AND birth_month_day = '11-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rohit Sharma', '1987-04-30', '04-30', 'Cricketer', 'Hitman, three ODI double centuries, T20 World Cup 2024 winner and captain, Hitman', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rohit Sharma') AND birth_month_day = '04-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kapil Dev', '1959-01-06', '01-06', 'Cricketer', 'Haryana Hurricane, led India to 1983 World Cup victory, 434 Test wickets, all-rounder', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kapil Dev') AND birth_month_day = '01-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sunil Gavaskar', '1949-07-10', '07-10', 'Cricketer', 'Little Master, first batsman to score 10,000 Test runs, 34 Test centuries, opening legend', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sunil Gavaskar') AND birth_month_day = '07-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sourav Ganguly', '1972-07-08', '07-08', 'Cricketer', 'Dada, Prince of Kolkata, transformed Indian cricket culture, BCCI President', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sourav Ganguly') AND birth_month_day = '07-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rahul Dravid', '1973-01-11', '01-11', 'Cricketer', 'The Wall, 13,288 Test runs, technical masterclass, Head Coach of Indian cricket team', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rahul Dravid') AND birth_month_day = '01-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anil Kumble', '1970-10-17', '10-17', 'Cricketer', 'Jumbo, 619 Test wickets, took all 10 Pakistan wickets in one innings, leg-spinner great', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anil Kumble') AND birth_month_day = '10-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'VVS Laxman', '1974-11-01', '11-01', 'Cricketer', 'Very Very Special, 281 against Australia Kolkata 2001, one of cricket''s greatest innings', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('VVS Laxman') AND birth_month_day = '11-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Yuvraj Singh', '1981-12-12', '12-12', 'Cricketer', 'Six sixes in an over, Player of Tournament 2011 World Cup, cancer survivor comeback', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yuvraj Singh') AND birth_month_day = '12-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Harbhajan Singh', '1980-07-03', '07-03', 'Cricketer', 'Turbanator, hat-trick in Test cricket vs Australia 2001, 417 Test wickets', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Harbhajan Singh') AND birth_month_day = '07-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jasprit Bumrah', '1993-12-06', '12-06', 'Cricketer', 'World''s best fast bowler, unique action, death-over specialist, T20 World Cup 2024 winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jasprit Bumrah') AND birth_month_day = '12-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shubman Gill', '2002-09-08', '09-08', 'Cricketer', 'New generation batting star, future captain material, elegant right-hand batsman', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shubman Gill') AND birth_month_day = '09-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ravindra Jadeja', '1988-12-06', '12-06', 'Cricketer', 'Sir Jadeja, world''s best fielder, left-arm spinner and lower-order batsman, Test all-rounder', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravindra Jadeja') AND birth_month_day = '12-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Smriti Mandhana', '1996-07-18', '07-18', 'Cricketer', 'ICC Women''s Cricketer of Year 2018, leading Indian women''s cricket batting star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Smriti Mandhana') AND birth_month_day = '07-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mithali Raj', '1982-12-03', '12-03', 'Cricketer', 'Greatest female cricketer India, 7,805 ODI runs, led India to World Cup final 2017', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mithali Raj') AND birth_month_day = '12-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Lata Mangeshkar', '1929-09-28', '09-28', 'Singer', 'Nightingale of India, 30,000+ songs in 36 languages over 7 decades, Bharat Ratna 2001', 'Indian', 'IN', 'historical', '2022-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lata Mangeshkar') AND birth_month_day = '09-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Kishore Kumar', '1929-08-04', '08-04', 'Singer', 'Versatile playback singer, actor, filmmaker, most popular male voice of Hindi cinema', 'Indian', 'IN', 'historical', '1987-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kishore Kumar') AND birth_month_day = '08-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mohammed Rafi', '1924-12-24', '12-24', 'Singer', 'One of greatest playback singers in history, versatile range, 26,000+ songs', 'Indian', 'IN', 'historical', '1980-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mohammed Rafi') AND birth_month_day = '12-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mukesh', '1923-07-22', '07-22', 'Singer', 'Soulful playback singer, voice of Raj Kapoor, Kabhi Kabhi, Mera Joota Hai Japani', 'Indian', 'IN', 'historical', '1976-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mukesh') AND birth_month_day = '07-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Asha Bhosle', '1933-09-08', '09-08', 'Singer', 'Sister of Lata Mangeshkar, widest vocal range, world record for most studio recordings', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Asha Bhosle') AND birth_month_day = '09-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'AR Rahman', '1967-01-06', '01-06', 'Music Composer', 'Mozart of Madras, Roja, Dil Se, Lagaan, Slumdog Millionaire Oscar winner, Grammy winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('AR Rahman') AND birth_month_day = '01-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ravi Shankar', '1920-04-07', '04-07', 'Musician', 'Sitar maestro, collaborated with George Harrison, brought Indian classical music to the world', 'Indian', 'IN', 'historical', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravi Shankar') AND birth_month_day = '04-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Zakir Hussain', '1951-03-09', '03-09', 'Musician', 'Tabla maestro, Grammy winner, Shakti, global ambassador of Indian classical percussion', 'Indian', 'IN', 'entertainment', '2024-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Zakir Hussain') AND birth_month_day = '03-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arijit Singh', '1987-04-25', '04-25', 'Singer', 'Most streamed Indian artist globally, Tum Hi Ho, Channa Mereya, Kesariya, Ae Dil Hai Mushkil', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arijit Singh') AND birth_month_day = '04-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonu Nigam', '1973-07-30', '07-30', 'Singer', 'Classic Bollywood playback singer, Kal Ho Naa Ho, Abhi Mujh Mein Kahin, Sandese Aate Hain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonu Nigam') AND birth_month_day = '07-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kumar Sanu', '1957-10-20', '10-20', 'Singer', 'King of Sad Songs, 1990s Bollywood playback voice, Dil Deewana, Ek Ladki Ko Dekha', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kumar Sanu') AND birth_month_day = '10-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Usha Uthup', '1947-11-08', '11-08', 'Singer', 'India''s rock and pop pioneer, Darling, Hare Rama Hare Krishna, six-decade career', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Usha Uthup') AND birth_month_day = '11-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ratan Tata', '1937-12-28', '12-28', 'Business Leader', 'Chairman of Tata Group, Tata Nano, acquired Jaguar Land Rover, philanthropist, national icon', 'Indian', 'IN', 'public_figure', '2024-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ratan Tata') AND birth_month_day = '12-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mukesh Ambani', '1957-04-19', '04-19', 'Business Leader', 'Asia''s richest person, Reliance Industries, Jio telecom revolution, Antilia', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mukesh Ambani') AND birth_month_day = '04-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dhirubhai Ambani', '1932-12-28', '12-28', 'Business Leader', 'Founded Reliance Industries, rags-to-riches story, democratised equity investment in India', 'Indian', 'IN', 'historical', '2002-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dhirubhai Ambani') AND birth_month_day = '12-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Narayana Murthy', '1946-08-20', '08-20', 'Business Leader', 'Co-founder of Infosys, pioneer of Indian IT industry, $250 initial investment to $100B company', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Narayana Murthy') AND birth_month_day = '08-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Azim Premji', '1945-07-24', '07-24', 'Business Leader', 'Wipro Chairman, Czar of Indian IT, donated $21 billion to philanthropy', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Azim Premji') AND birth_month_day = '07-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sundar Pichai', '1972-07-12', '07-12', 'Business Leader', 'CEO of Google and Alphabet, from Tamil Nadu to Silicon Valley, IIT Kharagpur alumnus', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sundar Pichai') AND birth_month_day = '07-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Satya Nadella', '1967-08-19', '08-19', 'Business Leader', 'CEO of Microsoft, transformed Microsoft into cloud-first company, Azure dominance', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Satya Nadella') AND birth_month_day = '08-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Indra Nooyi', '1955-10-28', '10-28', 'Business Leader', 'Former CEO of PepsiCo, Fortune most powerful women, IIM Calcutta alumna', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Indra Nooyi') AND birth_month_day = '10-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kumar Mangalam Birla', '1967-06-14', '06-14', 'Business Leader', 'Chairman of Aditya Birla Group, one of India''s largest conglomerates', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kumar Mangalam Birla') AND birth_month_day = '06-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'PV Sindhu', '1995-07-05', '07-05', 'Athlete', 'Olympic silver (Rio 2016) and bronze (Tokyo 2020) in badminton, World Champion 2019', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('PV Sindhu') AND birth_month_day = '07-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Saina Nehwal', '1990-03-17', '03-17', 'Athlete', 'First Indian to reach world badminton No.1, Olympic bronze 2012 London, six World Superseries', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Saina Nehwal') AND birth_month_day = '03-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Neeraj Chopra', '1997-12-24', '12-24', 'Athlete', 'Olympic gold Tokyo 2020 in javelin, first Indian to win Olympic gold in track and field', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Neeraj Chopra') AND birth_month_day = '12-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mary Kom', '1982-11-24', '11-24', 'Athlete', 'Magnificent Mary, six-time World Boxing Champion, Olympic bronze 2012, Padma Vibhushan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mary Kom') AND birth_month_day = '11-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Milkha Singh', '1929-11-20', '11-20', 'Athlete', 'Flying Sikh, Indian sprinting legend, national record holder, 1960 Rome Olympics finalist', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Milkha Singh') AND birth_month_day = '11-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'PT Usha', '1964-06-27', '06-27', 'Athlete', 'Payyoli Express, Queen of Indian track and field, missed 1984 Olympics medal by 1/100th second', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('PT Usha') AND birth_month_day = '06-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Abhinav Bindra', '1982-09-28', '09-28', 'Athlete', 'First Indian to win individual Olympic gold (Beijing 2008), 10m air rifle, Padma Bhushan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Abhinav Bindra') AND birth_month_day = '09-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vishwanathan Anand', '1969-12-11', '12-11', 'Athlete', 'Five-time World Chess Champion, first Asian to win World Chess Championship 2000', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vishwanathan Anand') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Leander Paes', '1973-06-17', '06-17', 'Athlete', 'Olympic bronze 1996 Atlanta, 18 Grand Slam doubles titles, India''s greatest tennis player', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Leander Paes') AND birth_month_day = '06-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arundhati Roy', '1961-11-24', '11-24', 'Author', 'The God of Small Things (Booker Prize 1997), activist, The Ministry of Utmost Happiness', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arundhati Roy') AND birth_month_day = '11-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chetan Bhagat', '1974-04-22', '04-22', 'Author', 'Five Point Someone, 2 States, Half Girlfriend, 3 Mistakes of My Life, IIT IIM alumnus', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chetan Bhagat') AND birth_month_day = '04-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vikram Seth', '1952-06-20', '06-20', 'Author', 'A Suitable Boy, An Equal Music, The Golden Gate, one of India''s greatest living novelists', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vikram Seth') AND birth_month_day = '06-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ruskin Bond', '1934-05-19', '05-19', 'Author', 'The Room on the Roof, A Flight of Pigeons, Vagrants in the Valley, beloved British-Indian author', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ruskin Bond') AND birth_month_day = '05-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'RK Narayan', '1906-10-10', '10-10', 'Author', 'Malgudi Days, The Guide, Swami and Friends, Indian English literature pioneer', 'Indian', 'IN', 'historical', '2001-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('RK Narayan') AND birth_month_day = '10-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Munshi Premchand', '1880-07-31', '07-31', 'Author', 'Godaan, Nirmala, Gaban, Shatranj ke Khilari, greatest Hindi-Urdu fiction writer', 'Indian', 'IN', 'historical', '1936-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Munshi Premchand') AND birth_month_day = '07-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Satyajit Ray', '1921-05-02', '05-02', 'Director', 'Pather Panchali, Apu trilogy, Academy Honorary Award, greatest Indian filmmaker', 'Indian', 'IN', 'historical', '1992-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Satyajit Ray') AND birth_month_day = '05-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Guru Dutt', '1925-07-09', '07-09', 'Director', 'Pyaasa, Kaagaz Ke Phool, Sahib Bibi Aur Ghulam, auteur of poetic Hindi cinema', 'Indian', 'IN', 'historical', '1964-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Guru Dutt') AND birth_month_day = '07-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Yash Chopra', '1932-09-27', '09-27', 'Director', 'King of Romance, Deewar, Silsila, Chandni, DDLJ producer, Filmfare Lifetime Achievement', 'Indian', 'IN', 'historical', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yash Chopra') AND birth_month_day = '09-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Karan Johar', '1972-05-25', '05-25', 'Director', 'Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, My Name is Khan, Ae Dil Hai Mushkil', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Karan Johar') AND birth_month_day = '05-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sanjay Leela Bhansali', '1963-02-24', '02-24', 'Director', 'Hum Dil De Chuke Sanam, Devdas, Bajirao Mastani, Padmaavat, Gangubai Kathiawadi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sanjay Leela Bhansali') AND birth_month_day = '02-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mani Ratnam', '1956-06-02', '06-02', 'Director', 'Roja, Bombay, Dil Se, Guru, Raavan, Ponniyin Selvan, greatest Tamil filmmaker', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mani Ratnam') AND birth_month_day = '06-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Nargis', '1929-01-01', '01-01', 'Actress', 'Mother India (1957), Barsaat, Awara, first Indian actress to win a national award internationally', 'Indian', 'IN', 'historical', '1981-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nargis') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nandan Nilekani', '1955-01-02', '01-02', 'Business Leader', 'Co-founder of Infosys, architect of Aadhaar biometric identity system, Imagining India', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nandan Nilekani') AND birth_month_day = '01-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonakshi Sinha', '1987-01-02', '01-02', 'Actress', 'Dabangg franchise, Rowdy Rathore, Lootera, Akira, daughter of Shatrughan Sinha', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonakshi Sinha') AND birth_month_day = '01-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ilayaraja', '1943-01-02', '01-02', 'Music Composer', 'Maestro of Tamil film music, 1000+ film scores, Ilaignan, How to Name It', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ilayaraja') AND birth_month_day = '01-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'M. Karunanidhi', '1924-01-03', '01-03', 'Politician', 'Five-time Chief Minister of Tamil Nadu, founder of DMK, screenwriter-turned-politician', 'Indian', 'IN', 'historical', '2018-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('M. Karunanidhi') AND birth_month_day = '01-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'S.P. Balasubrahmanyam', '1946-01-04', '01-04', 'Singer', 'SPB, legendary South Indian playback singer, Guinness record holder, 40,000+ songs', 'Indian', 'IN', 'historical', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('S.P. Balasubrahmanyam') AND birth_month_day = '01-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anil Ambani', '1959-01-04', '01-04', 'Business Leader', 'Chairman of Reliance Group, younger brother of Mukesh Ambani', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anil Ambani') AND birth_month_day = '01-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Nutan', '1936-01-04', '01-04', 'Actress', 'Sujata, Seema, Bandini, Milan, Saraswatichandra, five-time Filmfare Best Actress winner', 'Indian', 'IN', 'historical', '1991-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nutan') AND birth_month_day = '01-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Revathi', '1966-01-05', '01-05', 'Actress', 'Mouna Ragam, Thevar Magan, Minsaara Kanavu, National Award winning Tamil actress-director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Revathi') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sunil Dutt', '1929-01-06', '01-06', 'Actor', 'Mother India, Mujhe Jeene Do, Padosan, politician, husband of Nargis, father of Sanjay Dutt', 'Indian', 'IN', 'historical', '2005-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sunil Dutt') AND birth_month_day = '01-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bipasha Basu', '1979-01-07', '01-07', 'Actress', 'Raaz, Dhoom 2, Race, No Entry, Alone, fitness icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bipasha Basu') AND birth_month_day = '01-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ekta Kapoor', '1975-01-07', '01-07', 'Producer', 'Balaji Telefilms, queen of Indian television, Kyunki Saas Bhi Kabhi Bahu Thi, Kasautii', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ekta Kapoor') AND birth_month_day = '01-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mahesh Bhupathi', '1974-01-07', '01-07', 'Athlete', 'Indian tennis doubles specialist, Grand Slam champion, Davis Cup hero', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mahesh Bhupathi') AND birth_month_day = '01-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dimple Kapadia', '1957-01-08', '01-08', 'Actress', 'Bobby, Ram Lakhan, Dil Chahta Hai, Tenet, iconic Bollywood actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dimple Kapadia') AND birth_month_day = '01-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shilpa Shetty', '1975-01-08', '01-08', 'Actress', 'Baazigar, Dhadkan, Big Brother UK winner, Yoga ambassador, fitness icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shilpa Shetty') AND birth_month_day = '01-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Yash', '1986-01-08', '01-08', 'Actor', 'KGF Chapter 1 and 2, Rocky Bhai, biggest Kannada cinema star globally', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yash') AND birth_month_day = '01-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hima Das', '1999-01-09', '01-09', 'Athlete', 'Dhing Express, first Indian to win gold at World U20 Athletics Championship 2018', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hima Das') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Farhan Akhtar', '1974-01-09', '01-09', 'Actor', 'Dil Chahta Hai director, Rock On, Bhaag Milkha Bhaag, Toofaan, Jee Le Zaraa', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Farhan Akhtar') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kiran Bedi', '1949-01-09', '01-09', 'Politician', 'First woman IPS officer in India, social activist, Rajya Sabha member, tennis player', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kiran Bedi') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonam Kapoor', '1985-01-09', '01-09', 'Actress', 'Saawariya, Neerja, Veere Di Wedding, fashion icon, daughter of Anil Kapoor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonam Kapoor') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amisha Patel', '1976-01-09', '01-09', 'Actress', 'Kaho Na Pyaar Hai, Gadar, Humraaz, Bhool Bhulaiyaa', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amisha Patel') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Balakrishna', '1960-01-10', '01-10', 'Actor', 'Nandamuri Balakrishna, Telugu superstar, son of NT Rama Rao, 100+ films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Balakrishna') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prakash Padukone', '1955-01-10', '01-10', 'Athlete', 'First Indian to win All England Badminton Championship 1980, father of Deepika Padukone', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prakash Padukone') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'E. Sridharan', '1932-01-12', '01-12', 'Engineer', 'Metro Man of India, built Delhi Metro, Konkan Railway, Padma Vibhushan', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('E. Sridharan') AND birth_month_day = '01-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Shivkumar Sharma', '1938-01-13', '01-13', 'Musician', 'Popularised santoor as classical instrument, Shiv-Hari duo with Hariprasad, Chandni songs', 'Indian', 'IN', 'historical', '2022-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shivkumar Sharma') AND birth_month_day = '01-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sidharth Malhotra', '1985-01-16', '01-16', 'Actor', 'Student of the Year, Hasee Toh Phasee, Ek Villain, Kapoor & Sons, Shershaah', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sidharth Malhotra') AND birth_month_day = '01-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Deep Kalra', '1970-01-16', '01-16', 'Business Leader', 'Founder of MakeMyTrip, pioneered online travel booking in India', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Deep Kalra') AND birth_month_day = '01-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Javed Akhtar', '1945-01-17', '01-17', 'Lyricist', 'Sholay screenplay, Deewaar, Zanjeer, iconic lyricist, husband of Shabana Azmi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Javed Akhtar') AND birth_month_day = '01-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Raj Thackeray', '1968-01-14', '01-14', 'Politician', 'Founder of Maharashtra Navnirman Sena, Marathi political leader', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Raj Thackeray') AND birth_month_day = '01-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kirron Kher', '1955-01-14', '01-14', 'Actress', 'Devdas, Veer-Zaara, Dostana, Khoobsoorat, BJP MP from Chandigarh', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kirron Kher') AND birth_month_day = '01-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anna Hazare', '1937-01-15', '01-15', 'Social Reformer', 'Anti-corruption crusader, Lokpal movement, led India Against Corruption with Kejriwal', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anna Hazare') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Lakshmi Mittal', '1950-01-15', '01-15', 'Business Leader', 'Chairman of ArcelorMittal, world''s largest steel company, steel king', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lakshmi Mittal') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pritish Nandy', '1951-01-15', '01-15', 'Author', 'Poet, journalist, filmmaker, The Illustrated Weekly of India editor', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pritish Nandy') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Tantia Tope', '1814-01-16', '01-16', 'Historical', '1857 uprising general, served Peshwa Nana Sahib, last resistance leader of First War', 'Indian', 'IN', 'historical', '1859-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tantia Tope') AND birth_month_day = '01-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Axar Patel', '1994-01-20', '01-20', 'Cricketer', 'Left-arm spinner all-rounder, Delhi Capitals, hero of home Test series 2021', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Axar Patel') AND birth_month_day = '01-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Tovino Thomas', '1989-01-21', '01-21', 'Actor', 'Minnal Murali, Forensic, Trance, Lucifer, rising star of Malayalam cinema', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tovino Thomas') AND birth_month_day = '01-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Tisca Chopra', '1973-01-23', '01-23', 'Actress', 'Taare Zameen Par, Dil Dhadakne Do, Haider, director of Chutney and X', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tisca Chopra') AND birth_month_day = '01-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Cheteshwar Pujara', '1988-01-25', '01-25', 'Cricketer', 'Wall of Indian cricket, 7195 Test runs, hero of Australia 2020-21 series', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Cheteshwar Pujara') AND birth_month_day = '01-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kavita Krishnamurthy', '1958-01-25', '01-25', 'Singer', 'Tezaab, Beta, Khalnayak, Mr. India, classical and film singer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kavita Krishnamurthy') AND birth_month_day = '01-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shruti Haasan', '1986-01-28', '01-28', 'Actress', 'Gamanam, Salaar, Indian 2, singer and actress, daughter of Kamal Haasan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shruti Haasan') AND birth_month_day = '01-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Preity Zinta', '1974-01-31', '01-31', 'Actress', 'Dil Se, Kya Kehna, Kal Ho Naa Ho, Veer-Zaara, Salaam Namaste, KXIP co-owner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Preity Zinta') AND birth_month_day = '01-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jackie Shroff', '1957-02-01', '02-01', 'Actor', 'Hero, Ram Lakhan, Parinda, Rangeela, father of Tiger Shroff', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jackie Shroff') AND birth_month_day = '02-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Abhishek Bachchan', '1976-02-05', '02-05', 'Actor', 'Dhoom, Bunty aur Babli, Guru, Kabhi Alvida Naa Kehna, son of Amitabh Bachchan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Abhishek Bachchan') AND birth_month_day = '02-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bhuvneshwar Kumar', '1990-02-05', '02-05', 'Cricketer', 'Swing bowler, death-over specialist, led SRH to IPL success, reverse swing expert', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhuvneshwar Kumar') AND birth_month_day = '02-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amrita Singh', '1958-02-09', '02-09', 'Actress', 'Betaab, Chameli Ki Shaadi, Ek Do Teen, Sarafarosh, ex-wife of Saif Ali Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amrita Singh') AND birth_month_day = '02-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Pran', '1920-02-12', '02-12', 'Actor', 'Greatest villain of Hindi cinema, Upkar, Victoria No. 203, Zanjeer, 400+ films', 'Indian', 'IN', 'historical', '2013-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pran') AND birth_month_day = '02-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dayananda Saraswati', '1824-02-12', '02-12', 'Philosopher', 'Founded Arya Samaj, championed Vedic Hinduism, "Back to the Vedas"', 'Indian', 'IN', 'historical', '1883-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dayananda Saraswati') AND birth_month_day = '02-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sushma Swaraj', '1952-02-14', '02-14', 'Politician', 'External Affairs Minister, most popular BJP leader, helped Indians abroad, eloquent orator', 'Indian', 'IN', 'historical', '2019-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sushma Swaraj') AND birth_month_day = '02-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sivakarthikeyan', '1985-02-17', '02-17', 'Actor', 'VIP, Kakki Sattai, Remo, Doctor, Don, Ayalaan, biggest Tamil star of new generation', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sivakarthikeyan') AND birth_month_day = '02-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nushrratt Bharuccha', '1985-02-17', '02-17', 'Actress', 'Pyaar Ka Punchnama, Sonu Ke Titu Ki Sweety, Chhorii, Janhit Mein Jaari', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nushrratt Bharuccha') AND birth_month_day = '02-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rukmini Devi Arundale', '1904-02-29', '02-29', 'Cultural Figure', 'Revival of Bharatanatyam classical dance, Kalakshetra Foundation Chennai, Padma Bhushan', 'Indian', 'IN', 'historical', '1986-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rukmini Devi Arundale') AND birth_month_day = '02-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kidambi Srikanth', '1993-02-07', '02-07', 'Athlete', 'World No.1 badminton ranking 2017, four Super Series titles in 2017', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kidambi Srikanth') AND birth_month_day = '02-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'S Sreesanth', '1983-02-06', '02-06', 'Cricketer', 'Fiery Kerala pace bowler, 2007 T20 and 2011 ODI World Cup winner, emotional character', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('S Sreesanth') AND birth_month_day = '02-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bajrang Punia', '1994-02-26', '02-26', 'Athlete', 'Olympic bronze Tokyo 2020, World Wrestling Championship medallist, 65kg freestyle', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bajrang Punia') AND birth_month_day = '02-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pooja Bhatt', '1972-02-28', '02-28', 'Actress', 'Dil Hai Ki Manta Nahin, Sadak, Junoon, producer, daughter of Mahesh Bhatt', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pooja Bhatt') AND birth_month_day = '02-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dutee Chand', '1996-02-03', '02-03', 'Athlete', 'India''s fastest woman sprinter, Asian Games silver, fought against hyperandrogenism rules', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dutee Chand') AND birth_month_day = '02-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bhimsen Joshi', '1922-02-04', '02-04', 'Musician', 'Kirana Gharana vocalist, Bharat Ratna 2008, celebrated classical Hindustani singer', 'Indian', 'IN', 'historical', '2011-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhimsen Joshi') AND birth_month_day = '02-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Tiger Shroff', '1990-03-02', '03-02', 'Actor', 'Baaghi franchise, Heropanti, War, action star, son of Jackie Shroff, martial arts expert', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tiger Shroff') AND birth_month_day = '03-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shraddha Kapoor', '1989-03-03', '03-03', 'Actress', 'Aashiqui 2, ABCD 2, Baaghi, Stree franchise, Tu Jhoothi Main Makkaar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shraddha Kapoor') AND birth_month_day = '03-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Divya Khosla Kumar', '1983-03-07', '03-07', 'Actress', 'Ab Tumhare Hawale Watan Saathiyo, Sanam Re, director of Yaariyan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Divya Khosla Kumar') AND birth_month_day = '03-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anupam Kher', '1955-03-07', '03-07', 'Actor', 'Saaransh, Dilwale Dulhania Le Jayenge, Khosla Ka Ghosla, Silver Linings Playbook', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anupam Kher') AND birth_month_day = '03-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Gangubai Hangal', '1913-03-05', '03-05', 'Musician', 'Kirana Gharana vocalist, Bharat Ratna 2002, sang till 92, inspiration for Sanjay Bhansali film', 'Indian', 'IN', 'historical', '2009-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gangubai Hangal') AND birth_month_day = '03-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nitish Kumar', '1951-03-08', '03-08', 'Politician', 'Chief Minister of Bihar, JDU leader, Bihar development model, railway minister', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nitish Kumar') AND birth_month_day = '03-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Parthiv Patel', '1985-03-09', '03-09', 'Cricketer', 'Youngest Indian Test debutant wicketkeeper (age 17), Gujarat Lions, Gujarat captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Parthiv Patel') AND birth_month_day = '03-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Atif Aslam', '1983-03-12', '03-12', 'Singer', 'Pakistani-Indian singer, Woh Lamhe, Tere Sang Yaara, most streamed in India', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Atif Aslam') AND birth_month_day = '03-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shreya Ghoshal', '1984-03-12', '03-12', 'Singer', 'Devdas playback, Jab We Met, Bajirao Mastani, over 3000 songs, four National Awards', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shreya Ghoshal') AND birth_month_day = '03-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nimrat Kaur', '1982-03-13', '03-13', 'Actress', 'The Lunchbox, Airlift, Homeland (US series), Dasvi, major international breakthrough', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nimrat Kaur') AND birth_month_day = '03-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bismillah Khan', '1916-03-21', '03-21', 'Musician', 'Shehnai maestro, Bharat Ratna 2001, played at India''s first Independence Day, 80-year career', 'Indian', 'IN', 'historical', '2006-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bismillah Khan') AND birth_month_day = '03-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rani Mukerji', '1978-03-21', '03-21', 'Actress', 'Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, Hichki, Mardaani, Black, Saathiya', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rani Mukerji') AND birth_month_day = '03-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Smriti Irani', '1976-03-23', '03-23', 'Politician', 'Kyunki Saas Bhi Kabhi Bahu Thi actress turned BJP minister, Education Minister', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Smriti Irani') AND birth_month_day = '03-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Emraan Hashmi', '1979-03-24', '03-24', 'Actor', 'Jannat, Raaz series, Awarapan, Mr. X, The Body, serial kisser image', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Emraan Hashmi') AND birth_month_day = '03-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Koneru Humpy', '1987-03-31', '03-31', 'Athlete', 'World Rapid Chess Champion 2019, youngest grandmaster when achieved, chess prodigy', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Koneru Humpy') AND birth_month_day = '03-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kiran Mazumdar Shaw', '1953-03-23', '03-23', 'Business Leader', 'Founder of Biocon, India''s first woman entrepreneur billionaire, Padma Bhushan', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kiran Mazumdar Shaw') AND birth_month_day = '03-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shankar Mahadevan', '1967-03-03', '03-03', 'Singer', 'Breathless, Dil Chahta Hai, Lagaan, Rock On, Shankar-Ehsaan-Loy trio', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shankar Mahadevan') AND birth_month_day = '03-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shekhar Ravjiani', '1976-03-05', '03-05', 'Singer', 'Vishal-Shekhar duo, Kaho Na Pyaar Hai, Don, Dhoom 3, Indian Idol judge', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shekhar Ravjiani') AND birth_month_day = '03-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Alka Yagnik', '1966-03-20', '03-20', 'Singer', 'Most downloaded Indian female artist globally, Pardes, Dil To Pagal Hai, 30+ years', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Alka Yagnik') AND birth_month_day = '03-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Shashi Kapoor', '1938-03-18', '03-18', 'Actor', 'Waqt, Kabhi Kabhie, Deewar, Junoon, international films with Merchant Ivory', 'Indian', 'IN', 'historical', '2017-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shashi Kapoor') AND birth_month_day = '03-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rashmika Mandanna', '1996-04-05', '04-05', 'Actress', 'Geetha Govindam, Pushpa franchise, Animal, Goodbye, Mission Majnu, national crush', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rashmika Mandanna') AND birth_month_day = '04-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'S Janaki', '1938-04-23', '04-23', 'Singer', 'South India''s most beloved playback singer, 50,000+ songs in 17 languages', 'Indian', 'IN', 'historical'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('S Janaki') AND birth_month_day = '04-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Manoj Bajpayee', '1969-04-23', '04-23', 'Actor', 'Satya, Gangs of Wasseypur, Aligarh, The Family Man, Bhonsle, one of India''s finest', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Manoj Bajpayee') AND birth_month_day = '04-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arshad Warsi', '1968-04-19', '04-19', 'Actor', 'Circuit in Munna Bhai MBBS, Golmaal series, Ishqiya, Jolly LLB, Dhamaal', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arshad Warsi') AND birth_month_day = '04-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Lara Dutta', '1978-04-16', '04-16', 'Actress', 'Miss Universe 2000, Andaaz, Bhagam Bhag, Bell Bottom, Kaun Banega Crorepati host', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lara Dutta') AND birth_month_day = '04-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vikram', '1966-04-17', '04-17', 'Actor', 'Pithamagan, Anniyan, Dhruva Natchathiram, Ponniyin Selvan, National Award winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vikram') AND birth_month_day = '04-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jaya Bachchan', '1948-04-09', '04-09', 'Actress', 'Guddi, Abhimaan, Sholay, Kabhie Kabhie, Samajwadi Party MP, wife of Amitabh', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jaya Bachchan') AND birth_month_day = '04-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Swara Bhasker', '1988-04-09', '04-09', 'Actress', 'Tanu Weds Manu, Raanjhanaa, Nil Battey Sannata, Veere Di Wedding, activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Swara Bhasker') AND birth_month_day = '04-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Kamaladevi Chattopadhyay', '1903-04-03', '04-03', 'Social Reformer', 'Revival of Indian handicrafts, theatre, first woman to contest election in India 1926', 'Indian', 'IN', 'historical', '1988-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kamaladevi Chattopadhyay') AND birth_month_day = '04-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jaya Prada', '1962-04-03', '04-03', 'Actress', 'Sargam, Shaan, Thodisi Bewafai, Sharaabi, top Telugu and Hindi actress-politician', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jaya Prada') AND birth_month_day = '04-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ghanshyam Das Birla', '1894-04-10', '04-10', 'Business Leader', 'Founder of Birla Group, supported Gandhi''s independence movement financially', 'Indian', 'IN', 'historical', '1983-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ghanshyam Das Birla') AND birth_month_day = '04-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Kishori Amonkar', '1932-04-10', '04-10', 'Musician', 'Jaipur Gharana vocalist, Padma Vibhushan, one of greatest vocalists of 20th century', 'Indian', 'IN', 'historical', '2017-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kishori Amonkar') AND birth_month_day = '04-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hariharan', '1955-04-15', '04-15', 'Singer', 'Colonial Cousins with Lesle Lewis, ghazal singer, Bombay, Roja, Guru', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hariharan') AND birth_month_day = '04-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Samantha Ruth Prabhu', '1987-04-28', '04-28', 'Actress', 'Ye Maaya Chesave, Mahanati, The Family Man 2, Shakuntalam, Kushi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Samantha Ruth Prabhu') AND birth_month_day = '04-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chandrababu Naidu', '1950-04-20', '04-20', 'Politician', 'Chief Minister of Andhra Pradesh, Hyderabad IT boom architect, Telugu Desam Party', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chandrababu Naidu') AND birth_month_day = '04-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Deepa Karmakar', '1993-04-09', '04-09', 'Athlete', 'First Indian female gymnast to qualify for Olympics, Produnova vault specialist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Deepa Karmakar') AND birth_month_day = '04-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'KL Rahul', '1992-04-18', '04-18', 'Cricketer', 'Elegant Indian opener, IPL powerhouse, wicketkeeper-batsman, KXIP captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('KL Rahul') AND birth_month_day = '04-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Loy Mendonsa', '1966-04-08', '04-08', 'Music Composer', 'Shankar-Ehsaan-Loy, Dil Chahta Hai, Don, Kabhi Alvida Naa Kehna, Kaal', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Loy Mendonsa') AND birth_month_day = '04-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jeetendra', '1942-04-07', '04-07', 'Actor', 'Jumping Jack, Nagin, Himmatwala, Tohfa, Farz, father of Ekta Kapoor and Tusshar Kapoor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jeetendra') AND birth_month_day = '04-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anushka Sharma', '1988-05-01', '05-01', 'Actress', 'Rab Ne Bana Di Jodi, PK, NH10, Sultan, Ae Dil Hai Mushkil, Jab Harry Met Sejal', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anushka Sharma') AND birth_month_day = '05-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ajith Kumar', '1971-05-01', '05-01', 'Actor', 'Thala, Mankatha, Vedalam, Viswasam, Valimai, Tamil cinema superstar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ajith Kumar') AND birth_month_day = '05-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sam Pitroda', '1942-05-16', '05-16', 'Scientist', 'Telecom revolution in India, C-DOT, PCO booths that democratised phones in India', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sam Pitroda') AND birth_month_day = '05-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vicky Kaushal', '1988-05-16', '05-16', 'Actor', 'Masaan, Raazi, Uri: The Surgical Strike, Sardar Udham, Govinda Naam Mera', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vicky Kaushal') AND birth_month_day = '05-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Girish Karnad', '1938-05-19', '05-19', 'Author', 'Tughlaq, Hayavadana, Naga-Mandala, Jnanpith Award, actor and playwright', 'Indian', 'IN', 'historical', '2019-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Girish Karnad') AND birth_month_day = '05-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Maharana Pratap', '1540-05-09', '05-09', 'Historical', 'Rajput warrior king of Mewar, Battle of Haldighati against Akbar, never surrendered', 'Indian', 'IN', 'historical', '1597-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Maharana Pratap') AND birth_month_day = '05-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Balasaraswati', '1918-05-13', '05-13', 'Dancer', 'Greatest Bharatanatyam dancer of 20th century, took art to international stage', 'Indian', 'IN', 'historical', '1984-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Balasaraswati') AND birth_month_day = '05-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mrinalini Sarabhai', '1918-05-11', '05-11', 'Dancer', 'Founder of Darpana Academy, classical dancer, wife of Vikram Sarabhai', 'Indian', 'IN', 'historical', '2016-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mrinalini Sarabhai') AND birth_month_day = '05-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sushil Kumar', '1983-05-26', '05-26', 'Athlete', 'Two Olympic medals in wrestling (Bronze 2008, Silver 2012), most decorated Indian wrestler', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sushil Kumar') AND birth_month_day = '05-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Paresh Rawal', '1955-05-30', '05-30', 'Actor', 'Hera Pheri, Andaz Apna Apna, Tamanna, Oh My God, Welcome, comic genius', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Paresh Rawal') AND birth_month_day = '05-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Girija Devi', '1929-05-08', '05-08', 'Musician', 'Queen of Thumri, Banaras Gharana vocalist, revived thumri as serious classical form', 'Indian', 'IN', 'historical', '2017-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Girija Devi') AND birth_month_day = '05-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'D Gukesh', '2006-05-29', '05-29', 'Athlete', 'World Chess Champion 2024 at age 18, youngest world champion in chess history', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('D Gukesh') AND birth_month_day = '05-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'HD Deve Gowda', '1933-05-18', '05-18', 'Politician', 'Prime Minister of India 1996-97, Janata Dal leader, Karnataka CM multiple times', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('HD Deve Gowda') AND birth_month_day = '05-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dinesh Karthik', '1985-06-01', '06-01', 'Cricketer', 'Wicketkeeper-batsman, IPL star, 2022 T20 World Cup comeback, commentator', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dinesh Karthik') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mani Ratnam', '1956-06-02', '06-02', 'Director', 'Roja, Bombay, Dil Se, Guru, Raavan, Ponniyin Selvan, greatest Tamil filmmaker', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mani Ratnam') AND birth_month_day = '06-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Stuart Binny', '1983-06-03', '06-03', 'Cricketer', 'Best bowling figures in ODI history (6/4), all-rounder, son of Roger Binny', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Stuart Binny') AND birth_month_day = '06-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Prithviraj Chauhan', '1166-06-01', '06-01', 'Historical', 'Last Hindu emperor of Delhi, Second Battle of Tarain, Rai Pithora, Rajput warrior king', 'Indian', 'IN', 'historical', '1192-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prithviraj Chauhan') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Yogi Adityanath', '1972-06-05', '06-05', 'Politician', 'Chief Minister of Uttar Pradesh, Hindu monk-politician, BJP leader', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yogi Adityanath') AND birth_month_day = '06-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arjun Kapoor', '1985-06-26', '06-26', 'Actor', 'Ishaqzaade, 2 States, Gunday, Sandeep Aur Pinky Faraar, Bhoot Police', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arjun Kapoor') AND birth_month_day = '06-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mithun Chakraborty', '1950-06-16', '06-16', 'Actor', 'Disco Dancer, Agneepath, Guru, Gunda, Prem Pratigya, national award winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mithun Chakraborty') AND birth_month_day = '06-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ajinkya Rahane', '1988-06-06', '06-06', 'Cricketer', 'Led India to famous Gabba victory 2021, elegant middle-order batsman, former vice-captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ajinkya Rahane') AND birth_month_day = '06-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Neha Kakkar', '1988-06-06', '06-06', 'Singer', 'O Humsafar, Dilbar, Coca Cola Tu, Garmi, most-followed Indian musician on Instagram', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Neha Kakkar') AND birth_month_day = '06-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ehsaan Noorani', '1967-06-21', '06-21', 'Music Composer', 'Shankar-Ehsaan-Loy trio, guitar legend, Dil Chahta Hai, Kal Ho Naa Ho', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ehsaan Noorani') AND birth_month_day = '06-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pritam Chakraborty', '1971-06-21', '06-21', 'Music Composer', 'Jab We Met, Love Aaj Kal, Cocktail, Ae Dil Hai Mushkil, Jagga Jasoos', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pritam Chakraborty') AND birth_month_day = '06-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vijay', '1974-06-22', '06-22', 'Actor', 'Thalapathy, Mersal, Bigil, Master, Beast, Varisu, highest-grossing Tamil star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vijay') AND birth_month_day = '06-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Karisma Kapoor', '1974-06-25', '06-25', 'Actress', 'Andaz Apna Apna, Dil To Pagal Hai, Raja Hindustani, Zubeida, elder sister of Kareena', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Karisma Kapoor') AND birth_month_day = '06-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vishal Dadlani', '1974-06-28', '06-28', 'Singer', 'Vishal-Shekhar duo, Dostana, Dhoom 3, Bang Bang, Ra.One, Indian Idol judge', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vishal Dadlani') AND birth_month_day = '06-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sunitha Upadrashta', '1972-06-09', '06-09', 'Singer', 'Leading Telugu playback singer, thousands of songs, most loved Telugu singer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sunitha Upadrashta') AND birth_month_day = '06-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Leander Paes', '1973-06-17', '06-17', 'Athlete', 'Olympic bronze 1996 Atlanta, 18 Grand Slam doubles titles, India''s greatest tennis player', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Leander Paes') AND birth_month_day = '06-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonu Nigam', '1973-07-30', '07-30', 'Singer', 'Classic Bollywood playback singer, Kal Ho Naa Ho, Abhi Mujh Mein Kahin, Sandese Aate Hain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonu Nigam') AND birth_month_day = '07-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sonu Sood', '1973-07-30', '07-30', 'Actor', 'Dabangg, Simmba, Mard Ko Dard Nahi Hota, COVID-19 philanthropy, real-life hero', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sonu Sood') AND birth_month_day = '07-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dhanush', '1983-07-28', '07-28', 'Actor', 'Aadukalam, 3 (Kolaveri Di), Raanjhanaa, The Gray Man, Atrangi Re, son-in-law of Rajinikanth', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dhanush') AND birth_month_day = '07-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Huma Qureshi', '1986-07-28', '07-28', 'Actress', 'Gangs of Wasseypur, Ek Thi Daayan, Badlapur, Army of the Dead, Maharani', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Huma Qureshi') AND birth_month_day = '07-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dulquer Salmaan', '1986-07-28', '07-28', 'Actor', 'OK Kanmani, Karwaan, The Zoya Factor, Hey Sinamika, son of Mammootty', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dulquer Salmaan') AND birth_month_day = '07-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Suriya', '1975-07-23', '07-23', 'Actor', 'Ghajini Tamil original, Ayan, 7aum Arivu, Soorarai Pottru, Jai Bhim, National Award', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Suriya') AND birth_month_day = '07-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Himesh Reshammiya', '1973-07-23', '07-23', 'Singer', 'Aashiq Banaya Aapne, Teraa Surroor, Radio, composer of dozens of hit Bollywood albums', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Himesh Reshammiya') AND birth_month_day = '07-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Cyrus Mistry', '1968-07-04', '07-04', 'Business Leader', 'Former Chairman of Tata Sons, Shapoorji Pallonji Group heir, controversial removal by Tatas', 'Indian', 'IN', 'public_figure', '2022-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Cyrus Mistry') AND birth_month_day = '07-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rakesh Jhunjhunwala', '1960-07-05', '07-05', 'Business Leader', 'Big Bull of Indian stock market, Warren Buffett of India, Akasa Air founder', 'Indian', 'IN', 'public_figure', '2022-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rakesh Jhunjhunwala') AND birth_month_day = '07-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Paytm Vijay Shekhar Sharma', '1978-07-08', '07-08', 'Business Leader', 'Founder of Paytm, digital payments revolution in India, demonetisation beneficiary', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Paytm Vijay Shekhar Sharma') AND birth_month_day = '07-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'JRD Tata', '1904-07-29', '07-29', 'Business Leader', 'First Indian commercial pilot, Chairman Tata Group, Air India founder, Bharat Ratna', 'Indian', 'IN', 'historical', '1993-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('JRD Tata') AND birth_month_day = '07-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kriti Sanon', '1990-07-27', '07-27', 'Actress', 'Heropanti, Dilwale, Bareilly Ki Barfi, Mimi, Adipurush, National Award winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kriti Sanon') AND birth_month_day = '07-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mugdha Godse', '1985-07-26', '07-26', 'Actress', 'Fashion, Aa Dekhen Zara, Mr. X, Time Out', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mugdha Godse') AND birth_month_day = '07-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Armaan Malik', '1995-07-22', '07-22', 'Singer', 'Main Hoon Hero Tera, Bol Do Na Zara, Wajah Tum Ho, youngest top Bollywood singer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Armaan Malik') AND birth_month_day = '07-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shiv Nadar', '1945-07-14', '07-14', 'Business Leader', 'Founder of HCL Technologies, Shiv Nadar University, philanthropy champion', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shiv Nadar') AND birth_month_day = '07-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bhuvneshwar Kumar', '1990-02-05', '02-05', 'Cricketer', 'Swing bowler, death-over specialist, led SRH to IPL success, reverse swing expert', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhuvneshwar Kumar') AND birth_month_day = '02-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Durgabai Deshmukh', '1909-07-15', '07-15', 'Social Reformer', 'Social worker, founded Andhra Mahila Sabha, participated in Dandi March', 'Indian', 'IN', 'historical', '1981-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Durgabai Deshmukh') AND birth_month_day = '07-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'KS Chithra', '1963-07-27', '07-27', 'Singer', 'South India''s nightingale, 25,000+ songs, multiple National Awards', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('KS Chithra') AND birth_month_day = '07-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hariprasad Chaurasia', '1938-07-01', '07-01', 'Musician', 'Greatest living bansuri (flute) player, collaborated with John McLaughlin, Padma Vibhushan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hariprasad Chaurasia') AND birth_month_day = '07-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sanjay Dutt', '1959-07-29', '07-29', 'Actor', 'Rocky, Sadak, Khalnayak, Vaastav, Munna Bhai MBBS, KGF Chapter 2', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sanjay Dutt') AND birth_month_day = '07-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'RD Burman', '1939-06-27', '06-27', 'Music Composer', 'Pancham Da, Sholay music, Amar Prem, Caravan, Hare Rama Hare Krishna, cult composer', 'Indian', 'IN', 'historical', '1994-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('RD Burman') AND birth_month_day = '06-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Genelia D''Souza', '1987-08-05', '08-05', 'Actress', 'Jaane Tu Ya Jaane Na, Tujhe Meri Kasam, Force, wife of Riteish Deshmukh', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Genelia D''Souza') AND birth_month_day = '08-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dipa Karmakar', '1993-08-09', '08-09', 'Athlete', 'First Indian woman gymnast to qualify Olympics, Produnova vault, inspiration for gymnasts', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dipa Karmakar') AND birth_month_day = '08-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Fahadh Faasil', '1983-08-08', '08-08', 'Actor', 'Carbon, Kumbalangi Nights, Joji, Vikram, Pushpa 2, finest actor in Indian cinema today', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Fahadh Faasil') AND birth_month_day = '08-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mirabai Chanu', '1994-08-08', '08-08', 'Athlete', 'Olympic silver Tokyo 2020 in weightlifting, World Champion 2017, Padma Vibhushan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mirabai Chanu') AND birth_month_day = '08-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sara Ali Khan', '1995-08-12', '08-12', 'Actress', 'Kedarnath, Simmba, Love Aaj Kal, Coolie No. 1, daughter of Saif Ali Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sara Ali Khan') AND birth_month_day = '08-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sunidhi Chauhan', '1983-08-14', '08-14', 'Singer', 'Sheila Ki Jawani, Desi Girl, Beedi, Mehboob Mere, one of India''s top female playback singers', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sunidhi Chauhan') AND birth_month_day = '08-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'MS Oberoi', '1898-08-15', '08-15', 'Business Leader', 'Founder of Oberoi Hotels Group, built India''s finest luxury hotel chain', 'Indian', 'IN', 'historical', '2002-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('MS Oberoi') AND birth_month_day = '08-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nirmala Sitharaman', '1959-08-18', '08-18', 'Politician', 'First full-time female Finance Minister of India, BJP leader, Defence Minister', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nirmala Sitharaman') AND birth_month_day = '08-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rajat Sharma', '1957-08-17', '08-17', 'Journalist', 'Founder and Chairman of India TV, Aap Ki Adalat host, most watched news show', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajat Sharma') AND birth_month_day = '08-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chiranjeevi', '1955-08-22', '08-22', 'Actor', 'Megastar of Telugu cinema, 150+ films, Khaidi, Indra, Union Minister, father of Ram Charan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chiranjeevi') AND birth_month_day = '08-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Randeep Hooda', '1976-08-20', '08-20', 'Actor', 'Highway, Sarabjit, Sarbjit, Sultan, Once Upon a Time in Mumbaai', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Randeep Hooda') AND birth_month_day = '08-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bhavish Aggarwal', '1985-08-28', '08-28', 'Business Leader', 'Co-founder of Ola Cabs, Ola Electric, pioneer of Indian ride-hailing', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhavish Aggarwal') AND birth_month_day = '08-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vinesh Phogat', '1994-08-25', '08-25', 'Athlete', 'Commonwealth and Asian Games gold medallist, three-time World medallist, wrestling activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vinesh Phogat') AND birth_month_day = '08-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'HS Prannoy', '1992-08-17', '08-17', 'Athlete', 'Thomas Cup 2022 hero, consistent BWF tour performer, Kerala shuttler', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('HS Prannoy') AND birth_month_day = '08-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'R Praggnanandhaa', '2005-08-10', '08-10', 'Athlete', 'Chess prodigy, FIDE World Cup 2023 finalist, second youngest grandmaster history', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('R Praggnanandhaa') AND birth_month_day = '08-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gulzar', '1934-08-18', '08-18', 'Lyricist', 'Greatest Hindi film lyricist, Jai Ho Oscar winning song, Aandhi, Maachis films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gulzar') AND birth_month_day = '08-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Amjad Khan', '1940-11-12', '11-12', 'Actor', 'Gabbar Singh in Sholay — most iconic villain in Indian cinema history', 'Indian', 'IN', 'historical', '1992-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amjad Khan') AND birth_month_day = '11-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sakshi Malik', '1992-09-03', '09-03', 'Athlete', 'First Indian female wrestler to win Olympic medal (Bronze, Rio 2016)', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sakshi Malik') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mohammed Shami', '1990-09-03', '09-03', 'Cricketer', 'India''s premier fast bowler, 2023 ODI World Cup 7 wickets in an innings, swing maestro', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mohammed Shami') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kunal Shah', '1982-09-14', '09-14', 'Business Leader', 'Founder of CRED, FreeCharge, serial entrepreneur, behavioural economist', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kunal Shah') AND birth_month_day = '09-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ayushmann Khurrana', '1984-09-14', '09-14', 'Actor', 'Vicky Donor, Andhadhun, Bala, Article 15, Shubh Mangal Saavdhan, Dream Girl', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ayushmann Khurrana') AND birth_month_day = '09-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Radhika Apte', '1985-09-07', '09-07', 'Actress', 'Badlapur, Parched, Lust Stories, Sacred Games, Andhadhun, The Wedding Guest', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Radhika Apte') AND birth_month_day = '09-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ravichandran Ashwin', '1986-09-17', '09-17', 'Cricketer', 'World''s best Test off-spinner, 500+ Test wickets, five-time ICC Cricketer of the Year', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravichandran Ashwin') AND birth_month_day = '09-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pragyan Ojha', '1986-09-05', '09-05', 'Cricketer', 'Left-arm spinner, 113 international wickets, crucial in 2011 World Cup squad', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pragyan Ojha') AND birth_month_day = '09-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prem Chopra', '1935-09-23', '09-23', 'Actor', 'Prem Naam Hai Mera — legendary Bollywood villain, Do Raaste, Bobby, Kati Patang', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prem Chopra') AND birth_month_day = '09-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chunky Pandey', '1962-09-26', '09-26', 'Actor', 'Aankhen, Sajaan Chale Sasural, Bhool Bhulaiyaa 2, prolific Bollywood character actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chunky Pandey') AND birth_month_day = '09-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Divya Dutta', '1977-09-25', '09-25', 'Actress', 'Bhaag Milkha Bhaag, Rang De Basanti, Veer-Zaara, Delhi 6, Irada', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Divya Dutta') AND birth_month_day = '09-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'M.S. Subbulakshmi', '1916-09-16', '09-16', 'Musician', 'Greatest Carnatic vocalist, Bharat Ratna 1998, first musician to receive it, global ambassador', 'Indian', 'IN', 'historical', '2004-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('M.S. Subbulakshmi') AND birth_month_day = '09-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Barkha Dutt', '1971-12-18', '12-18', 'Journalist', 'NDTV journalist, Kargil War coverage, The Buck Stops Here, author', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Barkha Dutt') AND birth_month_day = '12-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hardik Pandya', '1993-10-11', '10-11', 'Cricketer', '2022 T20 World Cup hero, best Indian all-rounder, MI and GT captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hardik Pandya') AND birth_month_day = '10-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nivin Pauly', '1984-10-11', '10-11', 'Athlete', 'Premam, Bangalore Days, Action Hero Biju, Kayamkulam Kochunni', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nivin Pauly') AND birth_month_day = '10-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pooja Hegde', '1990-10-13', '10-13', 'Actress', 'Ala Vaikunthapurramuloo, Radhe Shyam, Cirkus, Kisi Ka Bhai Kisi Ki Jaan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pooja Hegde') AND birth_month_day = '10-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Akbar', '1542-10-15', '10-15', 'Historical', 'Greatest Mughal Emperor, religious tolerance Din-i-Ilahi, Navratnas, unified India', 'Indian', 'IN', 'historical', '1605-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Akbar') AND birth_month_day = '10-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Radhakishan Damani', '1954-10-15', '10-15', 'Business Leader', 'Founder of DMart, India''s richest retailer, legendary stock market investor', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Radhakishan Damani') AND birth_month_day = '10-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prannoy Roy', '1949-10-15', '10-15', 'Journalist', 'Co-founder of NDTV, pioneer of Indian television news journalism', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prannoy Roy') AND birth_month_day = '10-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Aditi Rao Hydari', '1986-10-28', '10-28', 'Actress', 'Delhi 6, Rockstar, Bhoomi, Padmaavat, Wazir, Heeramandi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Aditi Rao Hydari') AND birth_month_day = '10-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Parineeti Chopra', '1988-10-22', '10-22', 'Actress', 'Ladies vs Ricky Bahl, Ishaqzaade, Daawat-e-Ishq, Saina, The Girl on the Train', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Parineeti Chopra') AND birth_month_day = '10-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prithviraj Sukumaran', '1982-10-16', '10-16', 'Actor', 'Memories, Aurangzeb, Lucifer, Jana Gana Mana, Gold, director of Bro Daddy', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prithviraj Sukumaran') AND birth_month_day = '10-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amjad Ali Khan', '1945-10-09', '10-09', 'Musician', 'Sarod maestro, son of Hafiz Ali Khan, Padma Vibhushan, Sangeet Natak Akademi award', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amjad Ali Khan') AND birth_month_day = '10-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Arnab Goswami', '1973-10-09', '10-09', 'Journalist', 'Republic TV founder, Times Now anchor, most watched English news anchor in India', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arnab Goswami') AND birth_month_day = '10-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Irfan Pathan', '1984-10-27', '10-27', 'Cricketer', 'Left-arm swing bowler, hat-trick in Lahore Test 2006, 2007 T20 World Cup hero', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Irfan Pathan') AND birth_month_day = '10-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Umesh Yadav', '1987-10-25', '10-25', 'Cricketer', 'Nagpur Express, fastest Indian bowler of his era, 195+ Test wickets', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Umesh Yadav') AND birth_month_day = '10-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rishabh Pant', '1997-10-04', '10-04', 'Cricketer', 'Most aggressive Indian wicketkeeper, match-winning 89 at Gabba 2021, DC captain', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rishabh Pant') AND birth_month_day = '10-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Lovlina Borgohain', '1997-10-02', '10-02', 'Athlete', 'Olympic bronze Tokyo 2020 in boxing, first Northeast Indian to win Olympic medal in boxing', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Lovlina Borgohain') AND birth_month_day = '10-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Washington Sundar', '1999-10-05', '10-05', 'Cricketer', 'Young off-spinning all-rounder, hero of Brisbane Test 2021, Tamil Nadu star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Washington Sundar') AND birth_month_day = '10-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rakul Preet Singh', '1990-10-10', '10-10', 'Actress', 'De De Pyaar De, Doctor G, Runway 34, Sardar Ka Grandson, bi-lingual actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rakul Preet Singh') AND birth_month_day = '10-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Tipu Sultan', '1750-11-20', '11-20', 'Historical', 'Tiger of Mysore, first use of rockets in warfare, fought British East India Company', 'Indian', 'IN', 'historical', '1799-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tipu Sultan') AND birth_month_day = '11-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'SD Burman', '1906-10-01', '10-01', 'Music Composer', 'Sachin Dev Burman, Pyaasa, Guide, Aradhana, Abhimaan, legendary Bollywood composer', 'Indian', 'IN', 'historical', '1975-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('SD Burman') AND birth_month_day = '10-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Shankar Jaikishan', '1922-10-15', '10-15', 'Music Composer', 'Shree 420, Awaara, Mera Naam Joker, composed for Raj Kapoor masterpieces', 'Indian', 'IN', 'historical', '1987-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shankar Jaikishan') AND birth_month_day = '10-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Tabu', '1971-11-04', '11-04', 'Actress', 'Maachis, Hum Saath Saath Hain, Chandni Bar, The Namesake, Haider, Andhadhun', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tabu') AND birth_month_day = '11-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Milind Soman', '1965-11-04', '11-04', 'Actor', 'Ironman triathlete, Made In India music video, Captain Vyom, fitness icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Milind Soman') AND birth_month_day = '11-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Celina Jaitley', '1981-11-04', '11-04', 'Actress', 'No Entry, Golmaal Returns, Jannat, LGBTQ rights activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Celina Jaitley') AND birth_month_day = '11-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Virat Kohli', '1988-11-05', '11-05', 'Cricketer', 'Run machine, 80+ international centuries, fastest to 8000/9000/10000 ODI runs, King Kohli', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Virat Kohli') AND birth_month_day = '11-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anushka Shetty', '1981-11-07', '11-07', 'Actress', 'Baahubali as Devasena, Arundhati, Rudramadevi, Size Zero, leading Telugu actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anushka Shetty') AND birth_month_day = '11-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'LK Advani', '1927-11-08', '11-08', 'Politician', 'BJP co-founder, Ram Mandir movement, Deputy PM of India, Bharat Ratna 2024', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('LK Advani') AND birth_month_day = '11-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Pullela Gopichand', '1973-11-16', '11-16', 'Athlete', 'All England Badminton Champion 2001, national coach who produced Saina and Sindhu', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pullela Gopichand') AND birth_month_day = '11-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Robin Uthappa', '1985-11-11', '11-11', 'Cricketer', 'Orange Cap IPL 2014, IPL star for KKR and CSK, stylish right-hand batsman', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Robin Uthappa') AND birth_month_day = '11-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Juhi Chawla', '1967-11-13', '11-13', 'Actress', 'Qayamat Se Qayamat Tak, Hum Hain Rahi Pyar Ke, Yes Boss, Darr, IPL co-owner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Juhi Chawla') AND birth_month_day = '11-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ritesh Agarwal', '1993-11-16', '11-16', 'Business Leader', 'Founder of OYO Rooms, youngest billionaire founder in India, Thiel Fellowship', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ritesh Agarwal') AND birth_month_day = '11-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sushmita Sen', '1975-11-19', '11-19', 'Actress', 'Miss Universe 1994, Main Hoon Na, Aarya (Disney+ series), first Indian Miss Universe', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sushmita Sen') AND birth_month_day = '11-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rani Lakshmibai', '1828-11-19', '11-19', 'Historical', 'Queen of Jhansi, 1857 uprising, died fighting British, symbol of Indian resistance', 'Indian', 'IN', 'historical', '1858-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rani Lakshmibai') AND birth_month_day = '11-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Zeenat Aman', '1951-11-19', '11-19', 'Actress', 'Hare Rama Hare Krishna, Satyam Shivam Sundaram, Don, Qurbani, sex symbol of 1970s', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Zeenat Aman') AND birth_month_day = '11-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Verghese Kurien', '1921-11-26', '11-26', 'Business Leader', 'Father of White Revolution, founder of Amul, Operation Flood, Bharat Ratna', 'Indian', 'IN', 'historical', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Verghese Kurien') AND birth_month_day = '11-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bappi Lahiri', '1952-11-27', '11-27', 'Music Composer', 'Disco King of India, Sharaabi, Thodi Si Bewafai, Jimmy Jimmy, gold jewellery icon', 'Indian', 'IN', 'historical', '2022-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bappi Lahiri') AND birth_month_day = '11-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Suresh Raina', '1986-11-27', '11-27', 'Cricketer', 'CSK captain, IPL''s most successful batsman, Mr. IPL, left-handed middle-order star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Suresh Raina') AND birth_month_day = '11-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Suniel Shetty', '1961-08-11', '08-11', 'Actor', 'Waqt Hamara Hai, Mohra, Dhadkan, Border, Main Hoon Na, Phir Hera Pheri', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Suniel Shetty') AND birth_month_day = '08-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Yami Gautam', '1988-11-28', '11-28', 'Actress', 'Vicky Donor, Kaabil, Uri: The Surgical Strike, Dasvi, Lost', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yami Gautam') AND birth_month_day = '11-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kartik Aaryan', '1990-11-22', '11-22', 'Actor', 'Pyaar Ka Punchnama, Sonu Ke Titu Ki Sweety, Luka Chuppi, Bhool Bhulaiyaa 2', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kartik Aaryan') AND birth_month_day = '11-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nana Patekar', '1951-01-01', '01-01', 'Actor', 'Parinda, Krantiveer, Welcome, Ab Tak Chhappan, Natsamrat, intense character actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nana Patekar') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Konkona Sen Sharma', '1979-12-03', '12-03', 'Actress', 'Page 3, Mr. and Mrs. Iyer, Wake Up Sid, A Death in the Gunj, Lipstick Under My Burkha', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Konkona Sen Sharma') AND birth_month_day = '12-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Boman Irani', '1959-12-02', '12-02', 'Actor', 'Munna Bhai MBBS, 3 Idiots, Don, Happy New Year, versatile Bollywood character actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Boman Irani') AND birth_month_day = '12-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Suresh Oberoi', '1946-12-01', '12-01', 'Actor', 'Ijaazat, Ram Lakhan, Jalwa, father of Vivek Oberoi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Suresh Oberoi') AND birth_month_day = '12-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Udit Narayan', '1955-12-01', '12-01', 'Singer', 'Papa Kehte Hain, Dilwale Dulhania Le Jayenge, Kuch Kuch Hota Hai, three National Awards', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Udit Narayan') AND birth_month_day = '12-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Somdev Devvarman', '1985-12-01', '12-01', 'Athlete', 'India''s top singles tennis player in 2000s, Davis Cup hero, Commonwealth gold 2010', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Somdev Devvarman') AND birth_month_day = '12-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dr. Rajendra Prasad', '1884-12-03', '12-03', 'Politician', 'First President of India, freedom fighter, Bihar Kesari, President 1950-1962', 'Indian', 'IN', 'historical', '1963-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dr. Rajendra Prasad') AND birth_month_day = '12-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shikhar Dhawan', '1985-12-05', '12-05', 'Cricketer', 'Gabbar, stylish Indian opener, fastest century in Champions Trophy 2013', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shikhar Dhawan') AND birth_month_day = '12-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shreyas Iyer', '1994-12-06', '12-06', 'Cricketer', 'Delhi and KKR captain, middle order batsman, leg before wicket specialist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shreyas Iyer') AND birth_month_day = '12-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'RP Singh', '1985-12-06', '12-06', 'Cricketer', 'Left-arm seamer, 2007 T20 World Cup hero, IPL Deccan Chargers', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('RP Singh') AND birth_month_day = '12-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shekhar Kapur', '1945-12-06', '12-06', 'Director', 'Masoom, Mr. India, Bandit Queen, Elizabeth (Hollywood), international director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shekhar Kapur') AND birth_month_day = '12-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sharmila Tagore', '1946-12-08', '12-08', 'Actress', 'Apur Sansar, An Evening in Paris, Aradhana, Mausam, film personality', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sharmila Tagore') AND birth_month_day = '12-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Janhvi Kapoor', '1997-03-06', '03-06', 'Actress', 'Dhadak, Gunjan Saxena: The Kargil Girl, Good Luck Jerry, daughter of Sridevi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Janhvi Kapoor') AND birth_month_day = '03-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shatrughan Sinha', '1946-12-09', '12-09', 'Actor', 'Kalia, Dostana, Naseeb, Shotgun Sinha, politician, BJP then Congress MP', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shatrughan Sinha') AND birth_month_day = '12-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dia Mirza', '1981-12-09', '12-09', 'Actress', 'Rehnaa Hai Terre Dil Mein, Dum, Lage Raho Munna Bhai, climate activist, UNEP Goodwill Ambassador', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dia Mirza') AND birth_month_day = '12-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rajesh Khanna', '1942-12-29', '12-29', 'Actor', 'First superstar of Bollywood, Anand, Aradhana, Kati Patang, 15 consecutive solo hits', 'Indian', 'IN', 'entertainment', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajesh Khanna') AND birth_month_day = '12-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dilip Kumar', '1922-12-11', '12-11', 'Actor', 'Tragedy King of Bollywood, Devdas, Mughal-e-Azam, Naya Daur, Bharat Ratna 2015', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dilip Kumar') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Govinda', '1963-12-21', '12-21', 'Actor', 'Hero No. 1, Coolie No. 1, Haseena Maan Jaayegi, dance king, iconic 1990s star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Govinda') AND birth_month_day = '12-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Tamannaah Bhatia', '1989-12-21', '12-21', 'Actress', 'Baahubali, Himmatwala, Devi, Odela Railway Station, Babli Bouncer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Tamannaah Bhatia') AND birth_month_day = '12-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mohammed Rafi', '1924-12-24', '12-24', 'Singer', 'One of greatest playback singers in history, versatile range, 26,000+ songs', 'Indian', 'IN', 'historical', '1980-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mohammed Rafi') AND birth_month_day = '12-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Naushad Ali', '1919-12-25', '12-25', 'Music Composer', 'Mughal-e-Azam music, Mother India, Baiju Bawra, greatest classical composer of Hindi cinema', 'Indian', 'IN', 'historical', '2006-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Naushad Ali') AND birth_month_day = '12-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anil Kapoor', '1959-12-24', '12-24', 'Actor', 'Mr. India, Tezaab, Ram Lakhan, Slumdog Millionaire, 24 (Fox), eternally young', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anil Kapoor') AND birth_month_day = '12-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Neeraj Chopra', '1997-12-24', '12-24', 'Athlete', 'Olympic gold Tokyo 2020 in javelin, first Indian to win Olympic gold in track and field', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Neeraj Chopra') AND birth_month_day = '12-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Richa Chadha', '1986-12-18', '12-18', 'Actress', 'Gangs of Wasseypur, Fukrey, Masaan, Mirzapur, Inside Edge', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Richa Chadha') AND birth_month_day = '12-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Riteish Deshmukh', '1978-12-17', '12-17', 'Actor', 'Masti, Grand Masti, Ek Villain, Humshakals, Baaghi 3, son of Vilasrao Deshmukh', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Riteish Deshmukh') AND birth_month_day = '12-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'John Abraham', '1972-12-17', '12-17', 'Actor', 'Dhoom, Dostana, New York, Force, Vicky Donor, Satyameva Jayate, Pathan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('John Abraham') AND birth_month_day = '12-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sameera Reddy', '1980-12-14', '12-14', 'Actress', 'Race, Musafir, Johnny Gaddaar, De Dana Dan, body positivity advocate', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sameera Reddy') AND birth_month_day = '12-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Manohar Parrikar', '1955-12-13', '12-13', 'Politician', 'Chief Minister of Goa, Defence Minister of India, IIT Bombay alumnus, clean politician', 'Indian', 'IN', 'historical', '2019-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Manohar Parrikar') AND birth_month_day = '12-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rajinikanth', '1950-12-12', '12-12', 'Actor', 'Superstar of Indian cinema, Baasha, Muthu, Sivaji, Enthiran, Kabali, global cult following', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajinikanth') AND birth_month_day = '12-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Yuvraj Singh', '1981-12-12', '12-12', 'Cricketer', 'Six sixes in an over, Player of Tournament 2011 World Cup, cancer survivor comeback', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yuvraj Singh') AND birth_month_day = '12-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Pranab Mukherjee', '1935-12-11', '12-11', 'Politician', '13th President of India, longest-serving Finance Minister, Bharat Ratna 2019', 'Indian', 'IN', 'public_figure', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Pranab Mukherjee') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Osho Rajneesh', '1931-12-11', '12-11', 'Philosopher', 'Controversial spiritual teacher, neo-sannyas movement, 650+ books, global following', 'Indian', 'IN', 'historical', '1990-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Osho Rajneesh') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Subramania Bharati', '1882-12-11', '12-11', 'Poet', 'Tamil poet and freedom fighter, Mahakavi Bharati, champion of women''s rights', 'Indian', 'IN', 'historical', '1921-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Subramania Bharati') AND birth_month_day = '12-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ravish Kumar', '1974-12-05', '12-05', 'Journalist', 'NDTV Prime Time anchor, Ramon Magsaysay Award 2019, champion of press freedom', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravish Kumar') AND birth_month_day = '12-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Arun Jaitley', '1952-12-28', '12-28', 'Politician', 'Finance Minister of India, BJP leader, lawyer, GST architect', 'Indian', 'IN', 'historical', '2019-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Arun Jaitley') AND birth_month_day = '12-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Dhirubhai Ambani', '1932-12-28', '12-28', 'Business Leader', 'Founded Reliance Industries, rags-to-riches story, democratised equity investment in India', 'Indian', 'IN', 'historical', '2002-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dhirubhai Ambani') AND birth_month_day = '12-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ratan Tata', '1937-12-28', '12-28', 'Business Leader', 'Chairman of Tata Group, Tata Nano, acquired Jaguar Land Rover, philanthropist, national icon', 'Indian', 'IN', 'public_figure', '2024-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ratan Tata') AND birth_month_day = '12-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Twinkle Khanna', '1974-12-29', '12-29', 'Actress', 'Barsaat, Mela, Badshah, author Mrs Funnybones, interior designer, wife of Akshay Kumar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Twinkle Khanna') AND birth_month_day = '12-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Amrish Puri', '1932-06-22', '06-22', 'Actor', 'Mogambo of Mr. India, Indiana Jones villain, greatest Bollywood villain ever', 'Indian', 'IN', 'historical', '2005-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amrish Puri') AND birth_month_day = '06-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rishi Kapoor', '1952-09-04', '09-04', 'Actor', 'Bobby, Amar Akbar Anthony, Chandni, Kapoor & Sons, Mulk, son of Raj Kapoor', 'Indian', 'IN', 'historical', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rishi Kapoor') AND birth_month_day = '09-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Manisha Koirala', '1970-08-16', '08-16', 'Actress', 'Saudagar, Bombay, 1942: A Love Story, Dil Se, Agni Sakshi, cancer survivor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Manisha Koirala') AND birth_month_day = '08-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Saif Ali Khan', '1970-08-16', '08-16', 'Actor', 'Dil Chahta Hai, Hum Tum, Omkaara, Love Aaj Kal, Sacred Games, Go Goa Gone', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Saif Ali Khan') AND birth_month_day = '08-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Urmila Matondkar', '1974-02-04', '02-04', 'Actress', 'Rangeela, Satya, Bhoot, Kaun, Pinjar, terrifying performances in 1990s', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Urmila Matondkar') AND birth_month_day = '02-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shabana Azmi', '1950-09-18', '09-18', 'Actress', 'Ankur, Arth, Sparsh, Paar, Fire, five National Award winner, activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shabana Azmi') AND birth_month_day = '09-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Smita Patil', '1955-10-17', '10-17', 'Actress', 'Manthan, Chakra, Mirch Masala, Arth, Namak Halaal, most talented actress of her era', 'Indian', 'IN', 'historical', '1986-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Smita Patil') AND birth_month_day = '10-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Naseeruddin Shah', '1950-07-20', '07-20', 'Actor', 'Sparsh, Mirch Masala, Masoom, A Wednesday, Iqbal, one of India''s finest actors', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Naseeruddin Shah') AND birth_month_day = '07-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Om Puri', '1950-10-18', '10-18', 'Actor', 'Ardh Satya, Jaane Bhi Do Yaaron, East is East, Gandhi, Charlie Wilson''s War', 'Indian', 'IN', 'historical', '2017-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Om Puri') AND birth_month_day = '10-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amol Palekar', '1944-11-24', '11-24', 'Actor', 'Chhoti Si Baat, Baton Baton Mein, Gol Maal, Naram Garam, everyman of Indian cinema', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amol Palekar') AND birth_month_day = '11-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nayanthara', '1984-11-18', '11-18', 'Actress', 'Lady Superstar, Chandramukhi, Ghajini, Atlee films, Jawan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nayanthara') AND birth_month_day = '11-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vivek Oberoi', '1976-09-03', '09-03', 'Actor', 'Company, Saathiya, Omkara, Prince, Zila Ghaziabad, PM Narendra Modi biopic', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vivek Oberoi') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dino Morea', '1975-09-03', '09-03', 'Actor', 'Raaz, Pyaar Ishq Aur Mohabbat, Calcutta Mail, The Empire (series)', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dino Morea') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Fardeen Khan', '1974-03-08', '03-08', 'Actor', 'Prem Aggan, No Entry, Jurm, Dev, Heyy Babyy, son of Feroze Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Fardeen Khan') AND birth_month_day = '03-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Raveena Tandon', '1974-10-26', '10-26', 'Actress', 'Mohra, Dilwale, Andaz Apna Apna, Daman, Maatr, heroine of 1990s', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Raveena Tandon') AND birth_month_day = '10-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hema Malini', '1948-10-16', '10-16', 'Actress', 'Dream Girl of Bollywood, Sholay, Seeta Aur Geeta, Baghban, BJP MP Mathura', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hema Malini') AND birth_month_day = '10-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mahesh Bhatt', '1948-09-20', '09-20', 'Director', 'Arth, Saaransh, Aashiqui, Sadak, Raaz producer, one of Bollywood''s most prolific directors', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mahesh Bhatt') AND birth_month_day = '09-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Varun Dhawan', '1987-04-24', '04-24', 'Actor', 'Student of the Year, Badlapur, Dilwale, Judwaa 2, Coolie No. 1, Bhediya', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Varun Dhawan') AND birth_month_day = '04-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kiara Advani', '1992-07-31', '07-31', 'Actress', 'Kabir Singh, Good Newwz, Laxmii, Shershaah, Bhool Bhulaiyaa 2, JugJugg Jeeyo', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kiara Advani') AND birth_month_day = '07-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mrunal Thakur', '1992-08-01', '08-01', 'Actress', 'Super 30, Jersey, Toofaan, Sita Ramam, Hi Nanna', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mrunal Thakur') AND birth_month_day = '08-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bhumi Pednekar', '1989-07-18', '07-18', 'Actress', 'Dum Laga Ke Haisha, Toilet: Ek Prem Katha, Bala, Badhaai Do, climate activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bhumi Pednekar') AND birth_month_day = '07-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kalki Koechlin', '1984-01-10', '01-10', 'Actress', 'Dev D, Zindagi Na Milegi Dobara, Yeh Jawaani Hai Deewani, Margarita with a Straw', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kalki Koechlin') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Raghuram Rajan', '1963-02-03', '02-03', 'Economist', 'Former Governor of Reserve Bank of India, IMF Chief Economist, Fault Lines author', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Raghuram Rajan') AND birth_month_day = '02-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Deepak Chahar', '1992-08-07', '08-07', 'Cricketer', 'CSK pace bowler, hat-trick in T20I vs Bangladesh 2019, nagging line and length', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Deepak Chahar') AND birth_month_day = '08-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Virender Sehwag', '1978-10-20', '10-20', 'Cricketer', 'Nawab of Najafgarh, two triple centuries in Tests, fastest scoring opener, 8586 Test runs', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Virender Sehwag') AND birth_month_day = '10-20'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gautam Gambhir', '1981-10-14', '10-14', 'Cricketer', 'Man of Tournament 2007 T20 World Cup, hero of 2011 World Cup final, BJP MP Delhi', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gautam Gambhir') AND birth_month_day = '10-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Zaheer Khan', '1978-10-07', '10-07', 'Cricketer', 'Best left-arm pace bowler India has produced, 2011 World Cup hero, 610 international wickets', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Zaheer Khan') AND birth_month_day = '10-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Chhatrapati Shivaji Maharaj', '1630-02-19', '02-19', 'Historical', 'Founder of Maratha Empire, guerrilla warfare pioneer, Hindavi Swarajya, national hero', 'Indian', 'IN', 'historical', '1680-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chhatrapati Shivaji Maharaj') AND birth_month_day = '02-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Jamsetji Tata', '1839-03-03', '03-03', 'Business Leader', 'Founder of Tata Group, Jamshedpur steel city, father of Indian industry', 'Indian', 'IN', 'historical', '1904-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jamsetji Tata') AND birth_month_day = '03-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Byju Raveendran', '1980-01-04', '01-04', 'Business Leader', 'Founder of BYJU''S edtech, largest Indian unicorn at peak, controversial rise and fall', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Byju Raveendran') AND birth_month_day = '01-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Girish Mathrubootham', '1975-04-05', '04-05', 'Business Leader', 'Founder of Freshworks, first Indian SaaS company to IPO on Nasdaq 2021', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Girish Mathrubootham') AND birth_month_day = '04-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Amit Trivedi', '1979-03-09', '03-09', 'Music Composer', 'Dev D, Dum Maaro Dum, Lootera, Queen, Udta Punjab, unconventional music', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amit Trivedi') AND birth_month_day = '03-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rakhi Sawant', '1978-11-25', '11-25', 'Actress', 'Controversial reality TV personality, item numbers, Bigg Boss multiple times', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rakhi Sawant') AND birth_month_day = '11-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Vinod Khanna', '1946-10-06', '10-06', 'Actor', 'Muqaddar Ka Sikandar, Amar Akbar Anthony, Qurbani, Dayavan, Insaaf', 'Indian', 'IN', 'historical', '2017-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vinod Khanna') AND birth_month_day = '10-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sanjay Kapoor', '1965-10-17', '10-17', 'Actor', 'Raja, Prem Qaidi, Sirf Tum, brother of Anil Kapoor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sanjay Kapoor') AND birth_month_day = '10-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Murli Manohar Joshi', '1934-01-05', '01-05', 'Politician', 'BJP veteran, HRD Minister, introduced Sanskrit in schools, physicist', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Murli Manohar Joshi') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Jaswant Singh', '1938-01-03', '01-03', 'Politician', 'BJP founder member, Finance Minister, External Affairs Minister, Defence Minister', 'Indian', 'IN', 'historical', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jaswant Singh') AND birth_month_day = '01-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chhagan Bhujbal', '1947-01-15', '01-15', 'Politician', 'NCP leader, Maharashtra Deputy Chief Minister, OBC champion', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chhagan Bhujbal') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Subhash Ghai', '1945-01-24', '01-24', 'Director', 'Karz, Hero, Ram Lakhan, Taal, Pardes, Khalnayak — showman of Bollywood', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Subhash Ghai') AND birth_month_day = '01-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Poonam Dhillon', '1962-04-18', '04-18', 'Actress', 'Noorie, Teri Kasam, Sohni Mahiwal, BJP politician', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Poonam Dhillon') AND birth_month_day = '04-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Raghav Juyal', '1994-01-10', '01-10', 'Actor', 'Dancer and actor, ABCD 2, Street Dancer 3D, Crockroaxz dance crew', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Raghav Juyal') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Madan Mohan', '1924-06-25', '06-25', 'Music Composer', 'Woh Subah Kabhi To Aayegi, Haqeeqat, Veer-Zaara posthumous, ghazal composer', 'Indian', 'IN', 'historical', '1975-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Madan Mohan') AND birth_month_day = '06-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Shyam Benegal', '1934-12-14', '12-14', 'Director', 'Ankur, Manthan, Bhumika, Susman, father of Indian parallel cinema', 'Indian', 'IN', 'historical', '2024-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shyam Benegal') AND birth_month_day = '12-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Aruna Asaf Ali', '1909-07-16', '07-16', 'Freedom Fighter', 'Hoisted flag at Quit India Movement 1942, first Delhi Chief Minister', 'Indian', 'IN', 'historical', '1996-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Aruna Asaf Ali') AND birth_month_day = '07-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jayant Narlikar', '1938-07-19', '07-19', 'Scientist', 'Astrophysicist, collaborated with Fred Hoyle, steady state cosmology, Padma Vibhushan', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jayant Narlikar') AND birth_month_day = '07-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rohit Bal', '1961-01-26', '01-26', 'Fashion Designer', 'Gudda, leading Indian fashion designer, lotus motif, bridal couture', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rohit Bal') AND birth_month_day = '01-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Remo DSouza', '1974-04-02', '04-02', 'Director', 'ABCD, ABCD 2, Street Dancer 3D, choreographer, dance film pioneer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Remo DSouza') AND birth_month_day = '04-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prosenjit Chatterjee', '1962-09-30', '09-30', 'Actor', 'Superstar of Bengali cinema, 300+ films, Chokher Bali, Autograph', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prosenjit Chatterjee') AND birth_month_day = '09-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mani Shankar Aiyar', '1941-01-10', '01-10', 'Politician', 'Congress leader, diplomat, author, IFS officer, Rajiv Gandhi aide', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mani Shankar Aiyar') AND birth_month_day = '01-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Charu Majumdar', '1918-01-15', '01-15', 'Historical', 'Founded Naxalite movement in India, Naxalbari uprising 1967, revolutionary leader', 'Indian', 'IN', 'historical', '1972-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Charu Majumdar') AND birth_month_day = '01-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'VK Krishna Menon', '1896-05-03', '05-03', 'Politician', 'India''s Defence Minister, UN representative, nationalist statesman, anti-colonialism', 'Indian', 'IN', 'historical', '1974-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('VK Krishna Menon') AND birth_month_day = '05-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Ravindra Dave', '1920-02-01', '02-01', 'Director', 'Gujarati and Hindi film director, Vikramaditya, Shree 420 assistant director', 'Indian', 'IN', 'historical', '1995-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravindra Dave') AND birth_month_day = '02-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rati Agnihotri', '1960-02-10', '02-10', 'Actress', 'Ek Duje Ke Liye, Hum Kisise Kum Naheen, Mera Daaman, popular 1980s actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rati Agnihotri') AND birth_month_day = '02-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Meena Kumari', '1933-08-01', '08-01', 'Actress', 'Tragedy Queen, Pakeezah, Sahib Bibi Aur Ghulam, Baiju Bawra, greatest Indian actress', 'Indian', 'IN', 'historical', '1972-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Meena Kumari') AND birth_month_day = '08-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Leela Naidu', '1940-08-01', '08-01', 'Actress', 'Listed Vogue most beautiful women 1954, Anuradha, The Householder', 'Indian', 'IN', 'historical', '2009-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Leela Naidu') AND birth_month_day = '08-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Charu Sharma', '1968-02-06', '02-06', 'Journalist', 'ESPN-Star Sports cricket commentator and anchor, Face of the Game', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Charu Sharma') AND birth_month_day = '02-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'SP Hinduja', '1935-02-19', '02-19', 'Business Leader', 'Co-chairman of Hinduja Group, one of Britain''s richest Indians', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('SP Hinduja') AND birth_month_day = '02-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Padmini Kolhapure', '1965-11-01', '11-01', 'Actress', 'Prem Rog, Vidhaata, Pyaar Jhukta Nahin, sister of Shivangi Kolhapure', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Padmini Kolhapure') AND birth_month_day = '11-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Uttam Kumar', '1926-09-03', '09-03', 'Actor', 'Mahanayak of Bengali cinema, Nayak, Chowringhee, Antony Firingee', 'Indian', 'IN', 'historical', '1980-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Uttam Kumar') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Vinayak Damodar Savarkar', '1883-05-28', '05-28', 'Historical', 'Veer Savarkar, Hindu Mahasabha, Hindutva ideology, 1857 First War of Independence book', 'Indian', 'IN', 'historical', '1966-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vinayak Damodar Savarkar') AND birth_month_day = '05-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Jayalalithaa', '1948-02-24', '02-24', 'Politician', 'Chief Minister of Tamil Nadu six times, Amma, AIADMK leader, actress turned politician', 'Indian', 'IN', 'historical', '2016-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jayalalithaa') AND birth_month_day = '02-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Sakharam Ganesh Deuskar', '1869-03-01', '03-01', 'Historical', 'Bengali journalist and freedom fighter, Desher Katha, nationalist literature', 'Indian', 'IN', 'historical', '1912-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sakharam Ganesh Deuskar') AND birth_month_day = '03-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Saeed Jaffrey', '1929-01-08', '01-08', 'Actor', 'Shatranj Ke Khilari, The Man Who Would Be King, My Beautiful Laundrette, Gandhi', 'Indian', 'IN', 'historical', '2015-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Saeed Jaffrey') AND birth_month_day = '01-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mallika Sherawat', '1976-10-24', '10-24', 'Actress', 'Khwahish, Murder, Pyaar Ke Side Effects, Politics of Love, bold Bollywood actress', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mallika Sherawat') AND birth_month_day = '10-24'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nandita Das', '1969-07-07', '07-07', 'Actress', 'Fire, Earth, Bawandar, Manto director, human rights activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nandita Das') AND birth_month_day = '07-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Farouk Engineer', '1938-02-25', '02-25', 'Cricketer', 'India''s greatest wicketkeeper-batsman of 1960s-70s, flamboyant opening batsman', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Farouk Engineer') AND birth_month_day = '02-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rohan Bopanna', '1980-03-04', '03-04', 'Athlete', 'India''s top doubles tennis player, ATP Masters champion, oldest world No.1 in history', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rohan Bopanna') AND birth_month_day = '03-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rahul Bose', '1967-07-27', '07-27', 'Actor', 'Mr and Mrs Iyer, Chameli, Jhoom Barabar Jhoom, Angry Indian Goddesses, activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rahul Bose') AND birth_month_day = '07-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gul Panag', '1979-01-03', '01-03', 'Actress', 'Miss India 1999, Dor, Manorama Six Feet Under, Turning 30, social activist', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gul Panag') AND birth_month_day = '01-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rakesh Roshan', '1949-09-06', '09-06', 'Director', 'Kaho Na Pyaar Hai, Koi Mil Gaya, Krrish franchise, father of Hrithik Roshan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rakesh Roshan') AND birth_month_day = '09-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Madhavan', '1970-06-01', '06-01', 'Actor', 'Alaipayuthey, Tanu Weds Manu, 3 Idiots, Rocketry director and actor, Shaitaan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Madhavan') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Karthi', '1977-05-25', '05-25', 'Actor', 'Paruthiveeran, Paiyaa, Siruthai, Kaashmora, Viruman, brother of Suriya', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Karthi') AND birth_month_day = '05-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Simi Garewal', '1947-10-17', '10-17', 'Actress', 'Mera Naam Joker, Siddhartha, India''s Most Desirable TV show host', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Simi Garewal') AND birth_month_day = '10-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vishal Bharadwaj', '1965-08-04', '08-04', 'Director', 'Maqbool, Omkara, Haider, Kaminey, Matru Ki Bijlee Ka Mandola, Shakespeare trilogy', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vishal Bharadwaj') AND birth_month_day = '08-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dibakar Banerjee', '1968-04-26', '04-26', 'Director', 'Khosla Ka Ghosla, Oye Lucky Lucky Oye, Love Sex aur Dhokha, Shanghai', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dibakar Banerjee') AND birth_month_day = '04-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nagraj Manjule', '1979-04-12', '04-12', 'Director', 'Fandry, Sairat — biggest Marathi film ever made, National Award winner', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nagraj Manjule') AND birth_month_day = '04-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chetan Sharma', '1966-01-03', '01-03', 'Cricketer', 'First Indian to take hat-trick in ODI World Cup 1987, India selector', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chetan Sharma') AND birth_month_day = '01-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sudha Kongara', '1978-05-03', '05-03', 'Director', 'Soorarai Pottru, Irudhi Suttru, National Award winning director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sudha Kongara') AND birth_month_day = '05-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Meena', '1980-09-16', '09-16', 'Actress', 'Sethu, Thambi, Vinnaithaandi Varuvaayaa, Basha, Rajinikanth heroine', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Meena') AND birth_month_day = '09-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jothika', '1977-10-18', '10-18', 'Actress', 'Kaadhale Nimmadhi, Sillunu Oru Kaadhal, 36 Vayadhinile, Magalir Mattum, comeback queen', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jothika') AND birth_month_day = '10-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Mysskin', '1978-05-06', '05-06', 'Director', 'Anjathe, Yuddham Sei, Pisaasa, Thupparivaalan, unique Tamil noir director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mysskin') AND birth_month_day = '05-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Visu', '1934-05-18', '05-18', 'Director', 'Tamil family drama director, Mundhanai Mudichu, Samsaram Athu Minsaram', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Visu') AND birth_month_day = '05-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kunal Nayyar', '1981-05-30', '05-30', 'Actor', 'Raj Koothrappali in The Big Bang Theory, Indian-British actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kunal Nayyar') AND birth_month_day = '05-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Varalaxmi Sarathkumar', '1987-10-19', '10-19', 'Actress', 'Nibunan, Sandakozhi 2, Monster, Cobra, daughter of Sarathkumar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Varalaxmi Sarathkumar') AND birth_month_day = '10-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Siddharth', '1979-04-17', '04-17', 'Actor', 'Boys, Rang De Basanti, Bommarillu, Chashme Buddoor, multi-lingual actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Siddharth') AND birth_month_day = '04-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nakul Dev Mahajan', '1984-05-17', '05-17', 'Actor', 'Indian-American chef and actor, Top Chef, represents India in US', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nakul Dev Mahajan') AND birth_month_day = '05-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anees Bazmee', '1962-06-08', '06-08', 'Director', 'No Entry, Welcome, Singh Is Kinng, Ready, Bhool Bhulaiyaa 2 and 3', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anees Bazmee') AND birth_month_day = '06-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Kabir Khan', '1971-06-01', '06-01', 'Director', 'Kabul Express, New York, Ek Tha Tiger, Bajrangi Bhaijaan, 83', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kabir Khan') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Nag Ashwin', '1986-06-07', '06-07', 'Director', 'Mahanati, Kalki 2898-AD — largest Indian sci-fi film ever made', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Nag Ashwin') AND birth_month_day = '06-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Keerti Suresh', '1992-10-17', '10-17', 'Actress', 'Saamy, Remo, Thaana Serndha Koottam, Penguin, Miss India, National Award', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Keerti Suresh') AND birth_month_day = '10-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ananya Panday', '1998-10-30', '10-30', 'Actress', 'Student of the Year 2, Gehraiyaan, Kho Gaye Hum Kahan, daughter of Chunky Pandey', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ananya Panday') AND birth_month_day = '10-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shanaya Kapoor', '1999-11-03', '11-03', 'Actress', 'Bedhadak debutante, daughter of Sanjay Kapoor, fashion icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shanaya Kapoor') AND birth_month_day = '11-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ibrahim Ali Khan', '2001-12-01', '12-01', 'Actor', 'Son of Saif Ali Khan and Amrita Singh, upcoming Bollywood debutant', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ibrahim Ali Khan') AND birth_month_day = '12-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shankar', '1963-08-17', '08-17', 'Director', 'Gentleman, Mudhalvan, Enthiran, I, 2.0, Indian 2, Tamil blockbuster director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shankar') AND birth_month_day = '08-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'KV Vijayendra Prasad', '1951-06-01', '06-01', 'Author', 'Screenwriter of Baahubali, RRR, Bajrangi Bhaijaan, father of SS Rajamouli', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('KV Vijayendra Prasad') AND birth_month_day = '06-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Atlee', '1986-09-03', '09-03', 'Director', 'Raja Rani, Theri, Mersal, Bigil, Jawan — billion-dollar club Bollywood director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Atlee') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Saroj Khan', '1948-11-22', '11-22', 'Choreographer', 'Masterji, choreographed Madhuri Dixit and Sridevi, Dola Re Dola, Ek Do Teen', 'Indian', 'IN', 'historical', '2020-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Saroj Khan') AND birth_month_day = '11-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rohit Shetty', '1973-03-14', '03-14', 'Director', 'Golmaal series, Singham, Simmba, Sooryavanshi, Indian Police Universe creator', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rohit Shetty') AND birth_month_day = '03-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Puri Jagannadh', '1966-07-01', '07-01', 'Director', 'Pokiri, Businessman, iSmart Shankar, Liger, Telugu powerhouse director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Puri Jagannadh') AND birth_month_day = '07-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Thaman S', '1984-07-21', '07-21', 'Music Composer', 'Top Telugu music composer, Ala Vaikunthapurramuloo, Pushpa, Sarkaru Vaari Paata', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Thaman S') AND birth_month_day = '07-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Anirudh Ravichander', '1990-10-16', '10-16', 'Music Composer', 'Kolaveri Di, Kaththi, Kabali, Vikram, Vettaiyan, most-streamed Tamil composer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Anirudh Ravichander') AND birth_month_day = '10-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'DSP Devi Sri Prasad', '1979-08-04', '08-04', 'Music Composer', 'Arya, Race Gurram, Allu Arjun films, Pushpa composer of Oo Antava', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('DSP Devi Sri Prasad') AND birth_month_day = '08-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'MM Keeravani', '1961-07-04', '07-04', 'Music Composer', 'Baahubali soundtrack, RRR Naatu Naatu Oscar winner, cousin of SS Rajamouli', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('MM Keeravani') AND birth_month_day = '07-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Chitraa', '1983-07-13', '07-13', 'Singer', 'Popular Tamil and Telugu playback singer, Oru Maalai, Thillalangadi songs', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Chitraa') AND birth_month_day = '07-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Akkineni Nagarjuna', '1959-08-29', '08-29', 'Actor', 'King Nagarjuna, Shiva, Ninne Pelladatha, Manam, Oopiri, son of ANR', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Akkineni Nagarjuna') AND birth_month_day = '08-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Simbu', '1983-02-03', '02-03', 'Actor', 'Vinnaithaandi Varuvaayaa, Vaalu, Eeswaran, Vendhu Thanindhadha Kaadu', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Simbu') AND birth_month_day = '02-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vijay Sethupathi', '1978-01-16', '01-16', 'Actor', 'Pizza, 96, Makkal Selvan, Vikram, Jawan, most versatile Tamil character actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vijay Sethupathi') AND birth_month_day = '01-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Dhananjay', '1983-08-06', '08-06', 'Actor', 'Mufti, Godhi Banna Sadharana Mykattu, KGF villain, National Award Kannada', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Dhananjay') AND birth_month_day = '08-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rakshit Shetty', '1982-09-11', '09-11', 'Actor', 'Ulidavaru Kandanthe, Kirik Party, 777 Charlie — biggest Kannada film globally', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rakshit Shetty') AND birth_month_day = '09-11'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sudeep', '1973-09-02', '09-02', 'Actor', 'Kichcha Sudeep, Huccha, Eega, Dabangg 3, most popular Kannada actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sudeep') AND birth_month_day = '09-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Puneeth Rajkumar', '1975-03-17', '03-17', 'Actor', 'Appu, Raajakumara, James, Power Star of Kannada cinema, son of Rajkumar', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Puneeth Rajkumar') AND birth_month_day = '03-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Darshan Thoogudeepa', '1977-02-16', '02-16', 'Actor', 'Challenging Star, Robert, Kranti, Roberrt — top Kannada action star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Darshan Thoogudeepa') AND birth_month_day = '02-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shiva Rajkumar', '1962-07-12', '07-12', 'Actor', 'Annavru, Mast Mast, Jai Maruthi, Bhairathi Ranagal, son of Dr Rajkumar', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shiva Rajkumar') AND birth_month_day = '07-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ravichandran', '1961-04-05', '04-05', 'Actor', 'Crazy Star, Shruthi, Preethigagi, director and producer in Kannada cinema', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ravichandran') AND birth_month_day = '04-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sneha Ullal', '1985-09-23', '09-23', 'Actress', 'Lucky, Ullasamga Utsahamga, Arabic Kuthu, introduced by Salman Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sneha Ullal') AND birth_month_day = '09-23'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ameesha Patel', '1976-06-09', '06-09', 'Actress', 'Kaho Na Pyaar Hai, Gadar, Humraaz, Bhool Bhulaiyaa, Gadar 2', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ameesha Patel') AND birth_month_day = '06-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ranjit Bawa', '1990-09-22', '09-22', 'Singer', 'Popular Punjabi singer, Mitran Di Chatri, Jatt Brothers, Punjabi music star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ranjit Bawa') AND birth_month_day = '09-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Hardy Sandhu', '1988-09-25', '09-25', 'Singer', 'Soch, Hornn Blow, Naah, Bijlee Bijlee, Yaar Ni Milya — Punjabi pop star', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hardy Sandhu') AND birth_month_day = '09-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gurdas Maan', '1957-01-04', '01-04', 'Singer', 'Legend of Punjabi music, Dil Darda, Ki Banu Duniya Da, Punjab cultural ambassador', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gurdas Maan') AND birth_month_day = '01-04'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Diljit Dosanjh', '1984-01-06', '01-06', 'Singer', 'Punjab Da Governor, Ikk Kudi, Do You Know, Udta Punjab actor, Coachella debut', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Diljit Dosanjh') AND birth_month_day = '01-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ap Dhillon', '1994-07-28', '07-28', 'Singer', 'Brown Munde, Excuses, With You, global Punjabi music sensation', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ap Dhillon') AND birth_month_day = '07-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Badshah', '1985-11-19', '11-19', 'Singer', 'Kar Gayi Chull, DJ Waley Babu, Genda Phool, Jugnu, king of Indian rap', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Badshah') AND birth_month_day = '11-19'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Guru Randhawa', '1991-08-30', '08-30', 'Singer', 'Suit Suit, High Rated Gabru, Ban Ja Rani, most streamed Punjabi artist 2017', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Guru Randhawa') AND birth_month_day = '08-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Darshan Raval', '1993-09-14', '09-14', 'Singer', 'Tera Zikr, Chogada, Leja Re, Dil Ko Karaar Aaya, romantic Hindi singer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Darshan Raval') AND birth_month_day = '09-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jubin Nautiyal', '1989-06-14', '06-14', 'Singer', 'Tum Hi Aana, Lut Gaye, Raataan Lambiyan, Kehdi Ki Taang, romantic voice', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jubin Nautiyal') AND birth_month_day = '06-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Asees Kaur', '1989-09-15', '09-15', 'Singer', 'Ik Vaari Aa, Lag Ja Gale, Teri Ban Jaungi, rising female Bollywood voice', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Asees Kaur') AND birth_month_day = '09-15'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'B Praak', '1985-09-13', '09-13', 'Singer', 'Filhall, Mann Bharrya, Ik Vaari Aa, Qismat, soulful Punjabi singer', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('B Praak') AND birth_month_day = '09-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jassie Gill', '1988-03-27', '03-27', 'Singer', 'Patt Lainge, So High, Backbone, Punjabi singer and Bollywood actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jassie Gill') AND birth_month_day = '03-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Alok Nath', '1956-07-10', '07-10', 'Actor', 'Sanskaari Papa of Bollywood, DDLJ, Hum Saath Saath Hain, beta character', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Alok Nath') AND birth_month_day = '07-10'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Piyush Mishra', '1963-07-01', '07-01', 'Actor', 'Gulaal, Gangs of Wasseypur, Raajneeti, actor-lyricist-playwright', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Piyush Mishra') AND birth_month_day = '07-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Saurabh Shukla', '1966-10-01', '10-01', 'Actor', 'Satya, Jolly LLB, Barfi, PK, character actor who steals every scene', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Saurabh Shukla') AND birth_month_day = '10-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Rajpal Yadav', '1971-03-16', '03-16', 'Actor', 'Chup Chup Ke, Bhagam Bhag, Hungama, Bhool Bhulaiyaa, comedy king', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rajpal Yadav') AND birth_month_day = '03-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Johnny Lever', '1957-08-14', '08-14', 'Actor', 'Greatest comedian in Bollywood history, Baazigar, Kuch Kuch Hota Hai, 300+ films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Johnny Lever') AND birth_month_day = '08-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shreyas Talpade', '1976-10-27', '10-27', 'Actor', 'Iqbal, Dor, Om Shanti Om, Golmaal Returns, Welcome to the Jungle', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shreyas Talpade') AND birth_month_day = '10-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sachin Pilgaonkar', '1957-08-17', '08-17', 'Actor', 'Child actor turned leading man in Marathi and Hindi films, director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sachin Pilgaonkar') AND birth_month_day = '08-17'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gulshan Grover', '1955-09-21', '09-21', 'Actor', 'Bad Man of Bollywood, Ram Lakhan, Teri Meherbaniyan, Aitraaz, 400+ films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gulshan Grover') AND birth_month_day = '09-21'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Shakti Kapoor', '1952-09-03', '09-03', 'Actor', 'Crime Master Gogo in Andaz Apna Apna, Betaab, Himmatwala villain, 400+ films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Shakti Kapoor') AND birth_month_day = '09-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Ranjeet', '1944-07-12', '07-12', 'Actor', 'Most prolific villain in Bollywood, Khel Khel Mein, Ram Balram, 430+ films', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Ranjeet') AND birth_month_day = '07-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Kader Khan', '1937-10-22', '10-22', 'Actor', 'Prolific dialogue writer and comedian, Muqaddar Ka Sikandar, Coolie, Amar Akbar Anthony', 'Indian', 'IN', 'historical', '2018-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Kader Khan') AND birth_month_day = '10-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Asrani', '1941-01-01', '01-01', 'Actor', 'Sholay jailer, prolific Hindi film comedian and character actor', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Asrani') AND birth_month_day = '01-01'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sanjay Khan', '1941-01-03', '01-03', 'Actor', 'Mela, Ek Phool Do Mali, Tipu Sultan TV series producer, father of Zayed Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sanjay Khan') AND birth_month_day = '01-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Zayed Khan', '1980-07-06', '07-06', 'Actor', 'Main Hoon Na, Shabd, Dus, son of Sanjay Khan', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Zayed Khan') AND birth_month_day = '07-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Akbar Khan', '1957-11-06', '11-06', 'Director', 'Taj Mahal An Eternal Love Story, Razia Sultan, historical epic director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Akbar Khan') AND birth_month_day = '11-06'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Prakash Raj', '1965-03-26', '03-26', 'Actor', 'Multi-lingual actor, Singham villain, Wanted, Dabang — 5 National Awards', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Prakash Raj') AND birth_month_day = '03-26'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Sriram Raghavan', '1968-11-22', '11-22', 'Director', 'Ek Hasina Thi, Johnny Gaddaar, Badlapur, Andhadhun, Merry Christmas', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Sriram Raghavan') AND birth_month_day = '11-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Neeraj Pandey', '1973-11-27', '11-27', 'Director', 'A Wednesday, Special 26, Baby, M.S. Dhoni biopic, Rustom', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Neeraj Pandey') AND birth_month_day = '11-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Vetrimaaran', '1977-11-28', '11-28', 'Director', 'Polladhavan, Aadukalam, Visaranai, Vada Chennai, Viduthalai — Tamil new wave icon', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Vetrimaaran') AND birth_month_day = '11-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Bala', '1969-11-09', '11-09', 'Director', 'Sethu, Pithamagan, Naan Kadavul, Avan Ivan, Paradesi, unique Tamil auteur', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bala') AND birth_month_day = '11-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Alphons Kannanthanam', '1955-11-25', '11-25', 'Politician', 'IAS officer, Kerala cadre, Union Minister of Tourism, demolition man', 'Indian', 'IN', 'public_figure'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Alphons Kannanthanam') AND birth_month_day = '11-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Amir Khusrau', '1253-06-30', '06-30', 'Historical', 'Sufi poet, musician, Father of Qawwali, Khyal, Tarana, disciple of Nizamuddin Auliya', 'Indian', 'IN', 'historical', '1325-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Amir Khusrau') AND birth_month_day = '06-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Fakir Mohan Senapati', '1843-01-13', '01-13', 'Author', 'Father of modern Odia literature, Chha Mana Atha Guntha, Odia novel pioneer', 'Indian', 'IN', 'historical', '1918-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Fakir Mohan Senapati') AND birth_month_day = '01-13'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Babasaheb Purandare', '1922-07-29', '07-29', 'Author', 'Shivshahir, Padma Vibhushan, greatest authority on Chhatrapati Shivaji Maharaj', 'Indian', 'IN', 'historical', '2021-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Babasaheb Purandare') AND birth_month_day = '07-29'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'V. Shantaram', '1901-11-18', '11-18', 'Director', 'Prabhat Film Company, Do Aankhen Barah Haath, Navrang, Jhanak Jhanak Payal Baje', 'Indian', 'IN', 'historical', '1990-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('V. Shantaram') AND birth_month_day = '11-18'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'K. Asif', '1922-08-14', '08-14', 'Director', 'Mughal-e-Azam director, greatest Indian historical epic, 16 years to make', 'Indian', 'IN', 'historical', '1971-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('K. Asif') AND birth_month_day = '08-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mehboob Khan', '1907-09-09', '09-09', 'Director', 'Mother India director, Andaz, Aan, one of Bollywood''s greatest directors', 'Indian', 'IN', 'historical', '1964-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mehboob Khan') AND birth_month_day = '09-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Bimal Roy', '1909-07-12', '07-12', 'Director', 'Do Bigha Zamin, Devdas, Madhumati, Bandini, master of Indian social realism', 'Indian', 'IN', 'historical', '1966-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Bimal Roy') AND birth_month_day = '07-12'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Hrishikesh Mukherjee', '1922-09-30', '09-30', 'Director', 'Anand, Golmaal, Chupke Chupke, Gol Maal, Khubsoorat — greatest comedy director', 'Indian', 'IN', 'historical', '2006-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Hrishikesh Mukherjee') AND birth_month_day = '09-30'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'BR Chopra', '1914-04-22', '04-22', 'Director', 'Naya Daur, Waqt, Mahabharat TV series, founder of BR Films', 'Indian', 'IN', 'historical', '2008-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('BR Chopra') AND birth_month_day = '04-22'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Yash Raj Chopra', '1932-09-27', '09-27', 'Director', 'Silsila, Chandni, DDLJ producer, Dil To Pagal Hai, romantic filmmaking king', 'Indian', 'IN', 'historical', '2012-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Yash Raj Chopra') AND birth_month_day = '09-27'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Mrinal Sen', '1923-05-14', '05-14', 'Director', 'Bhuvan Shome, Chorus, Akaler Sandhane, Khandahar, parallel cinema pioneer', 'Indian', 'IN', 'historical', '2018-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Mrinal Sen') AND birth_month_day = '05-14'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Adoor Gopalakrishnan', '1941-07-03', '07-03', 'Director', 'Swayamvaram, Elippathayam, Mukhamukham, Daisy, greatest Malayalam director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Adoor Gopalakrishnan') AND birth_month_day = '07-03'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Girish Kasaravalli', '1950-01-05', '01-05', 'Director', 'Ghatashraddha, Tabarana Kathe, Dweepa, Haseena, National Award winning Kannada director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Girish Kasaravalli') AND birth_month_day = '01-05'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'GV Iyer', '1917-09-25', '09-25', 'Director', 'Hamsa Geethe, Adi Shankaracharya — first film entirely in Sanskrit', 'Indian', 'IN', 'historical', '2003-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('GV Iyer') AND birth_month_day = '09-25'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Jahnu Barua', '1952-12-07', '12-07', 'Director', 'Halodhia Choraye Baodhan Khai, It Rained All Night, leading Assamese director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Jahnu Barua') AND birth_month_day = '12-07'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'Rituparno Ghosh', '1963-08-31', '08-31', 'Director', 'Unishe April, Dahan, Utsab, Chokher Bali, Raincoat, greatest Bengali director of era', 'Indian', 'IN', 'historical', '2013-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Rituparno Ghosh') AND birth_month_day = '08-31'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Priyadarshan', '1957-07-08', '07-08', 'Director', 'Hera Pheri, Hulchul, Hungama, Bhagam Bhag, Kanche, Malayalam-Bollywood director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Priyadarshan') AND birth_month_day = '07-08'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'K. Balachander', '1930-07-09', '07-09', 'Director', 'Apoorva Raagangal, Aval Appadithan, Ninaithale Inikkum, mentor of Rajinikanth and Kamal', 'Indian', 'IN', 'historical', '2014-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('K. Balachander') AND birth_month_day = '07-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier, death_date)
SELECT 'J. Om Prakash', '1926-02-02', '02-02', 'Director', 'Aayee Milan Ki Bela, Aandhi, Aarti, Apnapan, produced Aap Ki Kasam', 'Indian', 'IN', 'historical', '2014-01-01'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('J. Om Prakash') AND birth_month_day = '02-02'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Farah Khan', '1965-01-09', '01-09', 'Director', 'Main Hoon Na, Om Shanti Om, Tees Maar Khan, choreographer turned director', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Farah Khan') AND birth_month_day = '01-09'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'David Dhawan', '1955-08-16', '08-16', 'Director', 'Coolie No. 1, Hero No. 1, Judwaa, No Entry, comedy factory of 1990s, father of Varun', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('David Dhawan') AND birth_month_day = '08-16'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'N Chandra', '1958-04-28', '04-28', 'Director', 'Tezaab, Parinda, Narsimha, Nishchaiy — action thriller director of 1980s-90s', 'Indian', 'IN', 'entertainment'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('N Chandra') AND birth_month_day = '04-28'
);
INSERT INTO celebrity_sitelinks (name, birth_date, birth_month_day, occupation, known_for, nationality, nationality_code, tier)
SELECT 'Gautam Adani', '1962-06-24', '06-24', 'Businessman', 'Chairman of Adani Group, one of India''s largest conglomerates spanning ports, airports, energy, and infrastructure. Has been Asia''s richest person.', 'Indian', 'IN', 'achievement'
WHERE NOT EXISTS (
  SELECT 1 FROM celebrity_sitelinks
  WHERE lower(name) = lower('Gautam Adani') AND birth_month_day = '06-24'
);

-- Verification
-- SELECT count(*) FROM celebrity_sitelinks WHERE nationality_code = 'IN';
-- SELECT name, occupation, wikipedia_url FROM celebrity_sitelinks WHERE birth_month_day = '06-25';
