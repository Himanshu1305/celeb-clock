/** Starting syllables (aksharas) per Nakshatra for baby-name selection. */
export const NAKSHATRA_AKSHARAS: Record<string, string[]> = {
  'Ashwini': ['Chu', 'Che', 'Cho', 'La'], 'Bharani': ['Li', 'Lu', 'Le', 'Lo'],
  'Krittika': ['A', 'I', 'U', 'E'], 'Rohini': ['O', 'Va', 'Vi', 'Vu'],
  'Mrigashira': ['Ve', 'Vo', 'Ka', 'Ki'], 'Ardra': ['Ku', 'Gha', 'Ing', 'Jha'],
  'Punarvasu': ['Ke', 'Ko', 'Ha', 'Hi'], 'Pushya': ['Hu', 'He', 'Ho', 'Da'],
  'Ashlesha': ['Di', 'Du', 'De', 'Do'], 'Magha': ['Ma', 'Mi', 'Mu', 'Me'],
  'Purva Phalguni': ['Mo', 'Ta', 'Ti', 'Tu'], 'Uttara Phalguni': ['Te', 'To', 'Pa', 'Pi'],
  'Hasta': ['Pu', 'Sha', 'Na', 'Tha'], 'Chitra': ['Pe', 'Po', 'Ra', 'Ri'],
  'Swati': ['Ru', 'Re', 'Ro', 'Ta'], 'Vishakha': ['Ti', 'Tu', 'Te', 'To'],
  'Anuradha': ['Na', 'Ni', 'Nu', 'Ne'], 'Jyeshtha': ['No', 'Ya', 'Yi', 'Yu'],
  'Mula': ['Ye', 'Yo', 'Bha', 'Bhi'], 'Purva Ashadha': ['Bhu', 'Dha', 'Pha', 'Dha'],
  'Uttara Ashadha': ['Bhe', 'Bho', 'Ja', 'Ji'], 'Shravana': ['Khi', 'Khu', 'Khe', 'Kho'],
  'Dhanishtha': ['Ga', 'Gi', 'Gu', 'Ge'], 'Shatabhisha': ['Go', 'Sa', 'Si', 'Su'],
  'Purva Bhadrapada': ['Se', 'So', 'Da', 'Di'], 'Uttara Bhadrapada': ['Du', 'Tha', 'Jha', 'Tra'],
  'Revati': ['De', 'Do', 'Cha', 'Chi'],
};

export const NAKSHATRA_LIST = Object.keys(NAKSHATRA_AKSHARAS);

// A few sample baby names per starting syllable (illustrative, unisex mix).
export const SAMPLE_NAMES: Record<string, string[]> = {
  Na: ['Nakul', 'Nandini', 'Naina'], Ni: ['Nikhil', 'Nisha', 'Nirav'], Nu: ['Nutan'], Ne: ['Neha', 'Neel'],
  Ma: ['Manish', 'Maya'], Ra: ['Rahul', 'Radha', 'Rohan'], Ki: ['Kiran', 'Kirti'], Ga: ['Gaurav', 'Gauri'],
  Ha: ['Harsh', 'Hansa'], Su: ['Suresh', 'Sunita'], Da: ['Dev', 'Diya'], Ki2: [],
};
