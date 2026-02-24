

## Expand Celebrity Database with International Diversity

### Current State
The database has ~1,000 entries across 12 monthly files, but is heavily US-centric. A quick audit shows:
- **Indian celebrities**: ~15-20 entries (Vidya Balan, SRK, Deepika, Rahul Dravid, Virat Kohli, MS Dhoni, Aishwarya Rai, Nehru, Indira Gandhi, etc.)
- **Chinese celebrities**: ~3-5 entries (Yao Ming, Confucius, Mao Zedong, Jackie Chan, Bruce Lee)
- **UK celebrities**: ~15-20 entries (mostly actors like Rowan Atkinson, Daniel Craig, Ed Sheeran, Kate Middleton)
- **Australian celebrities**: ~5 entries (Steve Irwin, Margot Robbie, Nicole Kidman, Kylie Minogue, Cate Blanchett, Hugh Jackman)

### What Will Be Added

Each monthly file will be updated to add 2-3 international celebrities per day where gaps exist. Target: **~300-400 new entries** spread across all 12 months.

**India (~100+ new entries)**:
- Bollywood actors: Amitabh Bachchan, Aamir Khan, Salman Khan, Hrithik Roshan, Ranveer Singh, Alia Bhatt, Priyanka Chopra, Kajol, Madhuri Dixit, Sridevi, Rekha, Kamal Haasan, Rajinikanth, etc.
- Musicians/Singers: Lata Mangeshkar, Kishore Kumar, A.R. Rahman, Shreya Ghoshal, Arijit Singh, Asha Bhosle, Sonu Nigam, Udit Narayan, etc.
- Politicians: Mahatma Gandhi, Sardar Patel, Subhas Chandra Bose, APJ Abdul Kalam, Narendra Modi, Atal Bihari Vajpayee, etc.
- Cricketers: Sachin Tendulkar, Kapil Dev, Sunil Gavaskar, Rohit Sharma, Jasprit Bumrah, etc.
- Scientists/Leaders: C.V. Raman, Homi Bhabha, Rabindranath Tagore, Satyajit Ray, etc.

**UK (~60+ new entries)**:
- Actors: Benedict Cumberbatch, Tom Hardy, Helen Mirren, Judi Dench, Ian McKellen, etc.
- Musicians: Adele, Elton John, Freddie Mercury, Paul McCartney, John Lennon, George Harrison, Mick Jagger, etc.
- Politicians/Royals: Winston Churchill, Margaret Thatcher, Queen Elizabeth II, Queen Victoria, etc.
- Scientists: Charles Darwin (exists), Alan Turing, Tim Berners-Lee, etc.

**Australia (~40+ new entries)**:
- Actors: Chris Hemsworth, Russell Crowe, Heath Ledger, Mel Gibson (exists), Naomi Watts, etc.
- Musicians: AC/DC members, INXS, Sia, Keith Urban, etc.
- Athletes: Don Bradman, Shane Warne, Steve Smith, etc.
- Others: Rupert Murdoch, etc.

**China (~40+ new entries)**:
- Actors: Jackie Chan (verify), Jet Li, Gong Li, Zhang Ziyi, Fan Bingbing, etc.
- Directors: Zhang Yimou, Ang Lee, Wong Kar-wai, etc.
- Politicians/Leaders: Sun Yat-sen, Deng Xiaoping, Xi Jinping, etc.
- Athletes: Liu Xiang, Li Na, etc.
- Business: Jack Ma, etc.

### Technical Approach

Each of the 12 monthly files (`january.ts` through `december.ts`) will be updated:
- Add new person entries to existing date keys
- Each entry follows the existing `WikiPerson` format with `name`, `birthDate`, `profession`, `category`, `description`, and `wikipediaUrl`
- No structural changes needed -- just adding entries to the arrays
- No changes to `index.ts`, `types.ts`, `birthdayData.ts`, or any other files

### File Changes

| File | Change |
|------|--------|
| `src/data/birthdays/january.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/february.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/march.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/april.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/may.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/june.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/july.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/august.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/september.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/october.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/november.ts` | Add ~25-35 international celebrities |
| `src/data/birthdays/december.ts` | Add ~25-35 international celebrities |

### Result

- Database grows from ~1,000 to ~1,300-1,400 entries
- Every day will have 5-8 celebrities with global representation
- Indian users will see familiar Bollywood stars, cricketers, and leaders
- UK, Australian, and Chinese celebrities will be well represented
- No API calls needed for most date lookups

