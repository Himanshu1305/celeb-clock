export interface NationalDay {
  country: string;
  flag: string;
  dayName: string;
  note: string;
}

/**
 * Curated, high-confidence static dataset of national / independence days.
 * Keyed by "MM-DD" (zero-padded). Accuracy is prioritised over coverage:
 * only well-established, fixed-Gregorian-date observances are included.
 * Movable / lunar / Hebrew-calendar dates (e.g. Israel, Thailand, Nepal)
 * are deliberately omitted.
 */
export const NATIONAL_DAYS: Record<string, NationalDay[]> = {
  "01-01": [
    { country: "Cuba", flag: "🇨🇺", dayName: "Triumph of the Revolution", note: "Marks the triumph of the Cuban Revolution in 1959." },
    { country: "Haiti", flag: "🇭🇹", dayName: "Independence Day", note: "Marks independence from France in 1804." },
    { country: "Sudan", flag: "🇸🇩", dayName: "Independence Day", note: "Marks independence from Anglo-Egyptian rule in 1956." },
  ],
  "01-04": [
    { country: "Myanmar", flag: "🇲🇲", dayName: "Independence Day", note: "Marks independence from British rule in 1948." },
  ],
  "01-26": [
    { country: "India", flag: "🇮🇳", dayName: "Republic Day", note: "Marks the constitution coming into effect in 1950." },
    { country: "Australia", flag: "🇦🇺", dayName: "Australia Day", note: "Marks the 1788 arrival of the First Fleet at Sydney Cove." },
  ],
  "02-04": [
    { country: "Sri Lanka", flag: "🇱🇰", dayName: "Independence Day", note: "Marks independence from British rule in 1948." },
  ],
  "02-06": [
    { country: "New Zealand", flag: "🇳🇿", dayName: "Waitangi Day", note: "Marks the 1840 signing of the Treaty of Waitangi." },
  ],
  "02-11": [
    { country: "Japan", flag: "🇯🇵", dayName: "National Foundation Day", note: "Commemorates the legendary founding of Japan in 660 BC." },
  ],
  "02-16": [
    { country: "Lithuania", flag: "🇱🇹", dayName: "Independence Day", note: "Marks the 1918 restoration of Lithuanian statehood." },
  ],
  "02-18": [
    { country: "The Gambia", flag: "🇬🇲", dayName: "Independence Day", note: "Marks independence from British rule in 1965." },
  ],
  "02-23": [
    { country: "Brunei", flag: "🇧🇳", dayName: "National Day", note: "Marks full independence from British protection in 1984." },
  ],
  "02-24": [
    { country: "Estonia", flag: "🇪🇪", dayName: "Independence Day", note: "Marks the 1918 declaration of Estonian independence." },
  ],
  "02-25": [
    { country: "Kuwait", flag: "🇰🇼", dayName: "National Day", note: "Marks the 1961 independence and accession of Sheikh Abdullah." },
  ],
  "02-27": [
    { country: "Dominican Republic", flag: "🇩🇴", dayName: "Independence Day", note: "Marks independence from Haiti in 1844." },
  ],
  "03-01": [
    { country: "Bosnia and Herzegovina", flag: "🇧🇦", dayName: "Independence Day", note: "Marks the 1992 independence referendum result." },
  ],
  "03-03": [
    { country: "Bulgaria", flag: "🇧🇬", dayName: "Liberation Day", note: "Marks the 1878 liberation from Ottoman rule." },
  ],
  "03-06": [
    { country: "Ghana", flag: "🇬🇭", dayName: "Independence Day", note: "Marks independence from British rule in 1957." },
  ],
  "03-12": [
    { country: "Mauritius", flag: "🇲🇺", dayName: "Independence Day", note: "Marks independence from British rule in 1968." },
  ],
  "03-17": [
    { country: "Ireland", flag: "🇮🇪", dayName: "Saint Patrick's Day", note: "National holiday honouring Ireland's patron saint." },
  ],
  "03-20": [
    { country: "Tunisia", flag: "🇹🇳", dayName: "Independence Day", note: "Marks independence from France in 1956." },
  ],
  "03-21": [
    { country: "Namibia", flag: "🇳🇦", dayName: "Independence Day", note: "Marks independence from South African administration in 1990." },
  ],
  "03-23": [
    { country: "Pakistan", flag: "🇵🇰", dayName: "Pakistan Day", note: "Commemorates the 1940 Lahore Resolution and the 1956 republic." },
  ],
  "03-25": [
    { country: "Greece", flag: "🇬🇷", dayName: "Independence Day", note: "Marks the 1821 start of the Greek War of Independence." },
  ],
  "03-26": [
    { country: "Bangladesh", flag: "🇧🇩", dayName: "Independence Day", note: "Marks the 1971 declaration of independence from Pakistan." },
  ],
  "04-04": [
    { country: "Senegal", flag: "🇸🇳", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "04-16": [
    { country: "Denmark", flag: "🇩🇰", dayName: "Queen Margrethe's Birthday", note: "Long-observed national celebration of the monarch's birthday." },
  ],
  "04-17": [
    { country: "Syria", flag: "🇸🇾", dayName: "Evacuation Day", note: "Marks the 1946 withdrawal of French troops." },
  ],
  "04-18": [
    { country: "Zimbabwe", flag: "🇿🇼", dayName: "Independence Day", note: "Marks independence from British rule in 1980." },
  ],
  "04-26": [
    { country: "Tanzania", flag: "🇹🇿", dayName: "Union Day", note: "Marks the 1964 union of Tanganyika and Zanzibar." },
  ],
  "04-27": [
    { country: "South Africa", flag: "🇿🇦", dayName: "Freedom Day", note: "Marks the first post-apartheid democratic elections in 1994." },
    { country: "Sierra Leone", flag: "🇸🇱", dayName: "Independence Day", note: "Marks independence from British rule in 1961." },
    { country: "Togo", flag: "🇹🇬", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "04-30": [
    { country: "Vietnam", flag: "🇻🇳", dayName: "Reunification Day", note: "Marks the 1975 fall of Saigon and reunification." },
  ],
  "05-03": [
    { country: "Poland", flag: "🇵🇱", dayName: "Constitution Day", note: "Commemorates the adoption of the 1791 constitution." },
  ],
  "05-09": [
    { country: "Russia", flag: "🇷🇺", dayName: "Victory Day", note: "Marks the 1945 victory over Nazi Germany." },
  ],
  "05-17": [
    { country: "Norway", flag: "🇳🇴", dayName: "Constitution Day", note: "Commemorates the signing of the 1814 constitution." },
  ],
  "05-20": [
    { country: "Cameroon", flag: "🇨🇲", dayName: "National Day", note: "Marks the 1972 unitary state referendum." },
  ],
  "05-22": [
    { country: "Yemen", flag: "🇾🇪", dayName: "Unification Day", note: "Marks the 1990 unification of North and South Yemen." },
  ],
  "05-24": [
    { country: "Eritrea", flag: "🇪🇷", dayName: "Independence Day", note: "Marks independence from Ethiopia in 1993." },
  ],
  "05-25": [
    { country: "Argentina", flag: "🇦🇷", dayName: "May Revolution Day", note: "Commemorates the 1810 May Revolution in Buenos Aires." },
    { country: "Jordan", flag: "🇯🇴", dayName: "Independence Day", note: "Marks independence from British mandate in 1946." },
  ],
  "05-26": [
    { country: "Georgia", flag: "🇬🇪", dayName: "Independence Day", note: "Marks the 1918 declaration of independence." },
  ],
  "05-28": [
    { country: "Azerbaijan", flag: "🇦🇿", dayName: "Republic Day", note: "Marks the 1918 founding of the Democratic Republic." },
  ],
  "06-02": [
    { country: "Italy", flag: "🇮🇹", dayName: "Republic Day", note: "Marks the 1946 referendum that established the republic." },
  ],
  "06-06": [
    { country: "Sweden", flag: "🇸🇪", dayName: "National Day", note: "Commemorates the 1523 election of King Gustav Vasa." },
  ],
  "06-10": [
    { country: "Portugal", flag: "🇵🇹", dayName: "Portugal Day", note: "Commemorates the death of poet Luís de Camões in 1580." },
  ],
  "06-12": [
    { country: "Philippines", flag: "🇵🇭", dayName: "Independence Day", note: "Marks the 1898 declaration of independence from Spain." },
    { country: "Russia", flag: "🇷🇺", dayName: "Russia Day", note: "Marks the 1990 declaration of state sovereignty." },
  ],
  "06-17": [
    { country: "Iceland", flag: "🇮🇸", dayName: "National Day", note: "Marks the 1944 establishment of the republic." },
  ],
  "06-23": [
    { country: "Luxembourg", flag: "🇱🇺", dayName: "National Day", note: "Official celebration of the Grand Duke's birthday." },
  ],
  "06-25": [
    { country: "Croatia", flag: "🇭🇷", dayName: "Statehood Day", note: "Marks the 1991 declaration of independence." },
    { country: "Slovenia", flag: "🇸🇮", dayName: "Statehood Day", note: "Marks the 1991 declaration of independence." },
    { country: "Mozambique", flag: "🇲🇿", dayName: "Independence Day", note: "Marks independence from Portugal in 1975." },
  ],
  "06-26": [
    { country: "Madagascar", flag: "🇲🇬", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "06-27": [
    { country: "Djibouti", flag: "🇩🇯", dayName: "Independence Day", note: "Marks independence from France in 1977." },
  ],
  "06-30": [
    { country: "DR Congo", flag: "🇨🇩", dayName: "Independence Day", note: "Marks independence from Belgium in 1960." },
  ],
  "07-01": [
    { country: "Canada", flag: "🇨🇦", dayName: "Canada Day", note: "Marks the 1867 confederation of the founding provinces." },
    { country: "Burundi", flag: "🇧🇮", dayName: "Independence Day", note: "Marks independence from Belgian administration in 1962." },
    { country: "Rwanda", flag: "🇷🇼", dayName: "Independence Day", note: "Marks independence from Belgian administration in 1962." },
  ],
  "07-03": [
    { country: "Belarus", flag: "🇧🇾", dayName: "Independence Day", note: "Marks the 1944 liberation of Minsk in World War II." },
  ],
  "07-04": [
    { country: "United States", flag: "🇺🇸", dayName: "Independence Day", note: "Marks the 1776 adoption of the Declaration of Independence." },
  ],
  "07-05": [
    { country: "Venezuela", flag: "🇻🇪", dayName: "Independence Day", note: "Marks the 1811 declaration of independence from Spain." },
    { country: "Cape Verde", flag: "🇨🇻", dayName: "Independence Day", note: "Marks independence from Portugal in 1975." },
    { country: "Algeria", flag: "🇩🇿", dayName: "Independence Day", note: "Marks independence from France in 1962." },
  ],
  "07-06": [
    { country: "Malawi", flag: "🇲🇼", dayName: "Independence Day", note: "Marks independence from British rule in 1964." },
    { country: "Comoros", flag: "🇰🇲", dayName: "Independence Day", note: "Marks independence from France in 1975." },
  ],
  "07-07": [
    { country: "Solomon Islands", flag: "🇸🇧", dayName: "Independence Day", note: "Marks independence from British rule in 1978." },
  ],
  "07-09": [
    { country: "Argentina", flag: "🇦🇷", dayName: "Independence Day", note: "Marks the 1816 declaration of independence from Spain." },
    { country: "South Sudan", flag: "🇸🇸", dayName: "Independence Day", note: "Marks independence from Sudan in 2011." },
  ],
  "07-10": [
    { country: "The Bahamas", flag: "🇧🇸", dayName: "Independence Day", note: "Marks independence from British rule in 1973." },
  ],
  "07-11": [
    { country: "Mongolia", flag: "🇲🇳", dayName: "Naadam / National Day", note: "Commemorates the 1921 revolution alongside the Naadam festival." },
  ],
  "07-14": [
    { country: "France", flag: "🇫🇷", dayName: "Bastille Day / Fête nationale", note: "Commemorates the 1789 storming of the Bastille." },
  ],
  "07-17": [
    { country: "Iraq", flag: "🇮🇶", dayName: "Republic Day", note: "Marks the 1968 revolution." },
  ],
  "07-20": [
    { country: "Colombia", flag: "🇨🇴", dayName: "Independence Day", note: "Marks the 1810 declaration of independence from Spain." },
  ],
  "07-21": [
    { country: "Belgium", flag: "🇧🇪", dayName: "National Day", note: "Marks the 1831 accession of the first Belgian king." },
  ],
  "07-23": [
    { country: "Egypt", flag: "🇪🇬", dayName: "Revolution Day", note: "Marks the 1952 revolution that ended the monarchy." },
  ],
  "07-26": [
    { country: "Liberia", flag: "🇱🇷", dayName: "Independence Day", note: "Marks the 1847 declaration of independence." },
    { country: "Maldives", flag: "🇲🇻", dayName: "Independence Day", note: "Marks independence from British protection in 1965." },
  ],
  "07-28": [
    { country: "Peru", flag: "🇵🇪", dayName: "Independence Day", note: "Marks the 1821 declaration of independence from Spain." },
  ],
  "07-30": [
    { country: "Vanuatu", flag: "🇻🇺", dayName: "Independence Day", note: "Marks independence from Anglo-French rule in 1980." },
  ],
  "08-01": [
    { country: "Switzerland", flag: "🇨🇭", dayName: "Swiss National Day", note: "Commemorates the 1291 founding pact of the Confederation." },
    { country: "Benin", flag: "🇧🇯", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-03": [
    { country: "Niger", flag: "🇳🇪", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-05": [
    { country: "Burkina Faso", flag: "🇧🇫", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-06": [
    { country: "Bolivia", flag: "🇧🇴", dayName: "Independence Day", note: "Marks the 1825 declaration of independence from Spain." },
    { country: "Jamaica", flag: "🇯🇲", dayName: "Independence Day", note: "Marks independence from British rule in 1962." },
  ],
  "08-07": [
    { country: "Ivory Coast", flag: "🇨🇮", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-09": [
    { country: "Singapore", flag: "🇸🇬", dayName: "National Day", note: "Marks separation from Malaysia and independence in 1965." },
  ],
  "08-10": [
    { country: "Ecuador", flag: "🇪🇨", dayName: "Independence Day", note: "Marks the 1809 first call for independence from Spain." },
  ],
  "08-11": [
    { country: "Chad", flag: "🇹🇩", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-14": [
    { country: "Pakistan", flag: "🇵🇰", dayName: "Independence Day", note: "Marks the 1947 creation of Pakistan at partition." },
  ],
  "08-15": [
    { country: "India", flag: "🇮🇳", dayName: "Independence Day", note: "Marks independence from British rule in 1947." },
    { country: "South Korea", flag: "🇰🇷", dayName: "Liberation Day (Gwangbokjeol)", note: "Marks the 1945 liberation from Japanese rule." },
    { country: "Liechtenstein", flag: "🇱🇮", dayName: "National Day", note: "Long-standing national holiday combined with the Assumption feast." },
    { country: "Republic of the Congo", flag: "🇨🇬", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-17": [
    { country: "Indonesia", flag: "🇮🇩", dayName: "Independence Day", note: "Marks the 1945 declaration of independence." },
    { country: "Gabon", flag: "🇬🇦", dayName: "Independence Day", note: "Marks independence from France in 1960." },
  ],
  "08-19": [
    { country: "Afghanistan", flag: "🇦🇫", dayName: "Independence Day", note: "Marks the 1919 treaty ending British influence over foreign affairs." },
  ],
  "08-20": [
    { country: "Hungary", flag: "🇭🇺", dayName: "State Foundation Day", note: "Honours Saint Stephen, the founder of the Hungarian state." },
  ],
  "08-24": [
    { country: "Ukraine", flag: "🇺🇦", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
  ],
  "08-25": [
    { country: "Uruguay", flag: "🇺🇾", dayName: "Independence Day", note: "Marks the 1825 declaration of independence." },
  ],
  "08-27": [
    { country: "Moldova", flag: "🇲🇩", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
  ],
  "08-31": [
    { country: "Malaysia", flag: "🇲🇾", dayName: "Merdeka (Independence Day)", note: "Marks independence from British rule in 1957." },
    { country: "Trinidad and Tobago", flag: "🇹🇹", dayName: "Independence Day", note: "Marks independence from British rule in 1962." },
    { country: "Kyrgyzstan", flag: "🇰🇬", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
  ],
  "09-01": [
    { country: "Uzbekistan", flag: "🇺🇿", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
  ],
  "09-02": [
    { country: "Vietnam", flag: "🇻🇳", dayName: "National Day", note: "Marks the 1945 declaration of independence." },
  ],
  "09-07": [
    { country: "Brazil", flag: "🇧🇷", dayName: "Independence Day", note: "Marks the 1822 declaration of independence from Portugal." },
  ],
  "09-09": [
    { country: "Tajikistan", flag: "🇹🇯", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
    { country: "North Korea", flag: "🇰🇵", dayName: "Day of the Foundation of the Republic", note: "Marks the 1948 founding of the DPRK." },
  ],
  "09-15": [
    { country: "Costa Rica", flag: "🇨🇷", dayName: "Independence Day", note: "Marks Central America's 1821 independence from Spain." },
    { country: "Guatemala", flag: "🇬🇹", dayName: "Independence Day", note: "Marks Central America's 1821 independence from Spain." },
    { country: "Honduras", flag: "🇭🇳", dayName: "Independence Day", note: "Marks Central America's 1821 independence from Spain." },
    { country: "Nicaragua", flag: "🇳🇮", dayName: "Independence Day", note: "Marks Central America's 1821 independence from Spain." },
    { country: "El Salvador", flag: "🇸🇻", dayName: "Independence Day", note: "Marks Central America's 1821 independence from Spain." },
  ],
  "09-16": [
    { country: "Mexico", flag: "🇲🇽", dayName: "Independence Day", note: "Commemorates the 1810 Grito de Dolores." },
    { country: "Papua New Guinea", flag: "🇵🇬", dayName: "Independence Day", note: "Marks independence from Australian administration in 1975." },
  ],
  "09-18": [
    { country: "Chile", flag: "🇨🇱", dayName: "Independence Day", note: "Marks the 1810 first governing junta." },
  ],
  "09-19": [
    { country: "Saint Kitts and Nevis", flag: "🇰🇳", dayName: "Independence Day", note: "Marks independence from British rule in 1983." },
  ],
  "09-21": [
    { country: "Armenia", flag: "🇦🇲", dayName: "Independence Day", note: "Marks the 1991 independence referendum." },
    { country: "Belize", flag: "🇧🇿", dayName: "Independence Day", note: "Marks independence from British rule in 1981." },
    { country: "Malta", flag: "🇲🇹", dayName: "Independence Day", note: "Marks independence from British rule in 1964." },
  ],
  "09-23": [
    { country: "Saudi Arabia", flag: "🇸🇦", dayName: "National Day", note: "Marks the 1932 unification of the kingdom." },
  ],
  "09-24": [
    { country: "Guinea-Bissau", flag: "🇬🇼", dayName: "Independence Day", note: "Marks the 1973 declaration of independence from Portugal." },
  ],
  "09-30": [
    { country: "Botswana", flag: "🇧🇼", dayName: "Independence Day", note: "Marks independence from British rule in 1966." },
  ],
  "10-01": [
    { country: "China", flag: "🇨🇳", dayName: "National Day", note: "Marks the 1949 founding of the People's Republic of China." },
    { country: "Nigeria", flag: "🇳🇬", dayName: "Independence Day", note: "Marks independence from British rule in 1960." },
    { country: "Cyprus", flag: "🇨🇾", dayName: "Independence Day", note: "Marks independence from British rule in 1960." },
  ],
  "10-02": [
    { country: "Guinea", flag: "🇬🇳", dayName: "Independence Day", note: "Marks independence from France in 1958." },
  ],
  "10-03": [
    { country: "Germany", flag: "🇩🇪", dayName: "Day of German Unity", note: "Marks the 1990 reunification of East and West Germany." },
  ],
  "10-04": [
    { country: "Lesotho", flag: "🇱🇸", dayName: "Independence Day", note: "Marks independence from British rule in 1966." },
  ],
  "10-09": [
    { country: "Uganda", flag: "🇺🇬", dayName: "Independence Day", note: "Marks independence from British rule in 1962." },
  ],
  "10-10": [
    { country: "Taiwan", flag: "🇹🇼", dayName: "National Day (Double Ten)", note: "Commemorates the 1911 Wuchang Uprising." },
  ],
  "10-12": [
    { country: "Spain", flag: "🇪🇸", dayName: "National Day", note: "Commemorates Columbus's 1492 arrival in the Americas." },
    { country: "Equatorial Guinea", flag: "🇬🇶", dayName: "Independence Day", note: "Marks independence from Spain in 1968." },
  ],
  "10-24": [
    { country: "Zambia", flag: "🇿🇲", dayName: "Independence Day", note: "Marks independence from British rule in 1964." },
  ],
  "10-26": [
    { country: "Austria", flag: "🇦🇹", dayName: "National Day", note: "Marks the 1955 declaration of permanent neutrality." },
  ],
  "10-28": [
    { country: "Czechia", flag: "🇨🇿", dayName: "Independence Day", note: "Marks the 1918 founding of Czechoslovakia." },
  ],
  "10-29": [
    { country: "Turkey", flag: "🇹🇷", dayName: "Republic Day", note: "Marks the 1923 proclamation of the republic." },
  ],
  "11-01": [
    { country: "Algeria", flag: "🇩🇿", dayName: "Revolution Day", note: "Marks the 1954 start of the war of independence." },
  ],
  "11-03": [
    { country: "Panama", flag: "🇵🇦", dayName: "Independence Day", note: "Marks the 1903 separation from Colombia." },
    { country: "Dominica", flag: "🇩🇲", dayName: "Independence Day", note: "Marks independence from British rule in 1978." },
  ],
  "11-09": [
    { country: "Cambodia", flag: "🇰🇭", dayName: "Independence Day", note: "Marks independence from France in 1953." },
  ],
  "11-11": [
    { country: "Poland", flag: "🇵🇱", dayName: "Independence Day", note: "Marks the 1918 restoration of Polish sovereignty." },
  ],
  "11-18": [
    { country: "Latvia", flag: "🇱🇻", dayName: "Independence Day", note: "Marks the 1918 proclamation of the republic." },
    { country: "Oman", flag: "🇴🇲", dayName: "National Day", note: "Commemorates the birthday of Sultan Qaboos and national unity." },
  ],
  "11-22": [
    { country: "Lebanon", flag: "🇱🇧", dayName: "Independence Day", note: "Marks independence from French mandate in 1943." },
  ],
  "11-25": [
    { country: "Suriname", flag: "🇸🇷", dayName: "Independence Day", note: "Marks independence from the Netherlands in 1975." },
  ],
  "11-28": [
    { country: "Mauritania", flag: "🇲🇷", dayName: "Independence Day", note: "Marks independence from France in 1960." },
    { country: "Albania", flag: "🇦🇱", dayName: "Independence Day", note: "Marks the 1912 declaration of independence from the Ottomans." },
  ],
  "11-30": [
    { country: "Barbados", flag: "🇧🇧", dayName: "Independence Day", note: "Marks independence from British rule in 1966." },
  ],
  "12-01": [
    { country: "Romania", flag: "🇷🇴", dayName: "Great Union Day", note: "Marks the 1918 union of Transylvania with Romania." },
    { country: "Central African Republic", flag: "🇨🇫", dayName: "National Day", note: "Marks the 1958 proclamation of the republic." },
  ],
  "12-02": [
    { country: "United Arab Emirates", flag: "🇦🇪", dayName: "National Day", note: "Marks the 1971 founding of the federation." },
    { country: "Laos", flag: "🇱🇦", dayName: "National Day", note: "Marks the 1975 establishment of the republic." },
  ],
  "12-05": [
    { country: "Thailand", flag: "🇹🇭", dayName: "National Day", note: "Honours the birthday of King Bhumibol Adulyadej." },
  ],
  "12-06": [
    { country: "Finland", flag: "🇫🇮", dayName: "Independence Day", note: "Marks the 1917 declaration of independence from Russia." },
  ],
  "12-09": [
    { country: "Tanzania", flag: "🇹🇿", dayName: "Independence Day", note: "Marks Tanganyika's independence from British rule in 1961." },
  ],
  "12-11": [
    { country: "Burkina Faso", flag: "🇧🇫", dayName: "National Day", note: "Marks the 1958 proclamation of the republic." },
  ],
  "12-12": [
    { country: "Kenya", flag: "🇰🇪", dayName: "Jamhuri Day", note: "Marks independence from British rule in 1963." },
  ],
  "12-16": [
    { country: "Kazakhstan", flag: "🇰🇿", dayName: "Independence Day", note: "Marks the 1991 declaration of independence." },
    { country: "Bahrain", flag: "🇧🇭", dayName: "National Day", note: "Commemorates the accession of Isa bin Salman Al Khalifa in 1961." },
  ],
  "12-18": [
    { country: "Qatar", flag: "🇶🇦", dayName: "National Day", note: "Commemorates the 1878 unification of the country." },
  ],
  "12-24": [
    { country: "Libya", flag: "🇱🇾", dayName: "Independence Day", note: "Marks independence in 1951." },
  ],
};

/**
 * Returns the national days observed on the given month/day, or an empty array.
 */
export function getNationalDays(month: number, day: number): NationalDay[] {
  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return NATIONAL_DAYS[key] ?? [];
}
