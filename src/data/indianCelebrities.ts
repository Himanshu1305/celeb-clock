// MIGRATED: all 598 entries have been enriched into celebrity_sitelinks via
// scripts/migrations/2026-07-indian-celebrities.sql (nationality_code='IN').
// This file is kept for reference only — no production code imports it.

export interface IndianCelebrity {
  name: string;
  birth_date: string; // YYYY-MM-DD
  category: string;
  known_for: string;
  nationality: 'Indian';
  birth_year: number;
  death_year?: number | null;
  tier: 'entertainment' | 'public_figure' | 'historical';
}

export const INDIAN_CELEBRITIES: IndianCelebrity[] = [

  // ============================================================
  // HISTORICAL FIGURES & FREEDOM FIGHTERS (60)
  // ============================================================
  { name: 'Mahatma Gandhi', birth_date: '1869-10-02', category: 'Freedom Fighter', known_for: 'Father of the Nation, leader of Indian independence movement through nonviolent civil disobedience', nationality: 'Indian', birth_year: 1869, death_year: 1948, tier: 'historical' },
  { name: 'Jawaharlal Nehru', birth_date: '1889-11-14', category: 'Politician', known_for: 'First Prime Minister of India, architect of modern India, Children\'s Day celebrated on his birthday', nationality: 'Indian', birth_year: 1889, death_year: 1964, tier: 'historical' },
  { name: 'Subhas Chandra Bose', birth_date: '1897-01-23', category: 'Freedom Fighter', known_for: 'Netaji — leader of Indian National Army, "Give me blood and I will give you freedom"', nationality: 'Indian', birth_year: 1897, death_year: 1945, tier: 'historical' },
  { name: 'Bhimrao Ambedkar', birth_date: '1891-04-14', category: 'Social Reformer', known_for: 'Father of Indian Constitution, champion of Dalit rights, jurist and economist', nationality: 'Indian', birth_year: 1891, death_year: 1956, tier: 'historical' },
  { name: 'Rabindranath Tagore', birth_date: '1861-05-07', category: 'Poet', known_for: 'Nobel Prize in Literature 1913, wrote Jana Gana Mana, Gitanjali, Rabindra Sangeet', nationality: 'Indian', birth_year: 1861, death_year: 1941, tier: 'historical' },
  { name: 'Swami Vivekananda', birth_date: '1863-01-12', category: 'Philosopher', known_for: 'Vedanta philosopher, introduced Hinduism to the West at Chicago Parliament of Religions 1893', nationality: 'Indian', birth_year: 1863, death_year: 1902, tier: 'historical' },
  { name: 'Bal Gangadhar Tilak', birth_date: '1856-07-23', category: 'Freedom Fighter', known_for: '"Swaraj is my birthright" — first leader of Indian independence movement', nationality: 'Indian', birth_year: 1856, death_year: 1920, tier: 'historical' },
  { name: 'Bhagat Singh', birth_date: '1907-09-28', category: 'Freedom Fighter', known_for: 'Revolutionary freedom fighter, martyred at age 23, symbol of Indian resistance', nationality: 'Indian', birth_year: 1907, death_year: 1931, tier: 'historical' },
  { name: 'Sardar Vallabhbhai Patel', birth_date: '1875-10-31', category: 'Politician', known_for: 'Iron Man of India, unified 562 princely states into Indian Union, first Home Minister', nationality: 'Indian', birth_year: 1875, death_year: 1950, tier: 'historical' },
  { name: 'Aryabhata', birth_date: '0476-04-13', category: 'Mathematician', known_for: 'Ancient mathematician and astronomer, discovered zero and decimal system, calculated pi', nationality: 'Indian', birth_year: 476, death_year: 550, tier: 'historical' },
  { name: 'Chanakya', birth_date: '0371-01-01', category: 'Philosopher', known_for: 'Ancient Indian philosopher, economist, teacher of Chandragupta Maurya, wrote Arthashastra', nationality: 'Indian', birth_year: 371, death_year: 283, tier: 'historical' },
  { name: 'Maulana Abul Kalam Azad', birth_date: '1888-11-11', category: 'Freedom Fighter', known_for: 'Youngest President of Indian National Congress, first Education Minister of India', nationality: 'Indian', birth_year: 1888, death_year: 1958, tier: 'historical' },
  { name: 'Gopal Krishna Gokhale', birth_date: '1866-05-09', category: 'Freedom Fighter', known_for: 'Political mentor of Gandhi, social reformer, founder of Servants of India Society', nationality: 'Indian', birth_year: 1866, death_year: 1915, tier: 'historical' },
  { name: 'Lala Lajpat Rai', birth_date: '1865-01-28', category: 'Freedom Fighter', known_for: 'Lion of Punjab, led protest against Simon Commission, died from police lathi charge', nationality: 'Indian', birth_year: 1865, death_year: 1928, tier: 'historical' },
  { name: 'Bipin Chandra Pal', birth_date: '1858-11-07', category: 'Freedom Fighter', known_for: 'One of the Lal Bal Pal trio, champion of Swaraj and Swadeshi movements', nationality: 'Indian', birth_year: 1858, death_year: 1932, tier: 'historical' },
  { name: 'Annie Besant', birth_date: '1847-10-01', category: 'Freedom Fighter', known_for: 'First woman President of Indian National Congress, theosophist, Home Rule League founder', nationality: 'Indian', birth_year: 1847, death_year: 1933, tier: 'historical' },
  { name: 'Sarojini Naidu', birth_date: '1879-02-13', category: 'Freedom Fighter', known_for: 'Nightingale of India, poet, first woman President of Indian National Congress', nationality: 'Indian', birth_year: 1879, death_year: 1949, tier: 'historical' },
  { name: 'Chandra Shekhar Azad', birth_date: '1906-07-23', category: 'Freedom Fighter', known_for: 'Revolutionary freedom fighter, vowed never to be captured alive, died free', nationality: 'Indian', birth_year: 1906, death_year: 1931, tier: 'historical' },
  { name: 'Ram Prasad Bismil', birth_date: '1897-06-11', category: 'Freedom Fighter', known_for: 'Revolutionary poet and freedom fighter, Kakori conspiracy, "Sarfaroshi ki tamanna"', nationality: 'Indian', birth_year: 1897, death_year: 1927, tier: 'historical' },
  { name: 'Ashfaqulla Khan', birth_date: '1900-10-22', category: 'Freedom Fighter', known_for: 'Revolutionary freedom fighter, Kakori conspiracy, close friend of Ram Prasad Bismil', nationality: 'Indian', birth_year: 1900, death_year: 1927, tier: 'historical' },
  { name: 'Vinoba Bhave', birth_date: '1895-09-11', category: 'Social Reformer', known_for: 'Bhoodan movement, Gandhi\'s spiritual heir, first Individual Satyagrahi', nationality: 'Indian', birth_year: 1895, death_year: 1982, tier: 'historical' },
  { name: 'Subramania Bharati', birth_date: '1882-12-11', category: 'Poet', known_for: 'Tamil poet and freedom fighter, Mahakavi Bharati, champion of women\'s rights', nationality: 'Indian', birth_year: 1882, death_year: 1921, tier: 'historical' },
  { name: 'Bankim Chandra Chattopadhyay', birth_date: '1838-06-27', category: 'Author', known_for: 'Wrote Vande Mataram, Anandamath, father of Bengali novel', nationality: 'Indian', birth_year: 1838, death_year: 1894, tier: 'historical' },
  { name: 'Ishwar Chandra Vidyasagar', birth_date: '1820-09-26', category: 'Social Reformer', known_for: 'Champion of widow remarriage, women\'s education, Bengali Renaissance figure', nationality: 'Indian', birth_year: 1820, death_year: 1891, tier: 'historical' },
  { name: 'Ram Mohan Roy', birth_date: '1772-05-22', category: 'Social Reformer', known_for: 'Father of Bengal Renaissance, abolished sati, founded Brahmo Samaj', nationality: 'Indian', birth_year: 1772, death_year: 1833, tier: 'historical' },
  { name: 'Dayananda Saraswati', birth_date: '1824-02-12', category: 'Philosopher', known_for: 'Founded Arya Samaj, championed Vedic Hinduism, "Back to the Vedas"', nationality: 'Indian', birth_year: 1824, death_year: 1883, tier: 'historical' },
  { name: 'Guru Nanak Dev', birth_date: '1469-04-15', category: 'Spiritual Leader', known_for: 'Founder of Sikhism, first of the ten Sikh Gurus, "Ik Onkar"', nationality: 'Indian', birth_year: 1469, death_year: 1539, tier: 'historical' },
  { name: 'Mirabai', birth_date: '1498-01-01', category: 'Poet', known_for: 'Medieval poet-saint and devotee of Krishna, her bhajans remain central to Hindu devotion', nationality: 'Indian', birth_year: 1498, death_year: 1547, tier: 'historical' },
  { name: 'Kabir Das', birth_date: '1440-06-01', category: 'Poet', known_for: 'Mystic poet and saint whose verses appear in Guru Granth Sahib and Adi Granth', nationality: 'Indian', birth_year: 1440, death_year: 1518, tier: 'historical' },
  { name: 'Tulsidas', birth_date: '1532-08-11', category: 'Poet', known_for: 'Author of Ramcharitmanas, Hanuman Chalisa — most widely read Hindi literature', nationality: 'Indian', birth_year: 1532, death_year: 1623, tier: 'historical' },

  // ============================================================
  // PHILOSOPHERS & SPIRITUAL LEADERS (30)
  // ============================================================
  { name: 'Srila Prabhupada', birth_date: '1896-09-01', category: 'Spiritual Leader', known_for: 'Founder of ISKCON (Hare Krishna movement), brought Bhagavad Gita and Vaishnavism to the West', nationality: 'Indian', birth_year: 1896, death_year: 1977, tier: 'historical' },
  { name: 'Ramana Maharshi', birth_date: '1879-12-30', category: 'Spiritual Leader', known_for: 'Sage of Arunachala, self-enquiry ("Who am I?") meditation, one of the greatest modern sages', nationality: 'Indian', birth_year: 1879, death_year: 1950, tier: 'historical' },
  { name: 'Sri Aurobindo', birth_date: '1872-08-15', category: 'Philosopher', known_for: 'Freedom fighter turned philosopher and yogi, Integral Yoga, The Life Divine', nationality: 'Indian', birth_year: 1872, death_year: 1950, tier: 'historical' },
  { name: 'Paramahansa Yogananda', birth_date: '1893-01-05', category: 'Spiritual Leader', known_for: 'Autobiography of a Yogi, introduced Kriya Yoga to the West, Self-Realization Fellowship', nationality: 'Indian', birth_year: 1893, death_year: 1952, tier: 'historical' },
  { name: 'Osho Rajneesh', birth_date: '1931-12-11', category: 'Philosopher', known_for: 'Controversial spiritual teacher, neo-sannyas movement, 650+ books, global following', nationality: 'Indian', birth_year: 1931, death_year: 1990, tier: 'historical' },
  { name: 'J. Krishnamurti', birth_date: '1895-05-12', category: 'Philosopher', known_for: 'Independent philosopher, rejected all organised religion and gurus, The First and Last Freedom', nationality: 'Indian', birth_year: 1895, death_year: 1986, tier: 'historical' },
  { name: 'Ramakrishna Paramahamsa', birth_date: '1836-02-18', category: 'Spiritual Leader', known_for: 'Mystic and yogi, guru of Swami Vivekananda, "All religions lead to the same God"', nationality: 'Indian', birth_year: 1836, death_year: 1886, tier: 'historical' },
  { name: 'Swami Sivananda', birth_date: '1887-09-08', category: 'Spiritual Leader', known_for: 'Founded Divine Life Society, prolific author of 200+ books on yoga and Vedanta', nationality: 'Indian', birth_year: 1887, death_year: 1963, tier: 'historical' },
  { name: 'Sai Baba of Shirdi', birth_date: '1838-09-28', category: 'Spiritual Leader', known_for: 'Revered saint worshipped by both Hindus and Muslims, "Sabka Malik Ek"', nationality: 'Indian', birth_year: 1838, death_year: 1918, tier: 'historical' },
  { name: 'Maharishi Mahesh Yogi', birth_date: '1917-01-12', category: 'Spiritual Leader', known_for: 'Founder of Transcendental Meditation, taught The Beatles, global meditation movement', nationality: 'Indian', birth_year: 1917, death_year: 2008, tier: 'historical' },
  { name: 'Sadhguru Jaggi Vasudev', birth_date: '1957-09-03', category: 'Spiritual Leader', known_for: 'Founder of Isha Foundation, yogi and author, Save Soil movement, global spiritual teacher', nationality: 'Indian', birth_year: 1957, tier: 'public_figure' },
  { name: 'Sri Sri Ravi Shankar', birth_date: '1956-05-13', category: 'Spiritual Leader', known_for: 'Founder of Art of Living Foundation, Sudarshan Kriya, global peace ambassador', nationality: 'Indian', birth_year: 1956, tier: 'public_figure' },
  { name: 'Baba Ramdev', birth_date: '1965-12-25', category: 'Spiritual Leader', known_for: 'Yoga guru, founder of Patanjali Ayurved, popularised pranayama across India', nationality: 'Indian', birth_year: 1965, tier: 'public_figure' },
  { name: 'Mata Amritanandamayi', birth_date: '1953-09-27', category: 'Spiritual Leader', known_for: 'The Hugging Saint, Amma, humanitarian and spiritual leader, embraced over 37 million people', nationality: 'Indian', birth_year: 1953, tier: 'public_figure' },
  { name: 'Sarvepalli Radhakrishnan', birth_date: '1888-09-05', category: 'Philosopher', known_for: 'Second President of India, philosopher of Hindu religion, Teachers\' Day celebrated on his birthday', nationality: 'Indian', birth_year: 1888, death_year: 1975, tier: 'historical' },

  // ============================================================
  // SCIENTISTS & ACADEMICS (25)
  // ============================================================
  { name: 'APJ Abdul Kalam', birth_date: '1931-10-15', category: 'Scientist', known_for: 'Missile Man of India, 11th President of India, PSLV and Agni missile programs', nationality: 'Indian', birth_year: 1931, death_year: 2015, tier: 'public_figure' },
  { name: 'CV Raman', birth_date: '1888-11-07', category: 'Scientist', known_for: 'Nobel Prize in Physics 1930 for Raman Effect, National Science Day on his discovery date', nationality: 'Indian', birth_year: 1888, death_year: 1970, tier: 'historical' },
  { name: 'Srinivasa Ramanujan', birth_date: '1887-12-22', category: 'Mathematician', known_for: 'Self-taught mathematical genius, infinite series, mock theta functions, Hardy-Ramanujan number 1729', nationality: 'Indian', birth_year: 1887, death_year: 1920, tier: 'historical' },
  { name: 'Homi Bhabha', birth_date: '1909-10-30', category: 'Scientist', known_for: 'Father of Indian nuclear programme, founded TIFR and BARC', nationality: 'Indian', birth_year: 1909, death_year: 1966, tier: 'historical' },
  { name: 'Vikram Sarabhai', birth_date: '1919-08-12', category: 'Scientist', known_for: 'Father of Indian space programme, founded ISRO, established IIM Ahmedabad', nationality: 'Indian', birth_year: 1919, death_year: 1971, tier: 'historical' },
  { name: 'Satyen Bose', birth_date: '1894-01-01', category: 'Scientist', known_for: 'Bose-Einstein statistics, Bose-Einstein condensate, Bosons named after him', nationality: 'Indian', birth_year: 1894, death_year: 1974, tier: 'historical' },
  { name: 'Meghnad Saha', birth_date: '1893-10-06', category: 'Scientist', known_for: 'Saha ionization equation, astrophysics pioneer, planned India\'s river valley projects', nationality: 'Indian', birth_year: 1893, death_year: 1956, tier: 'historical' },
  { name: 'Subrahmanyan Chandrasekhar', birth_date: '1910-10-19', category: 'Scientist', known_for: 'Nobel Prize in Physics 1983, Chandrasekhar limit for white dwarf stars', nationality: 'Indian', birth_year: 1910, death_year: 1995, tier: 'historical' },
  { name: 'Amartya Sen', birth_date: '1933-11-03', category: 'Economist', known_for: 'Nobel Prize in Economics 1998, welfare economics, capability approach, Development as Freedom', nationality: 'Indian', birth_year: 1933, tier: 'public_figure' },
  { name: 'Venkatraman Ramakrishnan', birth_date: '1952-04-01', category: 'Scientist', known_for: 'Nobel Prize in Chemistry 2009 for ribosome structure, President of Royal Society', nationality: 'Indian', birth_year: 1952, tier: 'public_figure' },

  // ============================================================
  // POLITICIANS & LEADERS (40)
  // ============================================================
  { name: 'Indira Gandhi', birth_date: '1917-11-19', category: 'Politician', known_for: 'First and only female Prime Minister of India, "Iron Lady of India", Green Revolution', nationality: 'Indian', birth_year: 1917, death_year: 1984, tier: 'historical' },
  { name: 'Rajiv Gandhi', birth_date: '1944-08-20', category: 'Politician', known_for: 'Youngest Prime Minister of India, computer and telecom revolution in India', nationality: 'Indian', birth_year: 1944, death_year: 1991, tier: 'historical' },
  { name: 'Atal Bihari Vajpayee', birth_date: '1924-12-25', category: 'Politician', known_for: 'Prime Minister of India, Pokhran nuclear tests, Lahore bus diplomacy, poet-politician', nationality: 'Indian', birth_year: 1924, death_year: 2018, tier: 'historical' },
  { name: 'Narendra Modi', birth_date: '1950-09-17', category: 'Politician', known_for: 'Current Prime Minister of India, Digital India, Make in India, Swachh Bharat', nationality: 'Indian', birth_year: 1950, tier: 'public_figure' },
  { name: 'Rahul Gandhi', birth_date: '1970-06-19', category: 'Politician', known_for: 'Indian National Congress leader, Member of Parliament, Bharat Jodo Yatra', nationality: 'Indian', birth_year: 1970, tier: 'public_figure' },
  { name: 'Manmohan Singh', birth_date: '1932-09-26', category: 'Politician', known_for: 'Prime Minister of India 2004-2014, architect of 1991 economic liberalisation as Finance Minister', nationality: 'Indian', birth_year: 1932, death_year: 2024, tier: 'public_figure' },
  { name: 'Pranab Mukherjee', birth_date: '1935-12-11', category: 'Politician', known_for: '13th President of India, longest-serving Finance Minister, Bharat Ratna 2019', nationality: 'Indian', birth_year: 1935, death_year: 2020, tier: 'public_figure' },
  { name: 'Lal Bahadur Shastri', birth_date: '1904-10-02', category: 'Politician', known_for: 'Second Prime Minister of India, "Jai Jawan Jai Kisan", led India in 1965 war with Pakistan', nationality: 'Indian', birth_year: 1904, death_year: 1966, tier: 'historical' },
  { name: 'Sonia Gandhi', birth_date: '1946-12-09', category: 'Politician', known_for: 'President of Indian National Congress, longest-serving Congress President, Italian-born Indian leader', nationality: 'Indian', birth_year: 1946, tier: 'public_figure' },
  { name: 'Arvind Kejriwal', birth_date: '1968-08-16', category: 'Politician', known_for: 'Chief Minister of Delhi, founder of Aam Aadmi Party, anti-corruption movement', nationality: 'Indian', birth_year: 1968, tier: 'public_figure' },
  { name: 'Mamata Banerjee', birth_date: '1955-01-05', category: 'Politician', known_for: 'Chief Minister of West Bengal, founder of Trinamool Congress, Didi', nationality: 'Indian', birth_year: 1955, tier: 'public_figure' },
  { name: 'Mayawati', birth_date: '1956-01-15', category: 'Politician', known_for: 'Four-time Chief Minister of Uttar Pradesh, Bahujan Samaj Party, Dalit rights champion', nationality: 'Indian', birth_year: 1956, tier: 'public_figure' },
  { name: 'Sharad Pawar', birth_date: '1940-12-12', category: 'Politician', known_for: 'Veteran politician, BCCI President, founder of Nationalist Congress Party', nationality: 'Indian', birth_year: 1940, tier: 'public_figure' },

  // ============================================================
  // BOLLYWOOD ACTORS — MALE (60)
  // ============================================================
  { name: 'Amitabh Bachchan', birth_date: '1942-10-11', category: 'Actor', known_for: 'Shahenshah of Bollywood, over 200 films, Deewar, Sholay, KBC host, Padma Vibhushan', nationality: 'Indian', birth_year: 1942, tier: 'entertainment' },
  { name: 'Shah Rukh Khan', birth_date: '1965-11-02', category: 'Actor', known_for: 'King of Bollywood, DDLJ, Dilwale, My Name is Khan, global Indian cinema ambassador', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Salman Khan', birth_date: '1965-12-27', category: 'Actor', known_for: 'Dabangg, Tiger franchise, Bajrangi Bhaijaan, Being Human, highest-paid Bollywood actor', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Aamir Khan', birth_date: '1965-03-14', category: 'Actor', known_for: 'Mr. Perfectionist, Lagaan, 3 Idiots, Dangal, PK, Taare Zameen Par, Satyamev Jayate host', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Hrithik Roshan', birth_date: '1974-01-10', category: 'Actor', known_for: 'Kaho Na Pyaar Hai, Koi Mil Gaya, Dhoom 2, Jodha Akbar, War, Greek God of Bollywood', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Ranbir Kapoor', birth_date: '1982-09-28', category: 'Actor', known_for: 'Rockstar, Barfi, Sanju, Brahmastra, Animal, one of Bollywood\'s most versatile actors', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Ranveer Singh', birth_date: '1985-07-06', category: 'Actor', known_for: 'Goliyon Ki Raasleela Ram-Leela, Bajirao Mastani, Padmaavat, Gully Boy, 83', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Akshay Kumar', birth_date: '1967-09-09', category: 'Actor', known_for: 'Khiladi, Toilet Ek Prem Katha, Padman, Mission Mangal, most prolific Bollywood star', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Ajay Devgn', birth_date: '1969-04-02', category: 'Actor', known_for: 'Phool Aur Kaante, Singham, Tanhaji, Drishyam, Gangajal, one of India\'s top action stars', nationality: 'Indian', birth_year: 1969, tier: 'entertainment' },
  { name: 'Shahid Kapoor', birth_date: '1981-02-25', category: 'Actor', known_for: 'Vivah, Kaminey, Haider, Udta Punjab, Kabir Singh, Jab We Met', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Irrfan Khan', birth_date: '1967-01-07', category: 'Actor', known_for: 'The Lunchbox, Piku, Hindi Medium, Slumdog Millionaire, Life of Pi, Jurassic World', nationality: 'Indian', birth_year: 1967, death_year: 2020, tier: 'entertainment' },
  { name: 'Nawazuddin Siddiqui', birth_date: '1974-05-19', category: 'Actor', known_for: 'Gangs of Wasseypur, The Lunchbox, Badlapur, Sacred Games, Serious Men', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Rajkummar Rao', birth_date: '1984-08-31', category: 'Actor', known_for: 'Kai Po Che, Shahid, Bareilly Ki Barfi, Newton, Stree, The White Tiger', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Pankaj Tripathi', birth_date: '1976-09-05', category: 'Actor', known_for: 'Mirzapur, Sacred Games, Stree, Fukrey, Gunjan Saxena, one of India\'s finest character actors', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Rajesh Khanna', birth_date: '1942-12-29', category: 'Actor', known_for: 'First superstar of Bollywood, Anand, Aradhana, Kati Patang, 15 consecutive solo hits', nationality: 'Indian', birth_year: 1942, death_year: 2012, tier: 'entertainment' },
  { name: 'Dilip Kumar', birth_date: '1922-12-11', category: 'Actor', known_for: 'Tragedy King of Bollywood, Devdas, Mughal-e-Azam, Naya Daur, Bharat Ratna 2015', nationality: 'Indian', birth_year: 1922, death_year: 2021, tier: 'historical' },
  { name: 'Dev Anand', birth_date: '1923-09-26', category: 'Actor', known_for: 'Evergreen hero of Bollywood, Guide, Jewel Thief, Hare Rama Hare Krishna', nationality: 'Indian', birth_year: 1923, death_year: 2011, tier: 'historical' },
  { name: 'Raj Kapoor', birth_date: '1924-12-14', category: 'Actor', known_for: 'Showman of Bollywood, Awaara, Shree 420, Bobby, directed and produced classics of Indian cinema', nationality: 'Indian', birth_year: 1924, death_year: 1988, tier: 'historical' },
  { name: 'Dharmendra', birth_date: '1935-12-08', category: 'Actor', known_for: 'He-Man of Bollywood, Sholay, Phool Aur Patthar, Seeta Aur Geeta, Chupke Chupke', nationality: 'Indian', birth_year: 1935, tier: 'entertainment' },
  { name: 'Sunny Deol', birth_date: '1956-10-19', category: 'Actor', known_for: 'Gadar, Border, Damini, Ghayal, Barsaat, action hero of 1980s-90s Bollywood', nationality: 'Indian', birth_year: 1956, tier: 'entertainment' },

  // ============================================================
  // BOLLYWOOD ACTRESSES (40)
  // ============================================================
  { name: 'Deepika Padukone', birth_date: '1986-01-05', category: 'Actress', known_for: 'Om Shanti Om, Cocktail, Piku, Bajirao Mastani, Padmaavat, global brand ambassador', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Priyanka Chopra', birth_date: '1982-07-18', category: 'Actress', known_for: 'Miss World 2000, Barfi, Mary Kom, Quantico (ABC), global superstar', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Aishwarya Rai Bachchan', birth_date: '1973-11-01', category: 'Actress', known_for: 'Miss World 1994, Hum Dil De Chuke Sanam, Devdas, Jodhaa Akbar, Cannes regular', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Kareena Kapoor Khan', birth_date: '1980-09-21', category: 'Actress', known_for: 'Kabhi Khushi Kabhie Gham, Jab We Met, 3 Idiots, Heroine, Laal Singh Chaddha', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Katrina Kaif', birth_date: '1983-07-16', category: 'Actress', known_for: 'Namastey London, Mere Brother Ki Dulhan, Tiger franchise, Zero, Phone Bhoot', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Alia Bhatt', birth_date: '1993-03-15', category: 'Actress', known_for: 'Highway, Udta Punjab, Raazi, Gully Boy, Gangubai Kathiawadi, RRR, Heart of Stone', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'Madhuri Dixit', birth_date: '1967-05-15', category: 'Actress', known_for: 'Dhak Dhak girl, Tezaab, Dil To Pagal Hai, Devdas, Hum Aapke Hain Koun, dancing queen', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Kajol', birth_date: '1974-08-05', category: 'Actress', known_for: 'DDLJ, Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, My Name is Khan, Dilwale', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Rekha', birth_date: '1954-10-10', category: 'Actress', known_for: 'Umrao Jaan, Silsila, Khubsoorat, Khoon Bhari Maang, eternal beauty of Bollywood', nationality: 'Indian', birth_year: 1954, tier: 'entertainment' },
  { name: 'Sridevi', birth_date: '1963-08-13', category: 'Actress', known_for: 'Sadma, Nagina, Mr. India, ChaalBaaz, English Vinglish, Mom, first female superstar of India', nationality: 'Indian', birth_year: 1963, death_year: 2018, tier: 'entertainment' },
  { name: 'Kangana Ranaut', birth_date: '1987-03-23', category: 'Actress', known_for: 'Queen, Tanu Weds Manu, Manikarnika, Thalaivii, most decorated female actor at Filmfare', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Taapsee Pannu', birth_date: '1987-08-01', category: 'Actress', known_for: 'Pink, Badla, Thappad, Haseen Dillruba, Shabaash Mithu, Dunki', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Vidya Balan', birth_date: '1979-01-01', category: 'Actress', known_for: 'Parineeta, The Dirty Picture, Kahaani, Tumhari Sulu, Mission Mangal, Shakuntala Devi', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },

  // ============================================================
  // SOUTH INDIAN CINEMA (30)
  // ============================================================
  { name: 'Rajinikanth', birth_date: '1950-12-12', category: 'Actor', known_for: 'Superstar of Indian cinema, Baasha, Muthu, Sivaji, Enthiran, Kabali, global cult following', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'Kamal Haasan', birth_date: '1954-11-07', category: 'Actor', known_for: 'Nayakan, Pushpak, Indian, Anbe Sivam, Hey Ram, Vishwaroopam, India\'s most versatile actor', nationality: 'Indian', birth_year: 1954, tier: 'entertainment' },
  { name: 'Vijay', birth_date: '1974-06-22', category: 'Actor', known_for: 'Thalapathy, Mersal, Bigil, Master, Beast, Varisu, highest-grossing Tamil star', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Ajith Kumar', birth_date: '1971-05-01', category: 'Actor', known_for: 'Thala, Mankatha, Vedalam, Viswasam, Valimai, Tamil cinema superstar', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Allu Arjun', birth_date: '1983-04-08', category: 'Actor', known_for: 'Stylish Star, Arya, Desamuduru, Pushpa franchise, first Telugu actor to win National Award', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Prabhas', birth_date: '1979-10-23', category: 'Actor', known_for: 'Darling, Baahubali franchise, Saaho, Radhe Shyam, Adipurush, Kalki 2898-AD', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Jr NTR', birth_date: '1983-05-20', category: 'Actor', known_for: 'Young Tiger, RRR, Janatha Garage, Aravinda Sametha, Telugu cinema icon', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Ram Charan', birth_date: '1985-03-27', category: 'Actor', known_for: 'Mega Power Star, Magadheera, Rangasthalam, RRR, RC 15, son of Chiranjeevi', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Mohanlal', birth_date: '1960-05-21', category: 'Actor', known_for: 'Complete Actor of Malayalam cinema, Kireedam, Bharatham, Drishyam, Lucifer', nationality: 'Indian', birth_year: 1960, tier: 'entertainment' },
  { name: 'Mammootty', birth_date: '1951-09-07', category: 'Actor', known_for: 'Megastar of Malayalam cinema, Oru CBI Diary Kurippu, Mathilukal, The Great Father', nationality: 'Indian', birth_year: 1951, tier: 'entertainment' },
  { name: 'Kajal Aggarwal', birth_date: '1985-06-19', category: 'Actress', known_for: 'Magadheera, Baadshah, Singham, Mr. Perfect, leading actress in Telugu and Tamil cinema', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Trisha Krishnan', birth_date: '1983-05-04', category: 'Actress', known_for: '96, Ghilli, Varsham, Nuvvostanante Nenoddantana, leading Tamil and Telugu actress', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Nayanthara', birth_date: '1984-11-18', category: 'Actress', known_for: 'Lady Superstar, Junglee Pictures, Chandramukhi, Ghajini, Atlee films, Jawan', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'SS Rajamouli', birth_date: '1973-10-10', category: 'Director', known_for: 'Baahubali franchise, RRR, Magadheera, India\'s most successful director globally', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },

  // ============================================================
  // CRICKETERS (50)
  // ============================================================
  { name: 'Sachin Tendulkar', birth_date: '1973-04-24', category: 'Cricketer', known_for: 'God of Cricket, 100 international centuries, 34,357 international runs, Bharat Ratna 2014', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'MS Dhoni', birth_date: '1981-07-07', category: 'Cricketer', known_for: 'Captain Cool, won 2007 T20 WC, 2010 Asia Cup, 2011 ODI WC, 2013 Champions Trophy, CSK captain', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Virat Kohli', birth_date: '1988-11-05', category: 'Cricketer', known_for: 'Run machine, 80+ international centuries, fastest to 8000/9000/10000 ODI runs, King Kohli', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Rohit Sharma', birth_date: '1987-04-30', category: 'Cricketer', known_for: 'Hitman, three ODI double centuries, T20 World Cup 2024 winner and captain, Hitman', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Kapil Dev', birth_date: '1959-01-06', category: 'Cricketer', known_for: 'Haryana Hurricane, led India to 1983 World Cup victory, 434 Test wickets, all-rounder', nationality: 'Indian', birth_year: 1959, tier: 'entertainment' },
  { name: 'Sunil Gavaskar', birth_date: '1949-07-10', category: 'Cricketer', known_for: 'Little Master, first batsman to score 10,000 Test runs, 34 Test centuries, opening legend', nationality: 'Indian', birth_year: 1949, tier: 'entertainment' },
  { name: 'Sourav Ganguly', birth_date: '1972-07-08', category: 'Cricketer', known_for: 'Dada, Prince of Kolkata, transformed Indian cricket culture, BCCI President', nationality: 'Indian', birth_year: 1972, tier: 'entertainment' },
  { name: 'Rahul Dravid', birth_date: '1973-01-11', category: 'Cricketer', known_for: 'The Wall, 13,288 Test runs, technical masterclass, Head Coach of Indian cricket team', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Anil Kumble', birth_date: '1970-10-17', category: 'Cricketer', known_for: 'Jumbo, 619 Test wickets, took all 10 Pakistan wickets in one innings, leg-spinner great', nationality: 'Indian', birth_year: 1970, tier: 'entertainment' },
  { name: 'VVS Laxman', birth_date: '1974-11-01', category: 'Cricketer', known_for: 'Very Very Special, 281 against Australia Kolkata 2001, one of cricket\'s greatest innings', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Yuvraj Singh', birth_date: '1981-12-12', category: 'Cricketer', known_for: 'Six sixes in an over, Player of Tournament 2011 World Cup, cancer survivor comeback', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Harbhajan Singh', birth_date: '1980-07-03', category: 'Cricketer', known_for: 'Turbanator, hat-trick in Test cricket vs Australia 2001, 417 Test wickets', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Jasprit Bumrah', birth_date: '1993-12-06', category: 'Cricketer', known_for: 'World\'s best fast bowler, unique action, death-over specialist, T20 World Cup 2024 winner', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'Shubman Gill', birth_date: '2002-09-08', category: 'Cricketer', known_for: 'New generation batting star, future captain material, elegant right-hand batsman', nationality: 'Indian', birth_year: 2002, tier: 'entertainment' },
  { name: 'Ravindra Jadeja', birth_date: '1988-12-06', category: 'Cricketer', known_for: 'Sir Jadeja, world\'s best fielder, left-arm spinner and lower-order batsman, Test all-rounder', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Smriti Mandhana', birth_date: '1996-07-18', category: 'Cricketer', known_for: 'ICC Women\'s Cricketer of Year 2018, leading Indian women\'s cricket batting star', nationality: 'Indian', birth_year: 1996, tier: 'entertainment' },
  { name: 'Mithali Raj', birth_date: '1982-12-03', category: 'Cricketer', known_for: 'Greatest female cricketer India, 7,805 ODI runs, led India to World Cup final 2017', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },

  // ============================================================
  // MUSICIANS & SINGERS (30)
  // ============================================================
  { name: 'Lata Mangeshkar', birth_date: '1929-09-28', category: 'Singer', known_for: 'Nightingale of India, 30,000+ songs in 36 languages over 7 decades, Bharat Ratna 2001', nationality: 'Indian', birth_year: 1929, death_year: 2022, tier: 'historical' },
  { name: 'Kishore Kumar', birth_date: '1929-08-04', category: 'Singer', known_for: 'Versatile playback singer, actor, filmmaker, most popular male voice of Hindi cinema', nationality: 'Indian', birth_year: 1929, death_year: 1987, tier: 'historical' },
  { name: 'Mohammed Rafi', birth_date: '1924-12-24', category: 'Singer', known_for: 'One of greatest playback singers in history, versatile range, 26,000+ songs', nationality: 'Indian', birth_year: 1924, death_year: 1980, tier: 'historical' },
  { name: 'Mukesh', birth_date: '1923-07-22', category: 'Singer', known_for: 'Soulful playback singer, voice of Raj Kapoor, Kabhi Kabhi, Mera Joota Hai Japani', nationality: 'Indian', birth_year: 1923, death_year: 1976, tier: 'historical' },
  { name: 'Asha Bhosle', birth_date: '1933-09-08', category: 'Singer', known_for: 'Sister of Lata Mangeshkar, widest vocal range, world record for most studio recordings', nationality: 'Indian', birth_year: 1933, tier: 'entertainment' },
  { name: 'AR Rahman', birth_date: '1967-01-06', category: 'Music Composer', known_for: 'Mozart of Madras, Roja, Dil Se, Lagaan, Slumdog Millionaire Oscar winner, Grammy winner', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Ravi Shankar', birth_date: '1920-04-07', category: 'Musician', known_for: 'Sitar maestro, collaborated with George Harrison, brought Indian classical music to the world', nationality: 'Indian', birth_year: 1920, death_year: 2012, tier: 'historical' },
  { name: 'Zakir Hussain', birth_date: '1951-03-09', category: 'Musician', known_for: 'Tabla maestro, Grammy winner, Shakti, global ambassador of Indian classical percussion', nationality: 'Indian', birth_year: 1951, death_year: 2024, tier: 'entertainment' },
  { name: 'Arijit Singh', birth_date: '1987-04-25', category: 'Singer', known_for: 'Most streamed Indian artist globally, Tum Hi Ho, Channa Mereya, Kesariya, Ae Dil Hai Mushkil', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Sonu Nigam', birth_date: '1973-07-30', category: 'Singer', known_for: 'Classic Bollywood playback singer, Kal Ho Naa Ho, Abhi Mujh Mein Kahin, Sandese Aate Hain', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Kumar Sanu', birth_date: '1957-10-20', category: 'Singer', known_for: 'King of Sad Songs, 1990s Bollywood playback voice, Dil Deewana, Ek Ladki Ko Dekha', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Usha Uthup', birth_date: '1947-11-08', category: 'Singer', known_for: 'India\'s rock and pop pioneer, Darling, Hare Rama Hare Krishna, six-decade career', nationality: 'Indian', birth_year: 1947, tier: 'entertainment' },

  // ============================================================
  // BUSINESS LEADERS (25)
  // ============================================================
  { name: 'Ratan Tata', birth_date: '1937-12-28', category: 'Business Leader', known_for: 'Chairman of Tata Group, Tata Nano, acquired Jaguar Land Rover, philanthropist, national icon', nationality: 'Indian', birth_year: 1937, death_year: 2024, tier: 'public_figure' },
  { name: 'Mukesh Ambani', birth_date: '1957-04-19', category: 'Business Leader', known_for: 'Asia\'s richest person, Reliance Industries, Jio telecom revolution, Antilia', nationality: 'Indian', birth_year: 1957, tier: 'public_figure' },
  { name: 'Dhirubhai Ambani', birth_date: '1932-12-28', category: 'Business Leader', known_for: 'Founded Reliance Industries, rags-to-riches story, democratised equity investment in India', nationality: 'Indian', birth_year: 1932, death_year: 2002, tier: 'historical' },
  { name: 'Narayana Murthy', birth_date: '1946-08-20', category: 'Business Leader', known_for: 'Co-founder of Infosys, pioneer of Indian IT industry, $250 initial investment to $100B company', nationality: 'Indian', birth_year: 1946, tier: 'public_figure' },
  { name: 'Azim Premji', birth_date: '1945-07-24', category: 'Business Leader', known_for: 'Wipro Chairman, Czar of Indian IT, donated $21 billion to philanthropy', nationality: 'Indian', birth_year: 1945, tier: 'public_figure' },
  { name: 'Sundar Pichai', birth_date: '1972-07-12', category: 'Business Leader', known_for: 'CEO of Google and Alphabet, from Tamil Nadu to Silicon Valley, IIT Kharagpur alumnus', nationality: 'Indian', birth_year: 1972, tier: 'public_figure' },
  { name: 'Satya Nadella', birth_date: '1967-08-19', category: 'Business Leader', known_for: 'CEO of Microsoft, transformed Microsoft into cloud-first company, Azure dominance', nationality: 'Indian', birth_year: 1967, tier: 'public_figure' },
  { name: 'Indra Nooyi', birth_date: '1955-10-28', category: 'Business Leader', known_for: 'Former CEO of PepsiCo, Fortune most powerful women, IIM Calcutta alumna', nationality: 'Indian', birth_year: 1955, tier: 'public_figure' },
  { name: 'Kumar Mangalam Birla', birth_date: '1967-06-14', category: 'Business Leader', known_for: 'Chairman of Aditya Birla Group, one of India\'s largest conglomerates', nationality: 'Indian', birth_year: 1967, tier: 'public_figure' },

  // ============================================================
  // ATHLETES — NON-CRICKET (25)
  // ============================================================
  { name: 'PV Sindhu', birth_date: '1995-07-05', category: 'Athlete', known_for: 'Olympic silver (Rio 2016) and bronze (Tokyo 2020) in badminton, World Champion 2019', nationality: 'Indian', birth_year: 1995, tier: 'entertainment' },
  { name: 'Saina Nehwal', birth_date: '1990-03-17', category: 'Athlete', known_for: 'First Indian to reach world badminton No.1, Olympic bronze 2012 London, six World Superseries', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Neeraj Chopra', birth_date: '1997-12-24', category: 'Athlete', known_for: 'Olympic gold Tokyo 2020 in javelin, first Indian to win Olympic gold in track and field', nationality: 'Indian', birth_year: 1997, tier: 'entertainment' },
  { name: 'Mary Kom', birth_date: '1982-11-24', category: 'Athlete', known_for: 'Magnificent Mary, six-time World Boxing Champion, Olympic bronze 2012, Padma Vibhushan', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Milkha Singh', birth_date: '1929-11-20', category: 'Athlete', known_for: 'Flying Sikh, Indian sprinting legend, national record holder, 1960 Rome Olympics finalist', nationality: 'Indian', birth_year: 1929, death_year: 2021, tier: 'historical' },
  { name: 'PT Usha', birth_date: '1964-06-27', category: 'Athlete', known_for: 'Payyoli Express, Queen of Indian track and field, missed 1984 Olympics medal by 1/100th second', nationality: 'Indian', birth_year: 1964, tier: 'entertainment' },
  { name: 'Abhinav Bindra', birth_date: '1982-09-28', category: 'Athlete', known_for: 'First Indian to win individual Olympic gold (Beijing 2008), 10m air rifle, Padma Bhushan', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Vishwanathan Anand', birth_date: '1969-12-11', category: 'Athlete', known_for: 'Five-time World Chess Champion, first Asian to win World Chess Championship 2000', nationality: 'Indian', birth_year: 1969, tier: 'entertainment' },
  { name: 'Leander Paes', birth_date: '1973-06-17', category: 'Athlete', known_for: 'Olympic bronze 1996 Atlanta, 18 Grand Slam doubles titles, India\'s greatest tennis player', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },

  // ============================================================
  // AUTHORS & JOURNALISTS (20)
  // ============================================================
  { name: 'Arundhati Roy', birth_date: '1961-11-24', category: 'Author', known_for: 'The God of Small Things (Booker Prize 1997), activist, The Ministry of Utmost Happiness', nationality: 'Indian', birth_year: 1961, tier: 'public_figure' },
  { name: 'Chetan Bhagat', birth_date: '1974-04-22', category: 'Author', known_for: 'Five Point Someone, 2 States, Half Girlfriend, 3 Mistakes of My Life, IIT IIM alumnus', nationality: 'Indian', birth_year: 1974, tier: 'public_figure' },
  { name: 'Vikram Seth', birth_date: '1952-06-20', category: 'Author', known_for: 'A Suitable Boy, An Equal Music, The Golden Gate, one of India\'s greatest living novelists', nationality: 'Indian', birth_year: 1952, tier: 'public_figure' },
  { name: 'Ruskin Bond', birth_date: '1934-05-19', category: 'Author', known_for: 'The Room on the Roof, A Flight of Pigeons, Vagrants in the Valley, beloved British-Indian author', nationality: 'Indian', birth_year: 1934, tier: 'public_figure' },
  { name: 'RK Narayan', birth_date: '1906-10-10', category: 'Author', known_for: 'Malgudi Days, The Guide, Swami and Friends, Indian English literature pioneer', nationality: 'Indian', birth_year: 1906, death_year: 2001, tier: 'historical' },
  { name: 'Munshi Premchand', birth_date: '1880-07-31', category: 'Author', known_for: 'Godaan, Nirmala, Gaban, Shatranj ke Khilari, greatest Hindi-Urdu fiction writer', nationality: 'Indian', birth_year: 1880, death_year: 1936, tier: 'historical' },

  // ============================================================
  // DIRECTORS & FILMMAKERS (15)
  // ============================================================
  { name: 'Satyajit Ray', birth_date: '1921-05-02', category: 'Director', known_for: 'Pather Panchali, Apu trilogy, Academy Honorary Award, greatest Indian filmmaker', nationality: 'Indian', birth_year: 1921, death_year: 1992, tier: 'historical' },
  { name: 'Guru Dutt', birth_date: '1925-07-09', category: 'Director', known_for: 'Pyaasa, Kaagaz Ke Phool, Sahib Bibi Aur Ghulam, auteur of poetic Hindi cinema', nationality: 'Indian', birth_year: 1925, death_year: 1964, tier: 'historical' },
  { name: 'Yash Chopra', birth_date: '1932-09-27', category: 'Director', known_for: 'King of Romance, Deewar, Silsila, Chandni, DDLJ producer, Filmfare Lifetime Achievement', nationality: 'Indian', birth_year: 1932, death_year: 2012, tier: 'historical' },
  { name: 'Karan Johar', birth_date: '1972-05-25', category: 'Director', known_for: 'Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, My Name is Khan, Ae Dil Hai Mushkil', nationality: 'Indian', birth_year: 1972, tier: 'entertainment' },
  { name: 'Sanjay Leela Bhansali', birth_date: '1963-02-24', category: 'Director', known_for: 'Hum Dil De Chuke Sanam, Devdas, Bajirao Mastani, Padmaavat, Gangubai Kathiawadi', nationality: 'Indian', birth_year: 1963, tier: 'entertainment' },
  { name: 'Mani Ratnam', birth_date: '1956-06-02', category: 'Director', known_for: 'Roja, Bombay, Dil Se, Guru, Raavan, Ponniyin Selvan, greatest Tamil filmmaker', nationality: 'Indian', birth_year: 1956, tier: 'entertainment' },

  // ============================================================
  // JANUARY ADDITIONS
  // ============================================================
  { name: 'Nargis', birth_date: '1929-01-01', category: 'Actress', known_for: 'Mother India (1957), Barsaat, Awara, first Indian actress to win a national award internationally', nationality: 'Indian', birth_year: 1929, death_year: 1981, tier: 'historical' },
  { name: 'Nandan Nilekani', birth_date: '1955-01-02', category: 'Business Leader', known_for: 'Co-founder of Infosys, architect of Aadhaar biometric identity system, Imagining India', nationality: 'Indian', birth_year: 1955, tier: 'public_figure' },
  { name: 'Sonakshi Sinha', birth_date: '1987-01-02', category: 'Actress', known_for: 'Dabangg franchise, Rowdy Rathore, Lootera, Akira, daughter of Shatrughan Sinha', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Ilayaraja', birth_date: '1943-01-02', category: 'Music Composer', known_for: 'Maestro of Tamil film music, 1000+ film scores, Ilaignan, How to Name It', nationality: 'Indian', birth_year: 1943, tier: 'entertainment' },
  { name: 'M. Karunanidhi', birth_date: '1924-01-03', category: 'Politician', known_for: 'Five-time Chief Minister of Tamil Nadu, founder of DMK, screenwriter-turned-politician', nationality: 'Indian', birth_year: 1924, death_year: 2018, tier: 'historical' },
  { name: 'S.P. Balasubrahmanyam', birth_date: '1946-01-04', category: 'Singer', known_for: 'SPB, legendary South Indian playback singer, Guinness record holder, 40,000+ songs', nationality: 'Indian', birth_year: 1946, death_year: 2020, tier: 'historical' },
  { name: 'Anil Ambani', birth_date: '1959-01-04', category: 'Business Leader', known_for: 'Chairman of Reliance Group, younger brother of Mukesh Ambani', nationality: 'Indian', birth_year: 1959, tier: 'public_figure' },
  { name: 'Nutan', birth_date: '1936-01-04', category: 'Actress', known_for: 'Sujata, Seema, Bandini, Milan, Saraswatichandra, five-time Filmfare Best Actress winner', nationality: 'Indian', birth_year: 1936, death_year: 1991, tier: 'historical' },
  { name: 'Revathi', birth_date: '1966-01-05', category: 'Actress', known_for: 'Mouna Ragam, Thevar Magan, Minsaara Kanavu, National Award winning Tamil actress-director', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Sunil Dutt', birth_date: '1929-01-06', category: 'Actor', known_for: 'Mother India, Mujhe Jeene Do, Padosan, politician, husband of Nargis, father of Sanjay Dutt', nationality: 'Indian', birth_year: 1929, death_year: 2005, tier: 'historical' },
  { name: 'Bipasha Basu', birth_date: '1979-01-07', category: 'Actress', known_for: 'Raaz, Dhoom 2, Race, No Entry, Alone, fitness icon', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Ekta Kapoor', birth_date: '1975-01-07', category: 'Producer', known_for: 'Balaji Telefilms, queen of Indian television, Kyunki Saas Bhi Kabhi Bahu Thi, Kasautii', nationality: 'Indian', birth_year: 1975, tier: 'entertainment' },
  { name: 'Mahesh Bhupathi', birth_date: '1974-01-07', category: 'Athlete', known_for: 'Indian tennis doubles specialist, Grand Slam champion, Davis Cup hero', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Dimple Kapadia', birth_date: '1957-01-08', category: 'Actress', known_for: 'Bobby, Ram Lakhan, Dil Chahta Hai, Tenet, iconic Bollywood actress', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Shilpa Shetty', birth_date: '1975-01-08', category: 'Actress', known_for: 'Baazigar, Dhadkan, Big Brother UK winner, Yoga ambassador, fitness icon', nationality: 'Indian', birth_year: 1975, tier: 'entertainment' },
  { name: 'Yash', birth_date: '1986-01-08', category: 'Actor', known_for: 'KGF Chapter 1 and 2, Rocky Bhai, biggest Kannada cinema star globally', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Hima Das', birth_date: '1999-01-09', category: 'Athlete', known_for: 'Dhing Express, first Indian to win gold at World U20 Athletics Championship 2018', nationality: 'Indian', birth_year: 1999, tier: 'entertainment' },
  { name: 'Farhan Akhtar', birth_date: '1974-01-09', category: 'Actor', known_for: 'Dil Chahta Hai director, Rock On, Bhaag Milkha Bhaag, Toofaan, Jee Le Zaraa', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Kiran Bedi', birth_date: '1949-01-09', category: 'Politician', known_for: 'First woman IPS officer in India, social activist, Rajya Sabha member, tennis player', nationality: 'Indian', birth_year: 1949, tier: 'public_figure' },
  { name: 'Sonam Kapoor', birth_date: '1985-01-09', category: 'Actress', known_for: 'Saawariya, Neerja, Veere Di Wedding, fashion icon, daughter of Anil Kapoor', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Amisha Patel', birth_date: '1976-01-09', category: 'Actress', known_for: 'Kaho Na Pyaar Hai, Gadar, Humraaz, Bhool Bhulaiyaa', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Balakrishna', birth_date: '1960-01-10', category: 'Actor', known_for: 'Nandamuri Balakrishna, Telugu superstar, son of NT Rama Rao, 100+ films', nationality: 'Indian', birth_year: 1960, tier: 'entertainment' },
  { name: 'Prakash Padukone', birth_date: '1955-01-10', category: 'Athlete', known_for: 'First Indian to win All England Badminton Championship 1980, father of Deepika Padukone', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'E. Sridharan', birth_date: '1932-01-12', category: 'Engineer', known_for: 'Metro Man of India, built Delhi Metro, Konkan Railway, Padma Vibhushan', nationality: 'Indian', birth_year: 1932, tier: 'public_figure' },
  { name: 'Shivkumar Sharma', birth_date: '1938-01-13', category: 'Musician', known_for: 'Popularised santoor as classical instrument, Shiv-Hari duo with Hariprasad, Chandni songs', nationality: 'Indian', birth_year: 1938, death_year: 2022, tier: 'historical' },
  { name: 'Sidharth Malhotra', birth_date: '1985-01-16', category: 'Actor', known_for: 'Student of the Year, Hasee Toh Phasee, Ek Villain, Kapoor & Sons, Shershaah', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Deep Kalra', birth_date: '1970-01-16', category: 'Business Leader', known_for: 'Founder of MakeMyTrip, pioneered online travel booking in India', nationality: 'Indian', birth_year: 1970, tier: 'public_figure' },
  { name: 'Javed Akhtar', birth_date: '1945-01-17', category: 'Lyricist', known_for: 'Sholay screenplay, Deewaar, Zanjeer, iconic lyricist, husband of Shabana Azmi', nationality: 'Indian', birth_year: 1945, tier: 'entertainment' },
  { name: 'Raj Thackeray', birth_date: '1968-01-14', category: 'Politician', known_for: 'Founder of Maharashtra Navnirman Sena, Marathi political leader', nationality: 'Indian', birth_year: 1968, tier: 'public_figure' },
  { name: 'Kirron Kher', birth_date: '1955-01-14', category: 'Actress', known_for: 'Devdas, Veer-Zaara, Dostana, Khoobsoorat, BJP MP from Chandigarh', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Anna Hazare', birth_date: '1937-01-15', category: 'Social Reformer', known_for: 'Anti-corruption crusader, Lokpal movement, led India Against Corruption with Kejriwal', nationality: 'Indian', birth_year: 1937, tier: 'public_figure' },
  { name: 'Lakshmi Mittal', birth_date: '1950-01-15', category: 'Business Leader', known_for: 'Chairman of ArcelorMittal, world\'s largest steel company, steel king', nationality: 'Indian', birth_year: 1950, tier: 'public_figure' },
  { name: 'Pritish Nandy', birth_date: '1951-01-15', category: 'Author', known_for: 'Poet, journalist, filmmaker, The Illustrated Weekly of India editor', nationality: 'Indian', birth_year: 1951, tier: 'public_figure' },
  { name: 'Tantia Tope', birth_date: '1814-01-16', category: 'Historical', known_for: '1857 uprising general, served Peshwa Nana Sahib, last resistance leader of First War', nationality: 'Indian', birth_year: 1814, death_year: 1859, tier: 'historical' },
  { name: 'Axar Patel', birth_date: '1994-01-20', category: 'Cricketer', known_for: 'Left-arm spinner all-rounder, Delhi Capitals, hero of home Test series 2021', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'Tovino Thomas', birth_date: '1989-01-21', category: 'Actor', known_for: 'Minnal Murali, Forensic, Trance, Lucifer, rising star of Malayalam cinema', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'Tisca Chopra', birth_date: '1973-01-23', category: 'Actress', known_for: 'Taare Zameen Par, Dil Dhadakne Do, Haider, director of Chutney and X', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Cheteshwar Pujara', birth_date: '1988-01-25', category: 'Cricketer', known_for: 'Wall of Indian cricket, 7195 Test runs, hero of Australia 2020-21 series', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Kavita Krishnamurthy', birth_date: '1958-01-25', category: 'Singer', known_for: 'Tezaab, Beta, Khalnayak, Mr. India, classical and film singer', nationality: 'Indian', birth_year: 1958, tier: 'entertainment' },
  { name: 'Shruti Haasan', birth_date: '1986-01-28', category: 'Actress', known_for: 'Gamanam, Salaar, Indian 2, singer and actress, daughter of Kamal Haasan', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Preity Zinta', birth_date: '1974-01-31', category: 'Actress', known_for: 'Dil Se, Kya Kehna, Kal Ho Naa Ho, Veer-Zaara, Salaam Namaste, KXIP co-owner', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },

  // ============================================================
  // FEBRUARY ADDITIONS
  // ============================================================
  { name: 'Jackie Shroff', birth_date: '1957-02-01', category: 'Actor', known_for: 'Hero, Ram Lakhan, Parinda, Rangeela, father of Tiger Shroff', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Abhishek Bachchan', birth_date: '1976-02-05', category: 'Actor', known_for: 'Dhoom, Bunty aur Babli, Guru, Kabhi Alvida Naa Kehna, son of Amitabh Bachchan', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Bhuvneshwar Kumar', birth_date: '1990-02-05', category: 'Cricketer', known_for: 'Swing bowler, death-over specialist, led SRH to IPL success, reverse swing expert', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Amrita Singh', birth_date: '1958-02-09', category: 'Actress', known_for: 'Betaab, Chameli Ki Shaadi, Ek Do Teen, Sarafarosh, ex-wife of Saif Ali Khan', nationality: 'Indian', birth_year: 1958, tier: 'entertainment' },
  { name: 'Pran', birth_date: '1920-02-12', category: 'Actor', known_for: 'Greatest villain of Hindi cinema, Upkar, Victoria No. 203, Zanjeer, 400+ films', nationality: 'Indian', birth_year: 1920, death_year: 2013, tier: 'historical' },
  { name: 'Dayananda Saraswati', birth_date: '1824-02-12', category: 'Philosopher', known_for: 'Founded Arya Samaj, championed Vedic Hinduism, "Back to the Vedas"', nationality: 'Indian', birth_year: 1824, death_year: 1883, tier: 'historical' },
  { name: 'Sushma Swaraj', birth_date: '1952-02-14', category: 'Politician', known_for: 'External Affairs Minister, most popular BJP leader, helped Indians abroad, eloquent orator', nationality: 'Indian', birth_year: 1952, death_year: 2019, tier: 'historical' },
  { name: 'Sivakarthikeyan', birth_date: '1985-02-17', category: 'Actor', known_for: 'VIP, Kakki Sattai, Remo, Doctor, Don, Ayalaan, biggest Tamil star of new generation', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Nushrratt Bharuccha', birth_date: '1985-02-17', category: 'Actress', known_for: 'Pyaar Ka Punchnama, Sonu Ke Titu Ki Sweety, Chhorii, Janhit Mein Jaari', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Rukmini Devi Arundale', birth_date: '1904-02-29', category: 'Cultural Figure', known_for: 'Revival of Bharatanatyam classical dance, Kalakshetra Foundation Chennai, Padma Bhushan', nationality: 'Indian', birth_year: 1904, death_year: 1986, tier: 'historical' },
  { name: 'Kidambi Srikanth', birth_date: '1993-02-07', category: 'Athlete', known_for: 'World No.1 badminton ranking 2017, four Super Series titles in 2017', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'S Sreesanth', birth_date: '1983-02-06', category: 'Cricketer', known_for: 'Fiery Kerala pace bowler, 2007 T20 and 2011 ODI World Cup winner, emotional character', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Bajrang Punia', birth_date: '1994-02-26', category: 'Athlete', known_for: 'Olympic bronze Tokyo 2020, World Wrestling Championship medallist, 65kg freestyle', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'Pooja Bhatt', birth_date: '1972-02-28', category: 'Actress', known_for: 'Dil Hai Ki Manta Nahin, Sadak, Junoon, producer, daughter of Mahesh Bhatt', nationality: 'Indian', birth_year: 1972, tier: 'entertainment' },
  { name: 'Dutee Chand', birth_date: '1996-02-03', category: 'Athlete', known_for: 'India\'s fastest woman sprinter, Asian Games silver, fought against hyperandrogenism rules', nationality: 'Indian', birth_year: 1996, tier: 'entertainment' },
  { name: 'Bhimsen Joshi', birth_date: '1922-02-04', category: 'Musician', known_for: 'Kirana Gharana vocalist, Bharat Ratna 2008, celebrated classical Hindustani singer', nationality: 'Indian', birth_year: 1922, death_year: 2011, tier: 'historical' },

  // ============================================================
  // MARCH ADDITIONS
  // ============================================================
  { name: 'Tiger Shroff', birth_date: '1990-03-02', category: 'Actor', known_for: 'Baaghi franchise, Heropanti, War, action star, son of Jackie Shroff, martial arts expert', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Shraddha Kapoor', birth_date: '1989-03-03', category: 'Actress', known_for: 'Aashiqui 2, ABCD 2, Baaghi, Stree franchise, Tu Jhoothi Main Makkaar', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'Divya Khosla Kumar', birth_date: '1983-03-07', category: 'Actress', known_for: 'Ab Tumhare Hawale Watan Saathiyo, Sanam Re, director of Yaariyan', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Anupam Kher', birth_date: '1955-03-07', category: 'Actor', known_for: 'Saaransh, Dilwale Dulhania Le Jayenge, Khosla Ka Ghosla, Silver Linings Playbook', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Gangubai Hangal', birth_date: '1913-03-05', category: 'Musician', known_for: 'Kirana Gharana vocalist, Bharat Ratna 2002, sang till 92, inspiration for Sanjay Bhansali film', nationality: 'Indian', birth_year: 1913, death_year: 2009, tier: 'historical' },
  { name: 'Nitish Kumar', birth_date: '1951-03-08', category: 'Politician', known_for: 'Chief Minister of Bihar, JDU leader, Bihar development model, railway minister', nationality: 'Indian', birth_year: 1951, tier: 'public_figure' },
  { name: 'Parthiv Patel', birth_date: '1985-03-09', category: 'Cricketer', known_for: 'Youngest Indian Test debutant wicketkeeper (age 17), Gujarat Lions, Gujarat captain', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Atif Aslam', birth_date: '1983-03-12', category: 'Singer', known_for: 'Pakistani-Indian singer, Woh Lamhe, Tere Sang Yaara, most streamed in India', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Shreya Ghoshal', birth_date: '1984-03-12', category: 'Singer', known_for: 'Devdas playback, Jab We Met, Bajirao Mastani, over 3000 songs, four National Awards', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Nimrat Kaur', birth_date: '1982-03-13', category: 'Actress', known_for: 'The Lunchbox, Airlift, Homeland (US series), Dasvi, major international breakthrough', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Bismillah Khan', birth_date: '1916-03-21', category: 'Musician', known_for: 'Shehnai maestro, Bharat Ratna 2001, played at India\'s first Independence Day, 80-year career', nationality: 'Indian', birth_year: 1916, death_year: 2006, tier: 'historical' },
  { name: 'Rani Mukerji', birth_date: '1978-03-21', category: 'Actress', known_for: 'Kuch Kuch Hota Hai, Kabhi Khushi Kabhie Gham, Hichki, Mardaani, Black, Saathiya', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Smriti Irani', birth_date: '1976-03-23', category: 'Politician', known_for: 'Kyunki Saas Bhi Kabhi Bahu Thi actress turned BJP minister, Education Minister', nationality: 'Indian', birth_year: 1976, tier: 'public_figure' },
  { name: 'Emraan Hashmi', birth_date: '1979-03-24', category: 'Actor', known_for: 'Jannat, Raaz series, Awarapan, Mr. X, The Body, serial kisser image', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Koneru Humpy', birth_date: '1987-03-31', category: 'Athlete', known_for: 'World Rapid Chess Champion 2019, youngest grandmaster when achieved, chess prodigy', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Kiran Mazumdar Shaw', birth_date: '1953-03-23', category: 'Business Leader', known_for: 'Founder of Biocon, India\'s first woman entrepreneur billionaire, Padma Bhushan', nationality: 'Indian', birth_year: 1953, tier: 'public_figure' },
  { name: 'Shankar Mahadevan', birth_date: '1967-03-03', category: 'Singer', known_for: 'Breathless, Dil Chahta Hai, Lagaan, Rock On, Shankar-Ehsaan-Loy trio', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Shekhar Ravjiani', birth_date: '1976-03-05', category: 'Singer', known_for: 'Vishal-Shekhar duo, Kaho Na Pyaar Hai, Don, Dhoom 3, Indian Idol judge', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Alka Yagnik', birth_date: '1966-03-20', category: 'Singer', known_for: 'Most downloaded Indian female artist globally, Pardes, Dil To Pagal Hai, 30+ years', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Shashi Kapoor', birth_date: '1938-03-18', category: 'Actor', known_for: 'Waqt, Kabhi Kabhie, Deewar, Junoon, international films with Merchant Ivory', nationality: 'Indian', birth_year: 1938, death_year: 2017, tier: 'historical' },

  // ============================================================
  // APRIL ADDITIONS
  // ============================================================
  { name: 'Rashmika Mandanna', birth_date: '1996-04-05', category: 'Actress', known_for: 'Geetha Govindam, Pushpa franchise, Animal, Goodbye, Mission Majnu, national crush', nationality: 'Indian', birth_year: 1996, tier: 'entertainment' },
  { name: 'S Janaki', birth_date: '1938-04-23', category: 'Singer', known_for: 'South India\'s most beloved playback singer, 50,000+ songs in 17 languages', nationality: 'Indian', birth_year: 1938, tier: 'historical' },
  { name: 'Manoj Bajpayee', birth_date: '1969-04-23', category: 'Actor', known_for: 'Satya, Gangs of Wasseypur, Aligarh, The Family Man, Bhonsle, one of India\'s finest', nationality: 'Indian', birth_year: 1969, tier: 'entertainment' },
  { name: 'Arshad Warsi', birth_date: '1968-04-19', category: 'Actor', known_for: 'Circuit in Munna Bhai MBBS, Golmaal series, Ishqiya, Jolly LLB, Dhamaal', nationality: 'Indian', birth_year: 1968, tier: 'entertainment' },
  { name: 'Lara Dutta', birth_date: '1978-04-16', category: 'Actress', known_for: 'Miss Universe 2000, Andaaz, Bhagam Bhag, Bell Bottom, Kaun Banega Crorepati host', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Vikram', birth_date: '1966-04-17', category: 'Actor', known_for: 'Pithamagan, Anniyan, Dhruva Natchathiram, Ponniyin Selvan, National Award winner', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Jaya Bachchan', birth_date: '1948-04-09', category: 'Actress', known_for: 'Guddi, Abhimaan, Sholay, Kabhie Kabhie, Samajwadi Party MP, wife of Amitabh', nationality: 'Indian', birth_year: 1948, tier: 'entertainment' },
  { name: 'Swara Bhasker', birth_date: '1988-04-09', category: 'Actress', known_for: 'Tanu Weds Manu, Raanjhanaa, Nil Battey Sannata, Veere Di Wedding, activist', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Kamaladevi Chattopadhyay', birth_date: '1903-04-03', category: 'Social Reformer', known_for: 'Revival of Indian handicrafts, theatre, first woman to contest election in India 1926', nationality: 'Indian', birth_year: 1903, death_year: 1988, tier: 'historical' },
  { name: 'Jaya Prada', birth_date: '1962-04-03', category: 'Actress', known_for: 'Sargam, Shaan, Thodisi Bewafai, Sharaabi, top Telugu and Hindi actress-politician', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Ghanshyam Das Birla', birth_date: '1894-04-10', category: 'Business Leader', known_for: 'Founder of Birla Group, supported Gandhi\'s independence movement financially', nationality: 'Indian', birth_year: 1894, death_year: 1983, tier: 'historical' },
  { name: 'Kishori Amonkar', birth_date: '1932-04-10', category: 'Musician', known_for: 'Jaipur Gharana vocalist, Padma Vibhushan, one of greatest vocalists of 20th century', nationality: 'Indian', birth_year: 1932, death_year: 2017, tier: 'historical' },
  { name: 'Hariharan', birth_date: '1955-04-15', category: 'Singer', known_for: 'Colonial Cousins with Lesle Lewis, ghazal singer, Bombay, Roja, Guru', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Samantha Ruth Prabhu', birth_date: '1987-04-28', category: 'Actress', known_for: 'Ye Maaya Chesave, Mahanati, The Family Man 2, Shakuntalam, Kushi', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Chandrababu Naidu', birth_date: '1950-04-20', category: 'Politician', known_for: 'Chief Minister of Andhra Pradesh, Hyderabad IT boom architect, Telugu Desam Party', nationality: 'Indian', birth_year: 1950, tier: 'public_figure' },
  { name: 'Deepa Karmakar', birth_date: '1993-04-09', category: 'Athlete', known_for: 'First Indian female gymnast to qualify for Olympics, Produnova vault specialist', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'KL Rahul', birth_date: '1992-04-18', category: 'Cricketer', known_for: 'Elegant Indian opener, IPL powerhouse, wicketkeeper-batsman, KXIP captain', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Loy Mendonsa', birth_date: '1966-04-08', category: 'Music Composer', known_for: 'Shankar-Ehsaan-Loy, Dil Chahta Hai, Don, Kabhi Alvida Naa Kehna, Kaal', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Jeetendra', birth_date: '1942-04-07', category: 'Actor', known_for: 'Jumping Jack, Nagin, Himmatwala, Tohfa, Farz, father of Ekta Kapoor and Tusshar Kapoor', nationality: 'Indian', birth_year: 1942, tier: 'entertainment' },

  // ============================================================
  // MAY ADDITIONS
  // ============================================================
  { name: 'Anushka Sharma', birth_date: '1988-05-01', category: 'Actress', known_for: 'Rab Ne Bana Di Jodi, PK, NH10, Sultan, Ae Dil Hai Mushkil, Jab Harry Met Sejal', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Ajith Kumar', birth_date: '1971-05-01', category: 'Actor', known_for: 'Thala, Mankatha, Vedalam, Viswasam, Valimai, Tamil cinema superstar', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Sam Pitroda', birth_date: '1942-05-16', category: 'Scientist', known_for: 'Telecom revolution in India, C-DOT, PCO booths that democratised phones in India', nationality: 'Indian', birth_year: 1942, tier: 'public_figure' },
  { name: 'Vicky Kaushal', birth_date: '1988-05-16', category: 'Actor', known_for: 'Masaan, Raazi, Uri: The Surgical Strike, Sardar Udham, Govinda Naam Mera', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Girish Karnad', birth_date: '1938-05-19', category: 'Author', known_for: 'Tughlaq, Hayavadana, Naga-Mandala, Jnanpith Award, actor and playwright', nationality: 'Indian', birth_year: 1938, death_year: 2019, tier: 'historical' },
  { name: 'Maharana Pratap', birth_date: '1540-05-09', category: 'Historical', known_for: 'Rajput warrior king of Mewar, Battle of Haldighati against Akbar, never surrendered', nationality: 'Indian', birth_year: 1540, death_year: 1597, tier: 'historical' },
  { name: 'Balasaraswati', birth_date: '1918-05-13', category: 'Dancer', known_for: 'Greatest Bharatanatyam dancer of 20th century, took art to international stage', nationality: 'Indian', birth_year: 1918, death_year: 1984, tier: 'historical' },
  { name: 'Mrinalini Sarabhai', birth_date: '1918-05-11', category: 'Dancer', known_for: 'Founder of Darpana Academy, classical dancer, wife of Vikram Sarabhai', nationality: 'Indian', birth_year: 1918, death_year: 2016, tier: 'historical' },
  { name: 'Sushil Kumar', birth_date: '1983-05-26', category: 'Athlete', known_for: 'Two Olympic medals in wrestling (Bronze 2008, Silver 2012), most decorated Indian wrestler', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Paresh Rawal', birth_date: '1955-05-30', category: 'Actor', known_for: 'Hera Pheri, Andaz Apna Apna, Tamanna, Oh My God, Welcome, comic genius', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Girija Devi', birth_date: '1929-05-08', category: 'Musician', known_for: 'Queen of Thumri, Banaras Gharana vocalist, revived thumri as serious classical form', nationality: 'Indian', birth_year: 1929, death_year: 2017, tier: 'historical' },
  { name: 'D Gukesh', birth_date: '2006-05-29', category: 'Athlete', known_for: 'World Chess Champion 2024 at age 18, youngest world champion in chess history', nationality: 'Indian', birth_year: 2006, tier: 'entertainment' },
  { name: 'HD Deve Gowda', birth_date: '1933-05-18', category: 'Politician', known_for: 'Prime Minister of India 1996-97, Janata Dal leader, Karnataka CM multiple times', nationality: 'Indian', birth_year: 1933, tier: 'public_figure' },

  // ============================================================
  // JUNE ADDITIONS
  // ============================================================
  { name: 'Dinesh Karthik', birth_date: '1985-06-01', category: 'Cricketer', known_for: 'Wicketkeeper-batsman, IPL star, 2022 T20 World Cup comeback, commentator', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Mani Ratnam', birth_date: '1956-06-02', category: 'Director', known_for: 'Roja, Bombay, Dil Se, Guru, Raavan, Ponniyin Selvan, greatest Tamil filmmaker', nationality: 'Indian', birth_year: 1956, tier: 'entertainment' },
  { name: 'Stuart Binny', birth_date: '1983-06-03', category: 'Cricketer', known_for: 'Best bowling figures in ODI history (6/4), all-rounder, son of Roger Binny', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Prithviraj Chauhan', birth_date: '1166-06-01', category: 'Historical', known_for: 'Last Hindu emperor of Delhi, Second Battle of Tarain, Rai Pithora, Rajput warrior king', nationality: 'Indian', birth_year: 1166, death_year: 1192, tier: 'historical' },
  { name: 'Yogi Adityanath', birth_date: '1972-06-05', category: 'Politician', known_for: 'Chief Minister of Uttar Pradesh, Hindu monk-politician, BJP leader', nationality: 'Indian', birth_year: 1972, tier: 'public_figure' },
  { name: 'Arjun Kapoor', birth_date: '1985-06-26', category: 'Actor', known_for: 'Ishaqzaade, 2 States, Gunday, Sandeep Aur Pinky Faraar, Bhoot Police', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Mithun Chakraborty', birth_date: '1950-06-16', category: 'Actor', known_for: 'Disco Dancer, Agneepath, Guru, Gunda, Prem Pratigya, national award winner', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'Ajinkya Rahane', birth_date: '1988-06-06', category: 'Cricketer', known_for: 'Led India to famous Gabba victory 2021, elegant middle-order batsman, former vice-captain', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Neha Kakkar', birth_date: '1988-06-06', category: 'Singer', known_for: 'O Humsafar, Dilbar, Coca Cola Tu, Garmi, most-followed Indian musician on Instagram', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Ehsaan Noorani', birth_date: '1967-06-21', category: 'Music Composer', known_for: 'Shankar-Ehsaan-Loy trio, guitar legend, Dil Chahta Hai, Kal Ho Naa Ho', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Pritam Chakraborty', birth_date: '1971-06-21', category: 'Music Composer', known_for: 'Jab We Met, Love Aaj Kal, Cocktail, Ae Dil Hai Mushkil, Jagga Jasoos', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Vijay', birth_date: '1974-06-22', category: 'Actor', known_for: 'Thalapathy, Mersal, Bigil, Master, Beast, Varisu, highest-grossing Tamil star', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Karisma Kapoor', birth_date: '1974-06-25', category: 'Actress', known_for: 'Andaz Apna Apna, Dil To Pagal Hai, Raja Hindustani, Zubeida, elder sister of Kareena', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Vishal Dadlani', birth_date: '1974-06-28', category: 'Singer', known_for: 'Vishal-Shekhar duo, Dostana, Dhoom 3, Bang Bang, Ra.One, Indian Idol judge', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Sunitha Upadrashta', birth_date: '1972-06-09', category: 'Singer', known_for: 'Leading Telugu playback singer, thousands of songs, most loved Telugu singer', nationality: 'Indian', birth_year: 1972, tier: 'entertainment' },
  { name: 'Leander Paes', birth_date: '1973-06-17', category: 'Athlete', known_for: 'Olympic bronze 1996 Atlanta, 18 Grand Slam doubles titles, India\'s greatest tennis player', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },

  // ============================================================
  // JULY ADDITIONS
  // ============================================================
  { name: 'Sonu Nigam', birth_date: '1973-07-30', category: 'Singer', known_for: 'Classic Bollywood playback singer, Kal Ho Naa Ho, Abhi Mujh Mein Kahin, Sandese Aate Hain', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Sonu Sood', birth_date: '1973-07-30', category: 'Actor', known_for: 'Dabangg, Simmba, Mard Ko Dard Nahi Hota, COVID-19 philanthropy, real-life hero', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Dhanush', birth_date: '1983-07-28', category: 'Actor', known_for: 'Aadukalam, 3 (Kolaveri Di), Raanjhanaa, The Gray Man, Atrangi Re, son-in-law of Rajinikanth', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Huma Qureshi', birth_date: '1986-07-28', category: 'Actress', known_for: 'Gangs of Wasseypur, Ek Thi Daayan, Badlapur, Army of the Dead, Maharani', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Dulquer Salmaan', birth_date: '1986-07-28', category: 'Actor', known_for: 'OK Kanmani, Karwaan, The Zoya Factor, Hey Sinamika, son of Mammootty', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Suriya', birth_date: '1975-07-23', category: 'Actor', known_for: 'Ghajini Tamil original, Ayan, 7aum Arivu, Soorarai Pottru, Jai Bhim, National Award', nationality: 'Indian', birth_year: 1975, tier: 'entertainment' },
  { name: 'Himesh Reshammiya', birth_date: '1973-07-23', category: 'Singer', known_for: 'Aashiq Banaya Aapne, Teraa Surroor, Radio, composer of dozens of hit Bollywood albums', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Cyrus Mistry', birth_date: '1968-07-04', category: 'Business Leader', known_for: 'Former Chairman of Tata Sons, Shapoorji Pallonji Group heir, controversial removal by Tatas', nationality: 'Indian', birth_year: 1968, death_year: 2022, tier: 'public_figure' },
  { name: 'Rakesh Jhunjhunwala', birth_date: '1960-07-05', category: 'Business Leader', known_for: 'Big Bull of Indian stock market, Warren Buffett of India, Akasa Air founder', nationality: 'Indian', birth_year: 1960, death_year: 2022, tier: 'public_figure' },
  { name: 'Paytm Vijay Shekhar Sharma', birth_date: '1978-07-08', category: 'Business Leader', known_for: 'Founder of Paytm, digital payments revolution in India, demonetisation beneficiary', nationality: 'Indian', birth_year: 1978, tier: 'public_figure' },
  { name: 'JRD Tata', birth_date: '1904-07-29', category: 'Business Leader', known_for: 'First Indian commercial pilot, Chairman Tata Group, Air India founder, Bharat Ratna', nationality: 'Indian', birth_year: 1904, death_year: 1993, tier: 'historical' },
  { name: 'Kriti Sanon', birth_date: '1990-07-27', category: 'Actress', known_for: 'Heropanti, Dilwale, Bareilly Ki Barfi, Mimi, Adipurush, National Award winner', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Mugdha Godse', birth_date: '1985-07-26', category: 'Actress', known_for: 'Fashion, Aa Dekhen Zara, Mr. X, Time Out', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Armaan Malik', birth_date: '1995-07-22', category: 'Singer', known_for: 'Main Hoon Hero Tera, Bol Do Na Zara, Wajah Tum Ho, youngest top Bollywood singer', nationality: 'Indian', birth_year: 1995, tier: 'entertainment' },
  { name: 'Shiv Nadar', birth_date: '1945-07-14', category: 'Business Leader', known_for: 'Founder of HCL Technologies, Shiv Nadar University, philanthropy champion', nationality: 'Indian', birth_year: 1945, tier: 'public_figure' },
  { name: 'Bhuvneshwar Kumar', birth_date: '1990-02-05', category: 'Cricketer', known_for: 'Swing bowler, death-over specialist, led SRH to IPL success, reverse swing expert', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Durgabai Deshmukh', birth_date: '1909-07-15', category: 'Social Reformer', known_for: 'Social worker, founded Andhra Mahila Sabha, participated in Dandi March', nationality: 'Indian', birth_year: 1909, death_year: 1981, tier: 'historical' },
  { name: 'KS Chithra', birth_date: '1963-07-27', category: 'Singer', known_for: 'South India\'s nightingale, 25,000+ songs, multiple National Awards', nationality: 'Indian', birth_year: 1963, tier: 'entertainment' },
  { name: 'Hariprasad Chaurasia', birth_date: '1938-07-01', category: 'Musician', known_for: 'Greatest living bansuri (flute) player, collaborated with John McLaughlin, Padma Vibhushan', nationality: 'Indian', birth_year: 1938, tier: 'entertainment' },
  { name: 'Sanjay Dutt', birth_date: '1959-07-29', category: 'Actor', known_for: 'Rocky, Sadak, Khalnayak, Vaastav, Munna Bhai MBBS, KGF Chapter 2', nationality: 'Indian', birth_year: 1959, tier: 'entertainment' },
  { name: 'RD Burman', birth_date: '1939-06-27', category: 'Music Composer', known_for: 'Pancham Da, Sholay music, Amar Prem, Caravan, Hare Rama Hare Krishna, cult composer', nationality: 'Indian', birth_year: 1939, death_year: 1994, tier: 'historical' },

  // ============================================================
  // AUGUST ADDITIONS
  // ============================================================
  { name: 'Genelia D\'Souza', birth_date: '1987-08-05', category: 'Actress', known_for: 'Jaane Tu Ya Jaane Na, Tujhe Meri Kasam, Force, wife of Riteish Deshmukh', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Dipa Karmakar', birth_date: '1993-08-09', category: 'Athlete', known_for: 'First Indian woman gymnast to qualify Olympics, Produnova vault, inspiration for gymnasts', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'Fahadh Faasil', birth_date: '1983-08-08', category: 'Actor', known_for: 'Carbon, Kumbalangi Nights, Joji, Vikram, Pushpa 2, finest actor in Indian cinema today', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Mirabai Chanu', birth_date: '1994-08-08', category: 'Athlete', known_for: 'Olympic silver Tokyo 2020 in weightlifting, World Champion 2017, Padma Vibhushan', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'Sara Ali Khan', birth_date: '1995-08-12', category: 'Actress', known_for: 'Kedarnath, Simmba, Love Aaj Kal, Coolie No. 1, daughter of Saif Ali Khan', nationality: 'Indian', birth_year: 1995, tier: 'entertainment' },
  { name: 'Sunidhi Chauhan', birth_date: '1983-08-14', category: 'Singer', known_for: 'Sheila Ki Jawani, Desi Girl, Beedi, Mehboob Mere, one of India\'s top female playback singers', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'MS Oberoi', birth_date: '1898-08-15', category: 'Business Leader', known_for: 'Founder of Oberoi Hotels Group, built India\'s finest luxury hotel chain', nationality: 'Indian', birth_year: 1898, death_year: 2002, tier: 'historical' },
  { name: 'Nirmala Sitharaman', birth_date: '1959-08-18', category: 'Politician', known_for: 'First full-time female Finance Minister of India, BJP leader, Defence Minister', nationality: 'Indian', birth_year: 1959, tier: 'public_figure' },
  { name: 'Rajat Sharma', birth_date: '1957-08-17', category: 'Journalist', known_for: 'Founder and Chairman of India TV, Aap Ki Adalat host, most watched news show', nationality: 'Indian', birth_year: 1957, tier: 'public_figure' },
  { name: 'Chiranjeevi', birth_date: '1955-08-22', category: 'Actor', known_for: 'Megastar of Telugu cinema, 150+ films, Khaidi, Indra, Union Minister, father of Ram Charan', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Randeep Hooda', birth_date: '1976-08-20', category: 'Actor', known_for: 'Highway, Sarabjit, Sarbjit, Sultan, Once Upon a Time in Mumbaai', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Bhavish Aggarwal', birth_date: '1985-08-28', category: 'Business Leader', known_for: 'Co-founder of Ola Cabs, Ola Electric, pioneer of Indian ride-hailing', nationality: 'Indian', birth_year: 1985, tier: 'public_figure' },
  { name: 'Vinesh Phogat', birth_date: '1994-08-25', category: 'Athlete', known_for: 'Commonwealth and Asian Games gold medallist, three-time World medallist, wrestling activist', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'HS Prannoy', birth_date: '1992-08-17', category: 'Athlete', known_for: 'Thomas Cup 2022 hero, consistent BWF tour performer, Kerala shuttler', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'R Praggnanandhaa', birth_date: '2005-08-10', category: 'Athlete', known_for: 'Chess prodigy, FIDE World Cup 2023 finalist, second youngest grandmaster history', nationality: 'Indian', birth_year: 2005, tier: 'entertainment' },
  { name: 'Gulzar', birth_date: '1934-08-18', category: 'Lyricist', known_for: 'Greatest Hindi film lyricist, Jai Ho Oscar winning song, Aandhi, Maachis films', nationality: 'Indian', birth_year: 1934, tier: 'entertainment' },
  { name: 'Amjad Khan', birth_date: '1940-11-12', category: 'Actor', known_for: 'Gabbar Singh in Sholay — most iconic villain in Indian cinema history', nationality: 'Indian', birth_year: 1940, death_year: 1992, tier: 'historical' },

  // ============================================================
  // SEPTEMBER ADDITIONS
  // ============================================================
  { name: 'Sakshi Malik', birth_date: '1992-09-03', category: 'Athlete', known_for: 'First Indian female wrestler to win Olympic medal (Bronze, Rio 2016)', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Mohammed Shami', birth_date: '1990-09-03', category: 'Cricketer', known_for: 'India\'s premier fast bowler, 2023 ODI World Cup 7 wickets in an innings, swing maestro', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Kunal Shah', birth_date: '1982-09-14', category: 'Business Leader', known_for: 'Founder of CRED, FreeCharge, serial entrepreneur, behavioural economist', nationality: 'Indian', birth_year: 1982, tier: 'public_figure' },
  { name: 'Ayushmann Khurrana', birth_date: '1984-09-14', category: 'Actor', known_for: 'Vicky Donor, Andhadhun, Bala, Article 15, Shubh Mangal Saavdhan, Dream Girl', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Radhika Apte', birth_date: '1985-09-07', category: 'Actress', known_for: 'Badlapur, Parched, Lust Stories, Sacred Games, Andhadhun, The Wedding Guest', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Ravichandran Ashwin', birth_date: '1986-09-17', category: 'Cricketer', known_for: 'World\'s best Test off-spinner, 500+ Test wickets, five-time ICC Cricketer of the Year', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Pragyan Ojha', birth_date: '1986-09-05', category: 'Cricketer', known_for: 'Left-arm spinner, 113 international wickets, crucial in 2011 World Cup squad', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Prem Chopra', birth_date: '1935-09-23', category: 'Actor', known_for: 'Prem Naam Hai Mera — legendary Bollywood villain, Do Raaste, Bobby, Kati Patang', nationality: 'Indian', birth_year: 1935, tier: 'entertainment' },
  { name: 'Chunky Pandey', birth_date: '1962-09-26', category: 'Actor', known_for: 'Aankhen, Sajaan Chale Sasural, Bhool Bhulaiyaa 2, prolific Bollywood character actor', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Divya Dutta', birth_date: '1977-09-25', category: 'Actress', known_for: 'Bhaag Milkha Bhaag, Rang De Basanti, Veer-Zaara, Delhi 6, Irada', nationality: 'Indian', birth_year: 1977, tier: 'entertainment' },
  { name: 'M.S. Subbulakshmi', birth_date: '1916-09-16', category: 'Musician', known_for: 'Greatest Carnatic vocalist, Bharat Ratna 1998, first musician to receive it, global ambassador', nationality: 'Indian', birth_year: 1916, death_year: 2004, tier: 'historical' },
  { name: 'Barkha Dutt', birth_date: '1971-12-18', category: 'Journalist', known_for: 'NDTV journalist, Kargil War coverage, The Buck Stops Here, author', nationality: 'Indian', birth_year: 1971, tier: 'public_figure' },

  // ============================================================
  // OCTOBER ADDITIONS
  // ============================================================
  { name: 'Hardik Pandya', birth_date: '1993-10-11', category: 'Cricketer', known_for: '2022 T20 World Cup hero, best Indian all-rounder, MI and GT captain', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'Nivin Pauly', birth_date: '1984-10-11', category: 'Athlete', known_for: 'Premam, Bangalore Days, Action Hero Biju, Kayamkulam Kochunni', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Pooja Hegde', birth_date: '1990-10-13', category: 'Actress', known_for: 'Ala Vaikunthapurramuloo, Radhe Shyam, Cirkus, Kisi Ka Bhai Kisi Ki Jaan', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Akbar', birth_date: '1542-10-15', category: 'Historical', known_for: 'Greatest Mughal Emperor, religious tolerance Din-i-Ilahi, Navratnas, unified India', nationality: 'Indian', birth_year: 1542, death_year: 1605, tier: 'historical' },
  { name: 'Radhakishan Damani', birth_date: '1954-10-15', category: 'Business Leader', known_for: 'Founder of DMart, India\'s richest retailer, legendary stock market investor', nationality: 'Indian', birth_year: 1954, tier: 'public_figure' },
  { name: 'Prannoy Roy', birth_date: '1949-10-15', category: 'Journalist', known_for: 'Co-founder of NDTV, pioneer of Indian television news journalism', nationality: 'Indian', birth_year: 1949, tier: 'public_figure' },
  { name: 'Aditi Rao Hydari', birth_date: '1986-10-28', category: 'Actress', known_for: 'Delhi 6, Rockstar, Bhoomi, Padmaavat, Wazir, Heeramandi', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Parineeti Chopra', birth_date: '1988-10-22', category: 'Actress', known_for: 'Ladies vs Ricky Bahl, Ishaqzaade, Daawat-e-Ishq, Saina, The Girl on the Train', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Prithviraj Sukumaran', birth_date: '1982-10-16', category: 'Actor', known_for: 'Memories, Aurangzeb, Lucifer, Jana Gana Mana, Gold, director of Bro Daddy', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Amjad Ali Khan', birth_date: '1945-10-09', category: 'Musician', known_for: 'Sarod maestro, son of Hafiz Ali Khan, Padma Vibhushan, Sangeet Natak Akademi award', nationality: 'Indian', birth_year: 1945, tier: 'entertainment' },
  { name: 'Arnab Goswami', birth_date: '1973-10-09', category: 'Journalist', known_for: 'Republic TV founder, Times Now anchor, most watched English news anchor in India', nationality: 'Indian', birth_year: 1973, tier: 'public_figure' },
  { name: 'Irfan Pathan', birth_date: '1984-10-27', category: 'Cricketer', known_for: 'Left-arm swing bowler, hat-trick in Lahore Test 2006, 2007 T20 World Cup hero', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Umesh Yadav', birth_date: '1987-10-25', category: 'Cricketer', known_for: 'Nagpur Express, fastest Indian bowler of his era, 195+ Test wickets', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Rishabh Pant', birth_date: '1997-10-04', category: 'Cricketer', known_for: 'Most aggressive Indian wicketkeeper, match-winning 89 at Gabba 2021, DC captain', nationality: 'Indian', birth_year: 1997, tier: 'entertainment' },
  { name: 'Lovlina Borgohain', birth_date: '1997-10-02', category: 'Athlete', known_for: 'Olympic bronze Tokyo 2020 in boxing, first Northeast Indian to win Olympic medal in boxing', nationality: 'Indian', birth_year: 1997, tier: 'entertainment' },
  { name: 'Washington Sundar', birth_date: '1999-10-05', category: 'Cricketer', known_for: 'Young off-spinning all-rounder, hero of Brisbane Test 2021, Tamil Nadu star', nationality: 'Indian', birth_year: 1999, tier: 'entertainment' },
  { name: 'Rakul Preet Singh', birth_date: '1990-10-10', category: 'Actress', known_for: 'De De Pyaar De, Doctor G, Runway 34, Sardar Ka Grandson, bi-lingual actress', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Tipu Sultan', birth_date: '1750-11-20', category: 'Historical', known_for: 'Tiger of Mysore, first use of rockets in warfare, fought British East India Company', nationality: 'Indian', birth_year: 1750, death_year: 1799, tier: 'historical' },
  { name: 'SD Burman', birth_date: '1906-10-01', category: 'Music Composer', known_for: 'Sachin Dev Burman, Pyaasa, Guide, Aradhana, Abhimaan, legendary Bollywood composer', nationality: 'Indian', birth_year: 1906, death_year: 1975, tier: 'historical' },
  { name: 'Shankar Jaikishan', birth_date: '1922-10-15', category: 'Music Composer', known_for: 'Shree 420, Awaara, Mera Naam Joker, composed for Raj Kapoor masterpieces', nationality: 'Indian', birth_year: 1922, death_year: 1987, tier: 'historical' },

  // ============================================================
  // NOVEMBER ADDITIONS
  // ============================================================
  { name: 'Tabu', birth_date: '1971-11-04', category: 'Actress', known_for: 'Maachis, Hum Saath Saath Hain, Chandni Bar, The Namesake, Haider, Andhadhun', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Milind Soman', birth_date: '1965-11-04', category: 'Actor', known_for: 'Ironman triathlete, Made In India music video, Captain Vyom, fitness icon', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Celina Jaitley', birth_date: '1981-11-04', category: 'Actress', known_for: 'No Entry, Golmaal Returns, Jannat, LGBTQ rights activist', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Virat Kohli', birth_date: '1988-11-05', category: 'Cricketer', known_for: 'Run machine, 80+ international centuries, fastest to 8000/9000/10000 ODI runs, King Kohli', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Anushka Shetty', birth_date: '1981-11-07', category: 'Actress', known_for: 'Baahubali as Devasena, Arundhati, Rudramadevi, Size Zero, leading Telugu actress', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'LK Advani', birth_date: '1927-11-08', category: 'Politician', known_for: 'BJP co-founder, Ram Mandir movement, Deputy PM of India, Bharat Ratna 2024', nationality: 'Indian', birth_year: 1927, tier: 'public_figure' },
  { name: 'Pullela Gopichand', birth_date: '1973-11-16', category: 'Athlete', known_for: 'All England Badminton Champion 2001, national coach who produced Saina and Sindhu', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Robin Uthappa', birth_date: '1985-11-11', category: 'Cricketer', known_for: 'Orange Cap IPL 2014, IPL star for KKR and CSK, stylish right-hand batsman', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Juhi Chawla', birth_date: '1967-11-13', category: 'Actress', known_for: 'Qayamat Se Qayamat Tak, Hum Hain Rahi Pyar Ke, Yes Boss, Darr, IPL co-owner', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Ritesh Agarwal', birth_date: '1993-11-16', category: 'Business Leader', known_for: 'Founder of OYO Rooms, youngest billionaire founder in India, Thiel Fellowship', nationality: 'Indian', birth_year: 1993, tier: 'public_figure' },
  { name: 'Sushmita Sen', birth_date: '1975-11-19', category: 'Actress', known_for: 'Miss Universe 1994, Main Hoon Na, Aarya (Disney+ series), first Indian Miss Universe', nationality: 'Indian', birth_year: 1975, tier: 'entertainment' },
  { name: 'Rani Lakshmibai', birth_date: '1828-11-19', category: 'Historical', known_for: 'Queen of Jhansi, 1857 uprising, died fighting British, symbol of Indian resistance', nationality: 'Indian', birth_year: 1828, death_year: 1858, tier: 'historical' },
  { name: 'Zeenat Aman', birth_date: '1951-11-19', category: 'Actress', known_for: 'Hare Rama Hare Krishna, Satyam Shivam Sundaram, Don, Qurbani, sex symbol of 1970s', nationality: 'Indian', birth_year: 1951, tier: 'entertainment' },
  { name: 'Verghese Kurien', birth_date: '1921-11-26', category: 'Business Leader', known_for: 'Father of White Revolution, founder of Amul, Operation Flood, Bharat Ratna', nationality: 'Indian', birth_year: 1921, death_year: 2012, tier: 'historical' },
  { name: 'Bappi Lahiri', birth_date: '1952-11-27', category: 'Music Composer', known_for: 'Disco King of India, Sharaabi, Thodi Si Bewafai, Jimmy Jimmy, gold jewellery icon', nationality: 'Indian', birth_year: 1952, death_year: 2022, tier: 'historical' },
  { name: 'Suresh Raina', birth_date: '1986-11-27', category: 'Cricketer', known_for: 'CSK captain, IPL\'s most successful batsman, Mr. IPL, left-handed middle-order star', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Suniel Shetty', birth_date: '1961-08-11', category: 'Actor', known_for: 'Waqt Hamara Hai, Mohra, Dhadkan, Border, Main Hoon Na, Phir Hera Pheri', nationality: 'Indian', birth_year: 1961, tier: 'entertainment' },
  { name: 'Yami Gautam', birth_date: '1988-11-28', category: 'Actress', known_for: 'Vicky Donor, Kaabil, Uri: The Surgical Strike, Dasvi, Lost', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Kartik Aaryan', birth_date: '1990-11-22', category: 'Actor', known_for: 'Pyaar Ka Punchnama, Sonu Ke Titu Ki Sweety, Luka Chuppi, Bhool Bhulaiyaa 2', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },

  // ============================================================
  // DECEMBER ADDITIONS
  // ============================================================
  { name: 'Nana Patekar', birth_date: '1951-01-01', category: 'Actor', known_for: 'Parinda, Krantiveer, Welcome, Ab Tak Chhappan, Natsamrat, intense character actor', nationality: 'Indian', birth_year: 1951, tier: 'entertainment' },
  { name: 'Konkona Sen Sharma', birth_date: '1979-12-03', category: 'Actress', known_for: 'Page 3, Mr. and Mrs. Iyer, Wake Up Sid, A Death in the Gunj, Lipstick Under My Burkha', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Boman Irani', birth_date: '1959-12-02', category: 'Actor', known_for: 'Munna Bhai MBBS, 3 Idiots, Don, Happy New Year, versatile Bollywood character actor', nationality: 'Indian', birth_year: 1959, tier: 'entertainment' },
  { name: 'Suresh Oberoi', birth_date: '1946-12-01', category: 'Actor', known_for: 'Ijaazat, Ram Lakhan, Jalwa, father of Vivek Oberoi', nationality: 'Indian', birth_year: 1946, tier: 'entertainment' },
  { name: 'Udit Narayan', birth_date: '1955-12-01', category: 'Singer', known_for: 'Papa Kehte Hain, Dilwale Dulhania Le Jayenge, Kuch Kuch Hota Hai, three National Awards', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Somdev Devvarman', birth_date: '1985-12-01', category: 'Athlete', known_for: 'India\'s top singles tennis player in 2000s, Davis Cup hero, Commonwealth gold 2010', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Dr. Rajendra Prasad', birth_date: '1884-12-03', category: 'Politician', known_for: 'First President of India, freedom fighter, Bihar Kesari, President 1950-1962', nationality: 'Indian', birth_year: 1884, death_year: 1963, tier: 'historical' },
  { name: 'Shikhar Dhawan', birth_date: '1985-12-05', category: 'Cricketer', known_for: 'Gabbar, stylish Indian opener, fastest century in Champions Trophy 2013', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Shreyas Iyer', birth_date: '1994-12-06', category: 'Cricketer', known_for: 'Delhi and KKR captain, middle order batsman, leg before wicket specialist', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'RP Singh', birth_date: '1985-12-06', category: 'Cricketer', known_for: 'Left-arm seamer, 2007 T20 World Cup hero, IPL Deccan Chargers', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Shekhar Kapur', birth_date: '1945-12-06', category: 'Director', known_for: 'Masoom, Mr. India, Bandit Queen, Elizabeth (Hollywood), international director', nationality: 'Indian', birth_year: 1945, tier: 'entertainment' },
  { name: 'Sharmila Tagore', birth_date: '1946-12-08', category: 'Actress', known_for: 'Apur Sansar, An Evening in Paris, Aradhana, Mausam, film personality', nationality: 'Indian', birth_year: 1946, tier: 'entertainment' },
  { name: 'Janhvi Kapoor', birth_date: '1997-03-06', category: 'Actress', known_for: 'Dhadak, Gunjan Saxena: The Kargil Girl, Good Luck Jerry, daughter of Sridevi', nationality: 'Indian', birth_year: 1997, tier: 'entertainment' },
  { name: 'Shatrughan Sinha', birth_date: '1946-12-09', category: 'Actor', known_for: 'Kalia, Dostana, Naseeb, Shotgun Sinha, politician, BJP then Congress MP', nationality: 'Indian', birth_year: 1946, tier: 'entertainment' },
  { name: 'Dia Mirza', birth_date: '1981-12-09', category: 'Actress', known_for: 'Rehnaa Hai Terre Dil Mein, Dum, Lage Raho Munna Bhai, climate activist, UNEP Goodwill Ambassador', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Rajesh Khanna', birth_date: '1942-12-29', category: 'Actor', known_for: 'First superstar of Bollywood, Anand, Aradhana, Kati Patang, 15 consecutive solo hits', nationality: 'Indian', birth_year: 1942, death_year: 2012, tier: 'entertainment' },
  { name: 'Dilip Kumar', birth_date: '1922-12-11', category: 'Actor', known_for: 'Tragedy King of Bollywood, Devdas, Mughal-e-Azam, Naya Daur, Bharat Ratna 2015', nationality: 'Indian', birth_year: 1922, death_year: 2021, tier: 'historical' },
  { name: 'Govinda', birth_date: '1963-12-21', category: 'Actor', known_for: 'Hero No. 1, Coolie No. 1, Haseena Maan Jaayegi, dance king, iconic 1990s star', nationality: 'Indian', birth_year: 1963, tier: 'entertainment' },
  { name: 'Tamannaah Bhatia', birth_date: '1989-12-21', category: 'Actress', known_for: 'Baahubali, Himmatwala, Devi, Odela Railway Station, Babli Bouncer', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'Mohammed Rafi', birth_date: '1924-12-24', category: 'Singer', known_for: 'One of greatest playback singers in history, versatile range, 26,000+ songs', nationality: 'Indian', birth_year: 1924, death_year: 1980, tier: 'historical' },
  { name: 'Naushad Ali', birth_date: '1919-12-25', category: 'Music Composer', known_for: 'Mughal-e-Azam music, Mother India, Baiju Bawra, greatest classical composer of Hindi cinema', nationality: 'Indian', birth_year: 1919, death_year: 2006, tier: 'historical' },
  { name: 'Anil Kapoor', birth_date: '1959-12-24', category: 'Actor', known_for: 'Mr. India, Tezaab, Ram Lakhan, Slumdog Millionaire, 24 (Fox), eternally young', nationality: 'Indian', birth_year: 1959, tier: 'entertainment' },
  { name: 'Neeraj Chopra', birth_date: '1997-12-24', category: 'Athlete', known_for: 'Olympic gold Tokyo 2020 in javelin, first Indian to win Olympic gold in track and field', nationality: 'Indian', birth_year: 1997, tier: 'entertainment' },
  { name: 'Richa Chadha', birth_date: '1986-12-18', category: 'Actress', known_for: 'Gangs of Wasseypur, Fukrey, Masaan, Mirzapur, Inside Edge', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Riteish Deshmukh', birth_date: '1978-12-17', category: 'Actor', known_for: 'Masti, Grand Masti, Ek Villain, Humshakals, Baaghi 3, son of Vilasrao Deshmukh', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'John Abraham', birth_date: '1972-12-17', category: 'Actor', known_for: 'Dhoom, Dostana, New York, Force, Vicky Donor, Satyameva Jayate, Pathan', nationality: 'Indian', birth_year: 1972, tier: 'entertainment' },
  { name: 'Sameera Reddy', birth_date: '1980-12-14', category: 'Actress', known_for: 'Race, Musafir, Johnny Gaddaar, De Dana Dan, body positivity advocate', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Manohar Parrikar', birth_date: '1955-12-13', category: 'Politician', known_for: 'Chief Minister of Goa, Defence Minister of India, IIT Bombay alumnus, clean politician', nationality: 'Indian', birth_year: 1955, death_year: 2019, tier: 'historical' },
  { name: 'Rajinikanth', birth_date: '1950-12-12', category: 'Actor', known_for: 'Superstar of Indian cinema, Baasha, Muthu, Sivaji, Enthiran, Kabali, global cult following', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'Yuvraj Singh', birth_date: '1981-12-12', category: 'Cricketer', known_for: 'Six sixes in an over, Player of Tournament 2011 World Cup, cancer survivor comeback', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Pranab Mukherjee', birth_date: '1935-12-11', category: 'Politician', known_for: '13th President of India, longest-serving Finance Minister, Bharat Ratna 2019', nationality: 'Indian', birth_year: 1935, death_year: 2020, tier: 'public_figure' },
  { name: 'Osho Rajneesh', birth_date: '1931-12-11', category: 'Philosopher', known_for: 'Controversial spiritual teacher, neo-sannyas movement, 650+ books, global following', nationality: 'Indian', birth_year: 1931, death_year: 1990, tier: 'historical' },
  { name: 'Subramania Bharati', birth_date: '1882-12-11', category: 'Poet', known_for: 'Tamil poet and freedom fighter, Mahakavi Bharati, champion of women\'s rights', nationality: 'Indian', birth_year: 1882, death_year: 1921, tier: 'historical' },
  { name: 'Ravish Kumar', birth_date: '1974-12-05', category: 'Journalist', known_for: 'NDTV Prime Time anchor, Ramon Magsaysay Award 2019, champion of press freedom', nationality: 'Indian', birth_year: 1974, tier: 'public_figure' },
  { name: 'Arun Jaitley', birth_date: '1952-12-28', category: 'Politician', known_for: 'Finance Minister of India, BJP leader, lawyer, GST architect', nationality: 'Indian', birth_year: 1952, death_year: 2019, tier: 'historical' },
  { name: 'Dhirubhai Ambani', birth_date: '1932-12-28', category: 'Business Leader', known_for: 'Founded Reliance Industries, rags-to-riches story, democratised equity investment in India', nationality: 'Indian', birth_year: 1932, death_year: 2002, tier: 'historical' },
  { name: 'Ratan Tata', birth_date: '1937-12-28', category: 'Business Leader', known_for: 'Chairman of Tata Group, Tata Nano, acquired Jaguar Land Rover, philanthropist, national icon', nationality: 'Indian', birth_year: 1937, death_year: 2024, tier: 'public_figure' },
  { name: 'Twinkle Khanna', birth_date: '1974-12-29', category: 'Actress', known_for: 'Barsaat, Mela, Badshah, author Mrs Funnybones, interior designer, wife of Akshay Kumar', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },

  // ============================================================
  // ADDITIONAL (CROSS-MONTH)
  // ============================================================
  { name: 'Amrish Puri', birth_date: '1932-06-22', category: 'Actor', known_for: 'Mogambo of Mr. India, Indiana Jones villain, greatest Bollywood villain ever', nationality: 'Indian', birth_year: 1932, death_year: 2005, tier: 'historical' },
  { name: 'Rishi Kapoor', birth_date: '1952-09-04', category: 'Actor', known_for: 'Bobby, Amar Akbar Anthony, Chandni, Kapoor & Sons, Mulk, son of Raj Kapoor', nationality: 'Indian', birth_year: 1952, death_year: 2020, tier: 'historical' },
  { name: 'Manisha Koirala', birth_date: '1970-08-16', category: 'Actress', known_for: 'Saudagar, Bombay, 1942: A Love Story, Dil Se, Agni Sakshi, cancer survivor', nationality: 'Indian', birth_year: 1970, tier: 'entertainment' },
  { name: 'Saif Ali Khan', birth_date: '1970-08-16', category: 'Actor', known_for: 'Dil Chahta Hai, Hum Tum, Omkaara, Love Aaj Kal, Sacred Games, Go Goa Gone', nationality: 'Indian', birth_year: 1970, tier: 'entertainment' },
  { name: 'Urmila Matondkar', birth_date: '1974-02-04', category: 'Actress', known_for: 'Rangeela, Satya, Bhoot, Kaun, Pinjar, terrifying performances in 1990s', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Shabana Azmi', birth_date: '1950-09-18', category: 'Actress', known_for: 'Ankur, Arth, Sparsh, Paar, Fire, five National Award winner, activist', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'Smita Patil', birth_date: '1955-10-17', category: 'Actress', known_for: 'Manthan, Chakra, Mirch Masala, Arth, Namak Halaal, most talented actress of her era', nationality: 'Indian', birth_year: 1955, death_year: 1986, tier: 'historical' },
  { name: 'Naseeruddin Shah', birth_date: '1950-07-20', category: 'Actor', known_for: 'Sparsh, Mirch Masala, Masoom, A Wednesday, Iqbal, one of India\'s finest actors', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'Om Puri', birth_date: '1950-10-18', category: 'Actor', known_for: 'Ardh Satya, Jaane Bhi Do Yaaron, East is East, Gandhi, Charlie Wilson\'s War', nationality: 'Indian', birth_year: 1950, death_year: 2017, tier: 'historical' },
  { name: 'Amol Palekar', birth_date: '1944-11-24', category: 'Actor', known_for: 'Chhoti Si Baat, Baton Baton Mein, Gol Maal, Naram Garam, everyman of Indian cinema', nationality: 'Indian', birth_year: 1944, tier: 'entertainment' },
  { name: 'Nayanthara', birth_date: '1984-11-18', category: 'Actress', known_for: 'Lady Superstar, Chandramukhi, Ghajini, Atlee films, Jawan', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Vivek Oberoi', birth_date: '1976-09-03', category: 'Actor', known_for: 'Company, Saathiya, Omkara, Prince, Zila Ghaziabad, PM Narendra Modi biopic', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Dino Morea', birth_date: '1975-09-03', category: 'Actor', known_for: 'Raaz, Pyaar Ishq Aur Mohabbat, Calcutta Mail, The Empire (series)', nationality: 'Indian', birth_year: 1975, tier: 'entertainment' },
  { name: 'Fardeen Khan', birth_date: '1974-03-08', category: 'Actor', known_for: 'Prem Aggan, No Entry, Jurm, Dev, Heyy Babyy, son of Feroze Khan', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Raveena Tandon', birth_date: '1974-10-26', category: 'Actress', known_for: 'Mohra, Dilwale, Andaz Apna Apna, Daman, Maatr, heroine of 1990s', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Hema Malini', birth_date: '1948-10-16', category: 'Actress', known_for: 'Dream Girl of Bollywood, Sholay, Seeta Aur Geeta, Baghban, BJP MP Mathura', nationality: 'Indian', birth_year: 1948, tier: 'entertainment' },
  { name: 'Mahesh Bhatt', birth_date: '1948-09-20', category: 'Director', known_for: 'Arth, Saaransh, Aashiqui, Sadak, Raaz producer, one of Bollywood\'s most prolific directors', nationality: 'Indian', birth_year: 1948, tier: 'entertainment' },
  { name: 'Varun Dhawan', birth_date: '1987-04-24', category: 'Actor', known_for: 'Student of the Year, Badlapur, Dilwale, Judwaa 2, Coolie No. 1, Bhediya', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Kiara Advani', birth_date: '1992-07-31', category: 'Actress', known_for: 'Kabir Singh, Good Newwz, Laxmii, Shershaah, Bhool Bhulaiyaa 2, JugJugg Jeeyo', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Mrunal Thakur', birth_date: '1992-08-01', category: 'Actress', known_for: 'Super 30, Jersey, Toofaan, Sita Ramam, Hi Nanna', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Bhumi Pednekar', birth_date: '1989-07-18', category: 'Actress', known_for: 'Dum Laga Ke Haisha, Toilet: Ek Prem Katha, Bala, Badhaai Do, climate activist', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'Kalki Koechlin', birth_date: '1984-01-10', category: 'Actress', known_for: 'Dev D, Zindagi Na Milegi Dobara, Yeh Jawaani Hai Deewani, Margarita with a Straw', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Raghuram Rajan', birth_date: '1963-02-03', category: 'Economist', known_for: 'Former Governor of Reserve Bank of India, IMF Chief Economist, Fault Lines author', nationality: 'Indian', birth_year: 1963, tier: 'public_figure' },
  { name: 'Deepak Chahar', birth_date: '1992-08-07', category: 'Cricketer', known_for: 'CSK pace bowler, hat-trick in T20I vs Bangladesh 2019, nagging line and length', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Virender Sehwag', birth_date: '1978-10-20', category: 'Cricketer', known_for: 'Nawab of Najafgarh, two triple centuries in Tests, fastest scoring opener, 8586 Test runs', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Gautam Gambhir', birth_date: '1981-10-14', category: 'Cricketer', known_for: 'Man of Tournament 2007 T20 World Cup, hero of 2011 World Cup final, BJP MP Delhi', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Zaheer Khan', birth_date: '1978-10-07', category: 'Cricketer', known_for: 'Best left-arm pace bowler India has produced, 2011 World Cup hero, 610 international wickets', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Chhatrapati Shivaji Maharaj', birth_date: '1630-02-19', category: 'Historical', known_for: 'Founder of Maratha Empire, guerrilla warfare pioneer, Hindavi Swarajya, national hero', nationality: 'Indian', birth_year: 1630, death_year: 1680, tier: 'historical' },
  { name: 'Jamsetji Tata', birth_date: '1839-03-03', category: 'Business Leader', known_for: 'Founder of Tata Group, Jamshedpur steel city, father of Indian industry', nationality: 'Indian', birth_year: 1839, death_year: 1904, tier: 'historical' },
  { name: 'Byju Raveendran', birth_date: '1980-01-04', category: 'Business Leader', known_for: 'Founder of BYJU\'S edtech, largest Indian unicorn at peak, controversial rise and fall', nationality: 'Indian', birth_year: 1980, tier: 'public_figure' },
  { name: 'Girish Mathrubootham', birth_date: '1975-04-05', category: 'Business Leader', known_for: 'Founder of Freshworks, first Indian SaaS company to IPO on Nasdaq 2021', nationality: 'Indian', birth_year: 1975, tier: 'public_figure' },
  { name: 'Amit Trivedi', birth_date: '1979-03-09', category: 'Music Composer', known_for: 'Dev D, Dum Maaro Dum, Lootera, Queen, Udta Punjab, unconventional music', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Rakhi Sawant', birth_date: '1978-11-25', category: 'Actress', known_for: 'Controversial reality TV personality, item numbers, Bigg Boss multiple times', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Vinod Khanna', birth_date: '1946-10-06', category: 'Actor', known_for: 'Muqaddar Ka Sikandar, Amar Akbar Anthony, Qurbani, Dayavan, Insaaf', nationality: 'Indian', birth_year: 1946, death_year: 2017, tier: 'historical' },
  { name: 'Sanjay Kapoor', birth_date: '1965-10-17', category: 'Actor', known_for: 'Raja, Prem Qaidi, Sirf Tum, brother of Anil Kapoor', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Murli Manohar Joshi', birth_date: '1934-01-05', category: 'Politician', known_for: 'BJP veteran, HRD Minister, introduced Sanskrit in schools, physicist', nationality: 'Indian', birth_year: 1934, tier: 'public_figure' },
  { name: 'Jaswant Singh', birth_date: '1938-01-03', category: 'Politician', known_for: 'BJP founder member, Finance Minister, External Affairs Minister, Defence Minister', nationality: 'Indian', birth_year: 1938, death_year: 2020, tier: 'historical' },

  // ============================================================
  // FILLING ZERO-CELEBRITY DATES — BATCH 2
  // ============================================================

  // January thin dates
  { name: 'Chhagan Bhujbal', birth_date: '1947-01-15', category: 'Politician', known_for: 'NCP leader, Maharashtra Deputy Chief Minister, OBC champion', nationality: 'Indian', birth_year: 1947, tier: 'public_figure' },
  { name: 'Subhash Ghai', birth_date: '1945-01-24', category: 'Director', known_for: 'Karz, Hero, Ram Lakhan, Taal, Pardes, Khalnayak — showman of Bollywood', nationality: 'Indian', birth_year: 1945, tier: 'entertainment' },
  { name: 'Poonam Dhillon', birth_date: '1962-04-18', category: 'Actress', known_for: 'Noorie, Teri Kasam, Sohni Mahiwal, BJP politician', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Raghav Juyal', birth_date: '1994-01-10', category: 'Actor', known_for: 'Dancer and actor, ABCD 2, Street Dancer 3D, Crockroaxz dance crew', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'Madan Mohan', birth_date: '1924-06-25', category: 'Music Composer', known_for: 'Woh Subah Kabhi To Aayegi, Haqeeqat, Veer-Zaara posthumous, ghazal composer', nationality: 'Indian', birth_year: 1924, death_year: 1975, tier: 'historical' },
  { name: 'Shyam Benegal', birth_date: '1934-12-14', category: 'Director', known_for: 'Ankur, Manthan, Bhumika, Susman, father of Indian parallel cinema', nationality: 'Indian', birth_year: 1934, death_year: 2024, tier: 'historical' },
  { name: 'Aruna Asaf Ali', birth_date: '1909-07-16', category: 'Freedom Fighter', known_for: 'Hoisted flag at Quit India Movement 1942, first Delhi Chief Minister', nationality: 'Indian', birth_year: 1909, death_year: 1996, tier: 'historical' },
  { name: 'Jayant Narlikar', birth_date: '1938-07-19', category: 'Scientist', known_for: 'Astrophysicist, collaborated with Fred Hoyle, steady state cosmology, Padma Vibhushan', nationality: 'Indian', birth_year: 1938, tier: 'public_figure' },
  { name: 'Rohit Bal', birth_date: '1961-01-26', category: 'Fashion Designer', known_for: 'Gudda, leading Indian fashion designer, lotus motif, bridal couture', nationality: 'Indian', birth_year: 1961, tier: 'entertainment' },
  { name: 'Remo DSouza', birth_date: '1974-04-02', category: 'Director', known_for: 'ABCD, ABCD 2, Street Dancer 3D, choreographer, dance film pioneer', nationality: 'Indian', birth_year: 1974, tier: 'entertainment' },
  { name: 'Prosenjit Chatterjee', birth_date: '1962-09-30', category: 'Actor', known_for: 'Superstar of Bengali cinema, 300+ films, Chokher Bali, Autograph', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Mani Shankar Aiyar', birth_date: '1941-01-10', category: 'Politician', known_for: 'Congress leader, diplomat, author, IFS officer, Rajiv Gandhi aide', nationality: 'Indian', birth_year: 1941, tier: 'public_figure' },
  { name: 'Charu Majumdar', birth_date: '1918-01-15', category: 'Historical', known_for: 'Founded Naxalite movement in India, Naxalbari uprising 1967, revolutionary leader', nationality: 'Indian', birth_year: 1918, death_year: 1972, tier: 'historical' },
  { name: 'VK Krishna Menon', birth_date: '1896-05-03', category: 'Politician', known_for: 'India\'s Defence Minister, UN representative, nationalist statesman, anti-colonialism', nationality: 'Indian', birth_year: 1896, death_year: 1974, tier: 'historical' },

  // February thin dates
  { name: 'Ravindra Dave', birth_date: '1920-02-01', category: 'Director', known_for: 'Gujarati and Hindi film director, Vikramaditya, Shree 420 assistant director', nationality: 'Indian', birth_year: 1920, death_year: 1995, tier: 'historical' },
  { name: 'Rati Agnihotri', birth_date: '1960-02-10', category: 'Actress', known_for: 'Ek Duje Ke Liye, Hum Kisise Kum Naheen, Mera Daaman, popular 1980s actress', nationality: 'Indian', birth_year: 1960, tier: 'entertainment' },
  { name: 'Meena Kumari', birth_date: '1933-08-01', category: 'Actress', known_for: 'Tragedy Queen, Pakeezah, Sahib Bibi Aur Ghulam, Baiju Bawra, greatest Indian actress', nationality: 'Indian', birth_year: 1933, death_year: 1972, tier: 'historical' },
  { name: 'Leela Naidu', birth_date: '1940-08-01', category: 'Actress', known_for: 'Listed Vogue most beautiful women 1954, Anuradha, The Householder', nationality: 'Indian', birth_year: 1940, death_year: 2009, tier: 'historical' },
  { name: 'Charu Sharma', birth_date: '1968-02-06', category: 'Journalist', known_for: 'ESPN-Star Sports cricket commentator and anchor, Face of the Game', nationality: 'Indian', birth_year: 1968, tier: 'public_figure' },
  { name: 'SP Hinduja', birth_date: '1935-02-19', category: 'Business Leader', known_for: 'Co-chairman of Hinduja Group, one of Britain\'s richest Indians', nationality: 'Indian', birth_year: 1935, tier: 'public_figure' },
  { name: 'Padmini Kolhapure', birth_date: '1965-11-01', category: 'Actress', known_for: 'Prem Rog, Vidhaata, Pyaar Jhukta Nahin, sister of Shivangi Kolhapure', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Uttam Kumar', birth_date: '1926-09-03', category: 'Actor', known_for: 'Mahanayak of Bengali cinema, Nayak, Chowringhee, Antony Firingee', nationality: 'Indian', birth_year: 1926, death_year: 1980, tier: 'historical' },
  { name: 'Vinayak Damodar Savarkar', birth_date: '1883-05-28', category: 'Historical', known_for: 'Veer Savarkar, Hindu Mahasabha, Hindutva ideology, 1857 First War of Independence book', nationality: 'Indian', birth_year: 1883, death_year: 1966, tier: 'historical' },
  { name: 'Jayalalithaa', birth_date: '1948-02-24', category: 'Politician', known_for: 'Chief Minister of Tamil Nadu six times, Amma, AIADMK leader, actress turned politician', nationality: 'Indian', birth_year: 1948, death_year: 2016, tier: 'historical' },

  // March thin dates
  { name: 'Sakharam Ganesh Deuskar', birth_date: '1869-03-01', category: 'Historical', known_for: 'Bengali journalist and freedom fighter, Desher Katha, nationalist literature', nationality: 'Indian', birth_year: 1869, death_year: 1912, tier: 'historical' },
  { name: 'Saeed Jaffrey', birth_date: '1929-01-08', category: 'Actor', known_for: 'Shatranj Ke Khilari, The Man Who Would Be King, My Beautiful Laundrette, Gandhi', nationality: 'Indian', birth_year: 1929, death_year: 2015, tier: 'historical' },
  { name: 'Mallika Sherawat', birth_date: '1976-10-24', category: 'Actress', known_for: 'Khwahish, Murder, Pyaar Ke Side Effects, Politics of Love, bold Bollywood actress', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Nandita Das', birth_date: '1969-07-07', category: 'Actress', known_for: 'Fire, Earth, Bawandar, Manto director, human rights activist', nationality: 'Indian', birth_year: 1969, tier: 'entertainment' },
  { name: 'Farouk Engineer', birth_date: '1938-02-25', category: 'Cricketer', known_for: 'India\'s greatest wicketkeeper-batsman of 1960s-70s, flamboyant opening batsman', nationality: 'Indian', birth_year: 1938, tier: 'entertainment' },
  { name: 'Rohan Bopanna', birth_date: '1980-03-04', category: 'Athlete', known_for: 'India\'s top doubles tennis player, ATP Masters champion, oldest world No.1 in history', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Rahul Bose', birth_date: '1967-07-27', category: 'Actor', known_for: 'Mr and Mrs Iyer, Chameli, Jhoom Barabar Jhoom, Angry Indian Goddesses, activist', nationality: 'Indian', birth_year: 1967, tier: 'entertainment' },
  { name: 'Gul Panag', birth_date: '1979-01-03', category: 'Actress', known_for: 'Miss India 1999, Dor, Manorama Six Feet Under, Turning 30, social activist', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },

  // April thin dates
  { name: 'Rakesh Roshan', birth_date: '1949-09-06', category: 'Director', known_for: 'Kaho Na Pyaar Hai, Koi Mil Gaya, Krrish franchise, father of Hrithik Roshan', nationality: 'Indian', birth_year: 1949, tier: 'entertainment' },
  { name: 'Madhavan', birth_date: '1970-06-01', category: 'Actor', known_for: 'Alaipayuthey, Tanu Weds Manu, 3 Idiots, Rocketry director and actor, Shaitaan', nationality: 'Indian', birth_year: 1970, tier: 'entertainment' },
  { name: 'Karthi', birth_date: '1977-05-25', category: 'Actor', known_for: 'Paruthiveeran, Paiyaa, Siruthai, Kaashmora, Viruman, brother of Suriya', nationality: 'Indian', birth_year: 1977, tier: 'entertainment' },
  { name: 'Simi Garewal', birth_date: '1947-10-17', category: 'Actress', known_for: 'Mera Naam Joker, Siddhartha, India\'s Most Desirable TV show host', nationality: 'Indian', birth_year: 1947, tier: 'entertainment' },
  { name: 'Vishal Bharadwaj', birth_date: '1965-08-04', category: 'Director', known_for: 'Maqbool, Omkara, Haider, Kaminey, Matru Ki Bijlee Ka Mandola, Shakespeare trilogy', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Dibakar Banerjee', birth_date: '1968-04-26', category: 'Director', known_for: 'Khosla Ka Ghosla, Oye Lucky Lucky Oye, Love Sex aur Dhokha, Shanghai', nationality: 'Indian', birth_year: 1968, tier: 'entertainment' },
  { name: 'Nagraj Manjule', birth_date: '1979-04-12', category: 'Director', known_for: 'Fandry, Sairat — biggest Marathi film ever made, National Award winner', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },

  // May thin dates
  { name: 'Chetan Sharma', birth_date: '1966-01-03', category: 'Cricketer', known_for: 'First Indian to take hat-trick in ODI World Cup 1987, India selector', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Sudha Kongara', birth_date: '1978-05-03', category: 'Director', known_for: 'Soorarai Pottru, Irudhi Suttru, National Award winning director', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Meena', birth_date: '1980-09-16', category: 'Actress', known_for: 'Sethu, Thambi, Vinnaithaandi Varuvaayaa, Basha, Rajinikanth heroine', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Jothika', birth_date: '1977-10-18', category: 'Actress', known_for: 'Kaadhale Nimmadhi, Sillunu Oru Kaadhal, 36 Vayadhinile, Magalir Mattum, comeback queen', nationality: 'Indian', birth_year: 1977, tier: 'entertainment' },
  { name: 'Mysskin', birth_date: '1978-05-06', category: 'Director', known_for: 'Anjathe, Yuddham Sei, Pisaasa, Thupparivaalan, unique Tamil noir director', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Visu', birth_date: '1934-05-18', category: 'Director', known_for: 'Tamil family drama director, Mundhanai Mudichu, Samsaram Athu Minsaram', nationality: 'Indian', birth_year: 1934, death_year: 2021, tier: 'historical' },
  { name: 'Kunal Nayyar', birth_date: '1981-05-30', category: 'Actor', known_for: 'Raj Koothrappali in The Big Bang Theory, Indian-British actor', nationality: 'Indian', birth_year: 1981, tier: 'entertainment' },
  { name: 'Varalaxmi Sarathkumar', birth_date: '1987-10-19', category: 'Actress', known_for: 'Nibunan, Sandakozhi 2, Monster, Cobra, daughter of Sarathkumar', nationality: 'Indian', birth_year: 1987, tier: 'entertainment' },
  { name: 'Siddharth', birth_date: '1979-04-17', category: 'Actor', known_for: 'Boys, Rang De Basanti, Bommarillu, Chashme Buddoor, multi-lingual actor', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'Nakul Dev Mahajan', birth_date: '1984-05-17', category: 'Actor', known_for: 'Indian-American chef and actor, Top Chef, represents India in US', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },

  // June thin dates
  { name: 'Anees Bazmee', birth_date: '1962-06-08', category: 'Director', known_for: 'No Entry, Welcome, Singh Is Kinng, Ready, Bhool Bhulaiyaa 2 and 3', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Kabir Khan', birth_date: '1971-06-01', category: 'Director', known_for: 'Kabul Express, New York, Ek Tha Tiger, Bajrangi Bhaijaan, 83', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Nag Ashwin', birth_date: '1986-06-07', category: 'Director', known_for: 'Mahanati, Kalki 2898-AD — largest Indian sci-fi film ever made', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },
  { name: 'Keerti Suresh', birth_date: '1992-10-17', category: 'Actress', known_for: 'Saamy, Remo, Thaana Serndha Koottam, Penguin, Miss India, National Award', nationality: 'Indian', birth_year: 1992, tier: 'entertainment' },
  { name: 'Ananya Panday', birth_date: '1998-10-30', category: 'Actress', known_for: 'Student of the Year 2, Gehraiyaan, Kho Gaye Hum Kahan, daughter of Chunky Pandey', nationality: 'Indian', birth_year: 1998, tier: 'entertainment' },
  { name: 'Shanaya Kapoor', birth_date: '1999-11-03', category: 'Actress', known_for: 'Bedhadak debutante, daughter of Sanjay Kapoor, fashion icon', nationality: 'Indian', birth_year: 1999, tier: 'entertainment' },
  { name: 'Ibrahim Ali Khan', birth_date: '2001-12-01', category: 'Actor', known_for: 'Son of Saif Ali Khan and Amrita Singh, upcoming Bollywood debutant', nationality: 'Indian', birth_year: 2001, tier: 'entertainment' },
  { name: 'Shankar', birth_date: '1963-08-17', category: 'Director', known_for: 'Gentleman, Mudhalvan, Enthiran, I, 2.0, Indian 2, Tamil blockbuster director', nationality: 'Indian', birth_year: 1963, tier: 'entertainment' },
  { name: 'KV Vijayendra Prasad', birth_date: '1951-06-01', category: 'Author', known_for: 'Screenwriter of Baahubali, RRR, Bajrangi Bhaijaan, father of SS Rajamouli', nationality: 'Indian', birth_year: 1951, tier: 'entertainment' },
  { name: 'Atlee', birth_date: '1986-09-03', category: 'Director', known_for: 'Raja Rani, Theri, Mersal, Bigil, Jawan — billion-dollar club Bollywood director', nationality: 'Indian', birth_year: 1986, tier: 'entertainment' },

  // July thin dates
  { name: 'Saroj Khan', birth_date: '1948-11-22', category: 'Choreographer', known_for: 'Masterji, choreographed Madhuri Dixit and Sridevi, Dola Re Dola, Ek Do Teen', nationality: 'Indian', birth_year: 1948, death_year: 2020, tier: 'historical' },
  { name: 'Rohit Shetty', birth_date: '1973-03-14', category: 'Director', known_for: 'Golmaal series, Singham, Simmba, Sooryavanshi, Indian Police Universe creator', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Puri Jagannadh', birth_date: '1966-07-01', category: 'Director', known_for: 'Pokiri, Businessman, iSmart Shankar, Liger, Telugu powerhouse director', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Thaman S', birth_date: '1984-07-21', category: 'Music Composer', known_for: 'Top Telugu music composer, Ala Vaikunthapurramuloo, Pushpa, Sarkaru Vaari Paata', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Anirudh Ravichander', birth_date: '1990-10-16', category: 'Music Composer', known_for: 'Kolaveri Di, Kaththi, Kabali, Vikram, Vettaiyan, most-streamed Tamil composer', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'DSP Devi Sri Prasad', birth_date: '1979-08-04', category: 'Music Composer', known_for: 'Arya, Race Gurram, Allu Arjun films, Pushpa composer of Oo Antava', nationality: 'Indian', birth_year: 1979, tier: 'entertainment' },
  { name: 'MM Keeravani', birth_date: '1961-07-04', category: 'Music Composer', known_for: 'Baahubali soundtrack, RRR Naatu Naatu Oscar winner, cousin of SS Rajamouli', nationality: 'Indian', birth_year: 1961, tier: 'entertainment' },
  { name: 'Chitraa', birth_date: '1983-07-13', category: 'Singer', known_for: 'Popular Tamil and Telugu playback singer, Oru Maalai, Thillalangadi songs', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Akkineni Nagarjuna', birth_date: '1959-08-29', category: 'Actor', known_for: 'King Nagarjuna, Shiva, Ninne Pelladatha, Manam, Oopiri, son of ANR', nationality: 'Indian', birth_year: 1959, tier: 'entertainment' },

  // August thin dates
  { name: 'Simbu', birth_date: '1983-02-03', category: 'Actor', known_for: 'Vinnaithaandi Varuvaayaa, Vaalu, Eeswaran, Vendhu Thanindhadha Kaadu', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Vijay Sethupathi', birth_date: '1978-01-16', category: 'Actor', known_for: 'Pizza, 96, Makkal Selvan, Vikram, Jawan, most versatile Tamil character actor', nationality: 'Indian', birth_year: 1978, tier: 'entertainment' },
  { name: 'Dhananjay', birth_date: '1983-08-06', category: 'Actor', known_for: 'Mufti, Godhi Banna Sadharana Mykattu, KGF villain, National Award Kannada', nationality: 'Indian', birth_year: 1983, tier: 'entertainment' },
  { name: 'Rakshit Shetty', birth_date: '1982-09-11', category: 'Actor', known_for: 'Ulidavaru Kandanthe, Kirik Party, 777 Charlie — biggest Kannada film globally', nationality: 'Indian', birth_year: 1982, tier: 'entertainment' },
  { name: 'Sudeep', birth_date: '1973-09-02', category: 'Actor', known_for: 'Kichcha Sudeep, Huccha, Eega, Dabangg 3, most popular Kannada actor', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Puneeth Rajkumar', birth_date: '1975-03-17', category: 'Actor', known_for: 'Appu, Raajakumara, James, Power Star of Kannada cinema, son of Rajkumar', nationality: 'Indian', birth_year: 1975, death_year: 2021, tier: 'historical' },
  { name: 'Darshan Thoogudeepa', birth_date: '1977-02-16', category: 'Actor', known_for: 'Challenging Star, Robert, Kranti, Roberrt — top Kannada action star', nationality: 'Indian', birth_year: 1977, tier: 'entertainment' },
  { name: 'Shiva Rajkumar', birth_date: '1962-07-12', category: 'Actor', known_for: 'Annavru, Mast Mast, Jai Maruthi, Bhairathi Ranagal, son of Dr Rajkumar', nationality: 'Indian', birth_year: 1962, tier: 'entertainment' },
  { name: 'Ravichandran', birth_date: '1961-04-05', category: 'Actor', known_for: 'Crazy Star, Shruthi, Preethigagi, director and producer in Kannada cinema', nationality: 'Indian', birth_year: 1961, tier: 'entertainment' },

  // September thin dates
  { name: 'Sneha Ullal', birth_date: '1985-09-23', category: 'Actress', known_for: 'Lucky, Ullasamga Utsahamga, Arabic Kuthu, introduced by Salman Khan', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Ameesha Patel', birth_date: '1976-06-09', category: 'Actress', known_for: 'Kaho Na Pyaar Hai, Gadar, Humraaz, Bhool Bhulaiyaa, Gadar 2', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Ranjit Bawa', birth_date: '1990-09-22', category: 'Singer', known_for: 'Popular Punjabi singer, Mitran Di Chatri, Jatt Brothers, Punjabi music star', nationality: 'Indian', birth_year: 1990, tier: 'entertainment' },
  { name: 'Hardy Sandhu', birth_date: '1988-09-25', category: 'Singer', known_for: 'Soch, Hornn Blow, Naah, Bijlee Bijlee, Yaar Ni Milya — Punjabi pop star', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },
  { name: 'Gurdas Maan', birth_date: '1957-01-04', category: 'Singer', known_for: 'Legend of Punjabi music, Dil Darda, Ki Banu Duniya Da, Punjab cultural ambassador', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Diljit Dosanjh', birth_date: '1984-01-06', category: 'Singer', known_for: 'Punjab Da Governor, Ikk Kudi, Do You Know, Udta Punjab actor, Coachella debut', nationality: 'Indian', birth_year: 1984, tier: 'entertainment' },
  { name: 'Ap Dhillon', birth_date: '1994-07-28', category: 'Singer', known_for: 'Brown Munde, Excuses, With You, global Punjabi music sensation', nationality: 'Indian', birth_year: 1994, tier: 'entertainment' },
  { name: 'Badshah', birth_date: '1985-11-19', category: 'Singer', known_for: 'Kar Gayi Chull, DJ Waley Babu, Genda Phool, Jugnu, king of Indian rap', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Guru Randhawa', birth_date: '1991-08-30', category: 'Singer', known_for: 'Suit Suit, High Rated Gabru, Ban Ja Rani, most streamed Punjabi artist 2017', nationality: 'Indian', birth_year: 1991, tier: 'entertainment' },
  { name: 'Darshan Raval', birth_date: '1993-09-14', category: 'Singer', known_for: 'Tera Zikr, Chogada, Leja Re, Dil Ko Karaar Aaya, romantic Hindi singer', nationality: 'Indian', birth_year: 1993, tier: 'entertainment' },
  { name: 'Jubin Nautiyal', birth_date: '1989-06-14', category: 'Singer', known_for: 'Tum Hi Aana, Lut Gaye, Raataan Lambiyan, Kehdi Ki Taang, romantic voice', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'Asees Kaur', birth_date: '1989-09-15', category: 'Singer', known_for: 'Ik Vaari Aa, Lag Ja Gale, Teri Ban Jaungi, rising female Bollywood voice', nationality: 'Indian', birth_year: 1989, tier: 'entertainment' },
  { name: 'B Praak', birth_date: '1985-09-13', category: 'Singer', known_for: 'Filhall, Mann Bharrya, Ik Vaari Aa, Qismat, soulful Punjabi singer', nationality: 'Indian', birth_year: 1985, tier: 'entertainment' },
  { name: 'Jassie Gill', birth_date: '1988-03-27', category: 'Singer', known_for: 'Patt Lainge, So High, Backbone, Punjabi singer and Bollywood actor', nationality: 'Indian', birth_year: 1988, tier: 'entertainment' },

  // October thin dates
  { name: 'Alok Nath', birth_date: '1956-07-10', category: 'Actor', known_for: 'Sanskaari Papa of Bollywood, DDLJ, Hum Saath Saath Hain, beta character', nationality: 'Indian', birth_year: 1956, tier: 'entertainment' },
  { name: 'Piyush Mishra', birth_date: '1963-07-01', category: 'Actor', known_for: 'Gulaal, Gangs of Wasseypur, Raajneeti, actor-lyricist-playwright', nationality: 'Indian', birth_year: 1963, tier: 'entertainment' },
  { name: 'Saurabh Shukla', birth_date: '1966-10-01', category: 'Actor', known_for: 'Satya, Jolly LLB, Barfi, PK, character actor who steals every scene', nationality: 'Indian', birth_year: 1966, tier: 'entertainment' },
  { name: 'Rajpal Yadav', birth_date: '1971-03-16', category: 'Actor', known_for: 'Chup Chup Ke, Bhagam Bhag, Hungama, Bhool Bhulaiyaa, comedy king', nationality: 'Indian', birth_year: 1971, tier: 'entertainment' },
  { name: 'Johnny Lever', birth_date: '1957-08-14', category: 'Actor', known_for: 'Greatest comedian in Bollywood history, Baazigar, Kuch Kuch Hota Hai, 300+ films', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Shreyas Talpade', birth_date: '1976-10-27', category: 'Actor', known_for: 'Iqbal, Dor, Om Shanti Om, Golmaal Returns, Welcome to the Jungle', nationality: 'Indian', birth_year: 1976, tier: 'entertainment' },
  { name: 'Sachin Pilgaonkar', birth_date: '1957-08-17', category: 'Actor', known_for: 'Child actor turned leading man in Marathi and Hindi films, director', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Gulshan Grover', birth_date: '1955-09-21', category: 'Actor', known_for: 'Bad Man of Bollywood, Ram Lakhan, Teri Meherbaniyan, Aitraaz, 400+ films', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'Shakti Kapoor', birth_date: '1952-09-03', category: 'Actor', known_for: 'Crime Master Gogo in Andaz Apna Apna, Betaab, Himmatwala villain, 400+ films', nationality: 'Indian', birth_year: 1952, tier: 'entertainment' },
  { name: 'Ranjeet', birth_date: '1944-07-12', category: 'Actor', known_for: 'Most prolific villain in Bollywood, Khel Khel Mein, Ram Balram, 430+ films', nationality: 'Indian', birth_year: 1944, tier: 'entertainment' },
  { name: 'Kader Khan', birth_date: '1937-10-22', category: 'Actor', known_for: 'Prolific dialogue writer and comedian, Muqaddar Ka Sikandar, Coolie, Amar Akbar Anthony', nationality: 'Indian', birth_year: 1937, death_year: 2018, tier: 'historical' },
  { name: 'Asrani', birth_date: '1941-01-01', category: 'Actor', known_for: 'Sholay jailer, prolific Hindi film comedian and character actor', nationality: 'Indian', birth_year: 1941, tier: 'entertainment' },

  // November thin dates
  { name: 'Sanjay Khan', birth_date: '1941-01-03', category: 'Actor', known_for: 'Mela, Ek Phool Do Mali, Tipu Sultan TV series producer, father of Zayed Khan', nationality: 'Indian', birth_year: 1941, tier: 'entertainment' },
  { name: 'Zayed Khan', birth_date: '1980-07-06', category: 'Actor', known_for: 'Main Hoon Na, Shabd, Dus, son of Sanjay Khan', nationality: 'Indian', birth_year: 1980, tier: 'entertainment' },
  { name: 'Akbar Khan', birth_date: '1957-11-06', category: 'Director', known_for: 'Taj Mahal An Eternal Love Story, Razia Sultan, historical epic director', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'Prakash Raj', birth_date: '1965-03-26', category: 'Actor', known_for: 'Multi-lingual actor, Singham villain, Wanted, Dabang — 5 National Awards', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'Sriram Raghavan', birth_date: '1968-11-22', category: 'Director', known_for: 'Ek Hasina Thi, Johnny Gaddaar, Badlapur, Andhadhun, Merry Christmas', nationality: 'Indian', birth_year: 1968, tier: 'entertainment' },
  { name: 'Neeraj Pandey', birth_date: '1973-11-27', category: 'Director', known_for: 'A Wednesday, Special 26, Baby, M.S. Dhoni biopic, Rustom', nationality: 'Indian', birth_year: 1973, tier: 'entertainment' },
  { name: 'Vetrimaaran', birth_date: '1977-11-28', category: 'Director', known_for: 'Polladhavan, Aadukalam, Visaranai, Vada Chennai, Viduthalai — Tamil new wave icon', nationality: 'Indian', birth_year: 1977, tier: 'entertainment' },
  { name: 'Bala', birth_date: '1969-11-09', category: 'Director', known_for: 'Sethu, Pithamagan, Naan Kadavul, Avan Ivan, Paradesi, unique Tamil auteur', nationality: 'Indian', birth_year: 1969, tier: 'entertainment' },
  { name: 'Alphons Kannanthanam', birth_date: '1955-11-25', category: 'Politician', known_for: 'IAS officer, Kerala cadre, Union Minister of Tourism, demolition man', nationality: 'Indian', birth_year: 1955, tier: 'public_figure' },

  // December thin dates — classic directors and filmmakers
  { name: 'Amir Khusrau', birth_date: '1253-06-30', category: 'Historical', known_for: 'Sufi poet, musician, Father of Qawwali, Khyal, Tarana, disciple of Nizamuddin Auliya', nationality: 'Indian', birth_year: 1253, death_year: 1325, tier: 'historical' },
  { name: 'Fakir Mohan Senapati', birth_date: '1843-01-13', category: 'Author', known_for: 'Father of modern Odia literature, Chha Mana Atha Guntha, Odia novel pioneer', nationality: 'Indian', birth_year: 1843, death_year: 1918, tier: 'historical' },
  { name: 'Babasaheb Purandare', birth_date: '1922-07-29', category: 'Author', known_for: 'Shivshahir, Padma Vibhushan, greatest authority on Chhatrapati Shivaji Maharaj', nationality: 'Indian', birth_year: 1922, death_year: 2021, tier: 'historical' },
  { name: 'V. Shantaram', birth_date: '1901-11-18', category: 'Director', known_for: 'Prabhat Film Company, Do Aankhen Barah Haath, Navrang, Jhanak Jhanak Payal Baje', nationality: 'Indian', birth_year: 1901, death_year: 1990, tier: 'historical' },
  { name: 'K. Asif', birth_date: '1922-08-14', category: 'Director', known_for: 'Mughal-e-Azam director, greatest Indian historical epic, 16 years to make', nationality: 'Indian', birth_year: 1922, death_year: 1971, tier: 'historical' },
  { name: 'Mehboob Khan', birth_date: '1907-09-09', category: 'Director', known_for: 'Mother India director, Andaz, Aan, one of Bollywood\'s greatest directors', nationality: 'Indian', birth_year: 1907, death_year: 1964, tier: 'historical' },
  { name: 'Bimal Roy', birth_date: '1909-07-12', category: 'Director', known_for: 'Do Bigha Zamin, Devdas, Madhumati, Bandini, master of Indian social realism', nationality: 'Indian', birth_year: 1909, death_year: 1966, tier: 'historical' },
  { name: 'Hrishikesh Mukherjee', birth_date: '1922-09-30', category: 'Director', known_for: 'Anand, Golmaal, Chupke Chupke, Gol Maal, Khubsoorat — greatest comedy director', nationality: 'Indian', birth_year: 1922, death_year: 2006, tier: 'historical' },
  { name: 'BR Chopra', birth_date: '1914-04-22', category: 'Director', known_for: 'Naya Daur, Waqt, Mahabharat TV series, founder of BR Films', nationality: 'Indian', birth_year: 1914, death_year: 2008, tier: 'historical' },
  { name: 'Yash Raj Chopra', birth_date: '1932-09-27', category: 'Director', known_for: 'Silsila, Chandni, DDLJ producer, Dil To Pagal Hai, romantic filmmaking king', nationality: 'Indian', birth_year: 1932, death_year: 2012, tier: 'historical' },
  { name: 'Mrinal Sen', birth_date: '1923-05-14', category: 'Director', known_for: 'Bhuvan Shome, Chorus, Akaler Sandhane, Khandahar, parallel cinema pioneer', nationality: 'Indian', birth_year: 1923, death_year: 2018, tier: 'historical' },
  { name: 'Adoor Gopalakrishnan', birth_date: '1941-07-03', category: 'Director', known_for: 'Swayamvaram, Elippathayam, Mukhamukham, Daisy, greatest Malayalam director', nationality: 'Indian', birth_year: 1941, tier: 'entertainment' },
  { name: 'Girish Kasaravalli', birth_date: '1950-01-05', category: 'Director', known_for: 'Ghatashraddha, Tabarana Kathe, Dweepa, Haseena, National Award winning Kannada director', nationality: 'Indian', birth_year: 1950, tier: 'entertainment' },
  { name: 'GV Iyer', birth_date: '1917-09-25', category: 'Director', known_for: 'Hamsa Geethe, Adi Shankaracharya — first film entirely in Sanskrit', nationality: 'Indian', birth_year: 1917, death_year: 2003, tier: 'historical' },
  { name: 'Jahnu Barua', birth_date: '1952-12-07', category: 'Director', known_for: 'Halodhia Choraye Baodhan Khai, It Rained All Night, leading Assamese director', nationality: 'Indian', birth_year: 1952, tier: 'entertainment' },
  { name: 'Rituparno Ghosh', birth_date: '1963-08-31', category: 'Director', known_for: 'Unishe April, Dahan, Utsab, Chokher Bali, Raincoat, greatest Bengali director of era', nationality: 'Indian', birth_year: 1963, death_year: 2013, tier: 'historical' },
  { name: 'Priyadarshan', birth_date: '1957-07-08', category: 'Director', known_for: 'Hera Pheri, Hulchul, Hungama, Bhagam Bhag, Kanche, Malayalam-Bollywood director', nationality: 'Indian', birth_year: 1957, tier: 'entertainment' },
  { name: 'K. Balachander', birth_date: '1930-07-09', category: 'Director', known_for: 'Apoorva Raagangal, Aval Appadithan, Ninaithale Inikkum, mentor of Rajinikanth and Kamal', nationality: 'Indian', birth_year: 1930, death_year: 2014, tier: 'historical' },
  { name: 'J. Om Prakash', birth_date: '1926-02-02', category: 'Director', known_for: 'Aayee Milan Ki Bela, Aandhi, Aarti, Apnapan, produced Aap Ki Kasam', nationality: 'Indian', birth_year: 1926, death_year: 2014, tier: 'historical' },
  { name: 'Farah Khan', birth_date: '1965-01-09', category: 'Director', known_for: 'Main Hoon Na, Om Shanti Om, Tees Maar Khan, choreographer turned director', nationality: 'Indian', birth_year: 1965, tier: 'entertainment' },
  { name: 'David Dhawan', birth_date: '1955-08-16', category: 'Director', known_for: 'Coolie No. 1, Hero No. 1, Judwaa, No Entry, comedy factory of 1990s, father of Varun', nationality: 'Indian', birth_year: 1955, tier: 'entertainment' },
  { name: 'N Chandra', birth_date: '1958-04-28', category: 'Director', known_for: 'Tezaab, Parinda, Narsimha, Nishchaiy — action thriller director of 1980s-90s', nationality: 'Indian', birth_year: 1958, tier: 'entertainment' },
  { name: 'Gautam Adani', birth_date: '1962-06-24', category: 'Businessman', known_for: 'Chairman of Adani Group, one of India\'s largest conglomerates spanning ports, airports, energy, and infrastructure. Has been Asia\'s richest person.', nationality: 'Indian', birth_year: 1962, tier: 'achievement' },
];

// Helper: get celebrities born on a specific month and day
export function getIndianCelebritiesByDate(month: number, day: number): IndianCelebrity[] {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return INDIAN_CELEBRITIES.filter(celeb => {
    const parts = celeb.birth_date.split('-');
    // Handle ancient dates (e.g. 0476-04-13)
    const celebMonth = parts[parts.length - 2];
    const celebDay = parts[parts.length - 1];
    return celebMonth === monthStr && celebDay === dayStr;
  });
}

// Helper: get all Indian celebrities for a birth year
export function getIndianCelebritiesByYear(year: number): IndianCelebrity[] {
  return INDIAN_CELEBRITIES.filter(c => c.birth_year === year);
}