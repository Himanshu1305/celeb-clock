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
];

// Helper: get celebrities born on a specific month and day
export function getIndianCelebritiesByDate(month: number, day: number): IndianCelebrity[] {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return INDIAN_CELEBRITIES.filter(celeb => {
    const parts = celeb.birth_date.split('-');
    // Handle ancient dates (e.g. 0476-04-13)
    const celebMonth = parts[1];
    const celebDay = parts[2];
    return celebMonth === monthStr && celebDay === dayStr;
  });
}

// Helper: get all Indian celebrities for a birth year
export function getIndianCelebritiesByYear(year: number): IndianCelebrity[] {
  return INDIAN_CELEBRITIES.filter(c => c.birth_year === year);
}