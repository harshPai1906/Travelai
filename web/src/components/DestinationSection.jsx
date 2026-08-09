import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, DollarSign, ArrowUpRight, MapPin, Sparkles, Compass, Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: '🌟 All Destinations' },
  { id: 'spiritual', label: '🕉️ Spiritual & Sacred' },
  { id: 'hillstation', label: '🏔️ Hill Stations & Kashmir' },
  { id: 'beach', label: '🏖️ Beaches & Islands' },
  { id: 'architecture', label: '🏰 Architecture & Heritage' },
  { id: 'south_iconic', label: '🌊 Kanyakumari & South' },
];

const DESTINATIONS = [
  // --- KASHMIR & HILL STATIONS ---
  {
    city: 'Srinagar & Gulmarg',
    state: 'Jammu & Kashmir',
    flag: '🏔️',
    category: 'hillstation',
    tag: 'Paradise on Earth',
    budget: '₹25,000 - ₹45,000',
    weather: '12°C Alpine Breeze',
    highlights: ['Dal Lake Shikara', 'Gulmarg Gondola Ride', 'Pahalgam Betaab Valley', 'Shalimar Bagh'],
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
    query: 'Plan a 6-day trip to Kashmir including Srinagar Dal Lake houseboat stay, Gulmarg Gondola snow point, and Pahalgam valley'
  },
  {
    city: 'Leh & Ladakh',
    state: 'Ladakh',
    flag: '🏔️',
    category: 'hillstation',
    tag: 'Land of High Passes',
    budget: '₹35,000 - ₹60,000',
    weather: '8°C Sunny Crisp',
    highlights: ['Pangong Tso Lake', 'Nubra Valley Sand Dunes', 'Khardung La Pass', 'Magnetic Hill'],
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    query: 'Plan a 7-day Leh Ladakh road trip covering Pangong Lake, Nubra Valley, Khardung La pass, and monasteries'
  },
  {
    city: 'Manali & Solang Valley',
    state: 'Himachal Pradesh',
    flag: '🌲',
    category: 'hillstation',
    tag: 'Valley of Gods',
    budget: '₹18,000 - ₹32,000',
    weather: '16°C Pleasant',
    highlights: ['Atal Tunnel', 'Solang Valley Adventure', 'Hadimba Temple', 'Old Manali Cafes'],
    image: 'https://images.unsplash.com/photo-1626714424823-3e1e24747716?w=800&q=80',
    query: 'Plan a 5-day Manali vacation including Solang valley sports, Atal Tunnel trip to Sissu, and Old Manali'
  },
  {
    city: 'Munnar Tea Gardens',
    state: 'Kerala',
    flag: '🌿',
    category: 'hillstation',
    tag: 'Green Paradise of South',
    budget: '₹15,000 - ₹28,000',
    weather: '19°C Cool Mist',
    highlights: ['Tea Estate Walks', 'Eravikulam Park', 'Mattupetty Dam', 'Top Station Sunset'],
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
    query: 'Plan a 4-day trip to Munnar tea plantations including Eravikulam Nilgiri Tahr safari and lake boating'
  },
  {
    city: 'Ooty & Coonoor',
    state: 'Tamil Nadu',
    flag: '🚂',
    category: 'hillstation',
    tag: 'Queen of Hill Stations',
    budget: '₹14,000 - ₹25,000',
    weather: '17°C Fresh Mountain Air',
    highlights: ['Nilgiri Toy Train', 'Botanical Gardens', 'Doddabetta Peak', 'Dolphin Nose'],
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=800&q=80',
    query: 'Plan a 4-day Ooty & Coonoor itinerary featuring the Nilgiri Mountain Railway toy train and tea factory visits'
  },

  // --- KANYAKUMARI & SOUTH ICONIC ---
  {
    city: 'Kanyakumari & Cape Comorin',
    state: 'Tamil Nadu',
    flag: '🌊',
    category: 'south_iconic',
    tag: 'Southernmost Tip of India',
    budget: '₹12,000 - ₹22,000',
    weather: '28°C Ocean Breeze',
    highlights: ['Vivekananda Rock Memorial', 'Thiruvalluvar Statue', 'Triveni Sangam Sunset', 'Kumari Amman Temple'],
    image: 'https://images.unsplash.com/photo-1621831971375-998f1f7535b9?w=800&q=80',
    query: 'Plan a 3-day trip to Kanyakumari covering Vivekananda Rock Memorial, Thiruvalluvar Statue, Triveni Sangam sunrise & sunset, and Padmanabhapuram Palace'
  },
  {
    city: 'Rameswaram & Dhanushkodi',
    state: 'Tamil Nadu',
    flag: '🚩',
    category: 'south_iconic',
    tag: 'Sacred Island & Ghost Town',
    budget: '₹12,000 - ₹20,000',
    weather: '29°C Coastal Warmth',
    highlights: ['Ramanathaswamy Temple Corridor', 'Pamban Sea Bridge', 'Dhanushkodi End of India', 'APJ Abdul Kalam Memorial'],
    image: 'https://images.unsplash.com/photo-1627894006066-b45786638063?w=800&q=80',
    query: 'Plan a 3-day spiritual pilgrimage to Rameswaram, Dhanushkodi ghost town, and Pamban bridge'
  },
  {
    city: 'Alleppey & Backwaters',
    state: 'Kerala',
    flag: '🚣‍♂️',
    category: 'south_iconic',
    tag: 'Venice of the East',
    budget: '₹18,000 - ₹35,000',
    weather: '27°C Tropical Breeze',
    highlights: ['Overnight Houseboat Cruise', 'Vembanad Lake', 'Marari Beach Sunset', 'Kumarakom Bird Sanctuary'],
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
    query: 'Plan a 4-day Kerala backwater trip with deluxe houseboat stay in Alleppey and beach resort in Marari'
  },
  {
    city: 'Madurai & Chettinad',
    state: 'Tamil Nadu',
    flag: '🏛️',
    category: 'south_iconic',
    tag: 'Nectar City of Temples',
    budget: '₹10,000 - ₹20,000',
    weather: '30°C Warm & Vibrant',
    highlights: ['Meenakshi Amman Temple', 'Thirumalai Nayakkar Mahal', 'Jigarthanda Tasting', 'Heritage Mansions'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    query: 'Plan a 3-day trip to Madurai focusing on Meenakshi Amman Temple architecture, Nayakkar Palace, and local street food'
  },

  // --- SPIRITUAL & SACRED ---
  {
    city: 'Varanasi (Kashi)',
    state: 'Uttar Pradesh',
    flag: '🕉️',
    category: 'spiritual',
    tag: 'Spiritual Capital of India',
    budget: '₹12,000 - ₹22,000',
    weather: '24°C Pleasant',
    highlights: ['Dashashwamedh Ghat Evening Aarti', 'Kashi Vishwanath Corridor', 'Sunrise Boat Ride', 'Sarnath Buddhist Stupa'],
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
    query: 'Plan a 4-day spiritual journey in Varanasi covering Ganga Aarti, Kashi Vishwanath temple corridor, sunrise boat ride, and Sarnath'
  },
  {
    city: 'Golden Temple (Amritsar)',
    state: 'Punjab',
    flag: '🪯',
    category: 'spiritual',
    tag: 'Nectar Pond of Immortality',
    budget: '₹10,000 - ₹18,000',
    weather: '22°C Pleasant',
    highlights: ['Sri Harmandir Sahib (Golden Temple)', 'Langar Community Kitchen', 'Wagah Border Ceremony', 'Jallianwala Bagh'],
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80',
    query: 'Plan a 3-day trip to Amritsar featuring Sri Harmandir Sahib Golden Temple, Wagah Border retreat parade, and food walks'
  },
  {
    city: 'Kedarnath & Badrinath',
    state: 'Uttarakhand',
    flag: '🏔️',
    category: 'spiritual',
    tag: 'Sacred Himalayan Char Dham',
    budget: '₹25,000 - ₹45,000',
    weather: '10°C Mountain Crisp',
    highlights: ['Kedarnath Jyotirlinga Temple', 'Badrinath Shrine', 'Helicopter / Trek Route', 'Mana Village Last Indian Border'],
    image: 'https://images.unsplash.com/photo-1626714424823-3e1e24747716?w=800&q=80',
    query: 'Plan a 6-day Himalayan yatra to Kedarnath and Badrinath including trek tips, stay booking, and Mana village tour'
  },
  {
    city: 'Ayodhya Ram Mandir',
    state: 'Uttar Pradesh',
    flag: '🚩',
    category: 'spiritual',
    tag: 'Sacred Birthplace of Lord Ram',
    budget: '₹10,000 - ₹18,000',
    weather: '25°C Mild',
    highlights: ['Shri Ram Janmabhoomi Mandir', 'Hanuman Garhi Temple', 'Saryu River Ghat Aarti', 'Kanak Bhawan'],
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=800&q=80',
    query: 'Plan a 3-day pilgrimage to Ayodhya covering Shri Ram Janmabhoomi Temple, Hanuman Garhi, Saryu Ghat Aarti, and heritage sites'
  },
  {
    city: 'Rishikesh & Haridwar',
    state: 'Uttarakhand',
    flag: '🧘‍♂️',
    category: 'spiritual',
    tag: 'Yoga Capital of the World',
    budget: '₹10,000 - ₹20,000',
    weather: '21°C Refreshing',
    highlights: ['Laxman Jhula & Ram Jhula', 'Ganga Rafting Adventure', 'Har Ki Pauri Evening Aarti', 'Beatles Ashram'],
    image: 'https://images.unsplash.com/photo-1591779051696-1c3fa1469a79?w=800&q=80',
    query: 'Plan a 4-day trip to Haridwar and Rishikesh covering Har Ki Pauri Ganga Aarti, white water rafting, yoga ashrams, and Beatles Ashram'
  },

  // --- ARCHITECTURE & HERITAGE ---
  {
    city: 'Taj Mahal & Agra Fort',
    state: 'Uttar Pradesh',
    flag: '🕌',
    category: 'architecture',
    tag: 'Wonder of the World',
    budget: '₹12,000 - ₹22,000',
    weather: '24°C Clear',
    highlights: ['Sunrise at Taj Mahal', 'Agra Fort Palaces', 'Fatehpur Sikri Royal Complex', 'Mehtab Bagh Views'],
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    query: 'Plan a 3-day Golden Triangle segment to Agra featuring sunrise Taj Mahal visit, Agra Fort, and Fatehpur Sikri'
  },
  {
    city: 'Jaipur Pink City',
    state: 'Rajasthan',
    flag: '🏰',
    category: 'architecture',
    tag: 'Royal Heritage & Forts',
    budget: '₹15,000 - ₹28,000',
    weather: '26°C Sunny',
    highlights: ['Amber Fort Elephant Ride', 'Hawa Mahal Palace of Winds', 'City Palace Museum', 'Nahargarh Sunset'],
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
    query: 'Plan a 4-day heritage tour of Jaipur including Amber Fort light show, Hawa Mahal, City Palace, and royal Rajasthani dining'
  },
  {
    city: 'Hampi Ancient Ruins',
    state: 'Karnataka',
    flag: '🏛️',
    category: 'architecture',
    tag: 'UNESCO Vijayanagara Empire',
    budget: '₹12,000 - ₹20,000',
    weather: '28°C Sunny',
    highlights: ['Vittala Stone Chariot', 'Virupaksha Temple', 'Coracle Ride on Tungabhadra', 'Matanga Hill Sunrise'],
    image: 'https://images.unsplash.com/photo-1627894006066-b45786638063?w=800&q=80',
    query: 'Plan a 3-day architectural tour of Hampi UNESCO ruins, stone chariot, coracle river rides, and bouldering hills'
  },
  {
    city: 'Ajanta & Ellora Caves',
    state: 'Maharashtra',
    flag: '🗿',
    category: 'architecture',
    tag: 'Monolithic Rock-Cut Masterpieces',
    budget: '₹12,000 - ₹22,000',
    weather: '27°C Sunny',
    highlights: ['Kailash Temple Cave 16', 'Ajanta Ancient Murals', 'Bibi Ka Maqbara', 'Daulatabad Fort'],
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
    query: 'Plan a 3-day trip to Chhatrapati Sambhajinagar (Aurangabad) exploring Kailash Temple Ellora, Ajanta frescoes, and Daulatabad Fort'
  },

  // --- BEACHES & ISLANDS ---
  {
    city: 'Goa Beaches & Heritage',
    state: 'Goa',
    flag: '🏖️',
    category: 'beach',
    tag: 'Beach & Party Capital',
    budget: '₹20,000 - ₹40,000',
    weather: '29°C Tropical Warmth',
    highlights: ['Palolem & Anjuna Beaches', 'Water Sports & Parasailing', 'Fontainhas French Quarter', 'Dudhsagar Waterfalls'],
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    query: 'Plan a 5-day Goa vacation covering North Goa water sports, South Goa peaceful beaches, Old Goa churches, and Dudhsagar falls'
  },
  {
    city: 'Andaman & Nicobar',
    state: 'Andaman Islands',
    flag: '🏝️',
    category: 'beach',
    tag: 'Crystal Clear Marine Paradise',
    budget: '₹40,000 - ₹75,000',
    weather: '28°C Ocean Breeze',
    highlights: ['Radhanagar Beach Havelock', 'Scuba Diving & Coral Reefs', 'Cellular Jail Light Show', 'Neil Island Natural Bridge'],
    image: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800&q=80',
    query: 'Plan a 6-day Andaman Islands tropical tour with Havelock Island scuba diving, Radhanagar beach, and Port Blair Cellular Jail'
  },
  {
    city: 'Gokarna Om Beach',
    state: 'Karnataka',
    flag: '🌅',
    category: 'beach',
    tag: 'Serene Temple & Trek Beaches',
    budget: '₹10,000 - ₹18,000',
    weather: '27°C Sunny',
    highlights: ['Five Beach Trek', 'Om Beach Sunset', 'Mahabaleshwar Temple', 'Kudle Beach Shacks'],
    image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80',
    query: 'Plan a 3-day Gokarna beach trekking getaway covering Om Beach, Kudle Beach, Paradise Beach trek, and temple visit'
  },
  {
    city: 'Puducherry (Pondicherry)',
    state: 'Union Territory',
    flag: '🇫🇷',
    category: 'beach',
    tag: 'French Riviera of the East',
    budget: '₹12,000 - ₹22,000',
    weather: '28°C Pleasant',
    highlights: ['White Town French Villas', 'Promenade Beach Walk', 'Auroville Matrimandir', 'Paradise Beach Boat Trip'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    query: 'Plan a 3-day French Riviera style trip to Pondicherry covering White Town heritage streets, Auroville, and Paradise beach'
  }
];

export default function DestinationSection({ onSelectDestination }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredDestinations = DESTINATIONS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.state.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.tag.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.highlights.some(h => h.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="space-y-6 pt-6" id="india-destinations">
      {/* Header Container */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7D9AF6]/10 text-xs font-bold text-[#7D9AF6] uppercase tracking-wider mb-2 border border-[#7D9AF6]/20">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover India's Wonders</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Famous Indian Places & Experiences
          </h2>
          <p className="text-sm text-[#6B7280] mt-1">
            Explore spiritual capitals, snow peaks in Kashmir, tip of India at Kanyakumari, pristine beaches & UNESCO heritage.
          </p>
        </div>

        {/* Search Bar inside Section */}
        <div className="relative min-w-[260px] max-w-full">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search Kanyakumari, Kashmir, Taj Mahal..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E7EAF6] text-xs font-semibold text-[#1F2937] focus:outline-none focus:border-[#7D9AF6] shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 cursor-pointer flex items-center gap-1.5 border ${activeCategory === cat.id
              ? 'bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white border-transparent shadow-md shadow-[#7D9AF6]/30 scale-[1.02]'
              : 'bg-white border-[#E7EAF6] text-[#4B5563] hover:border-[#7D9AF6]/60 hover:text-[#7D9AF6]'
              }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDestinations.map((item, idx) => (
            <motion.div
              layout
              key={item.city}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => onSelectDestination(item.query)}
              className="group cursor-pointer bg-white rounded-[24px] overflow-hidden border border-[#E7EAF6] shadow-sm hover:shadow-2xl hover:shadow-[#7D9AF6]/20 hover:border-[#7D9AF6]/50 transition-all duration-500 relative flex flex-col justify-between"
            >
              <div>
                {/* 16:9 Image Banner */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/60 text-[11px] font-bold text-[#1F2937] flex items-center gap-1 shadow-sm">
                      <span>{item.flag}</span>
                      <span>{item.state}</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-300/30">
                      {item.tag}
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                  {/* Title & Location inside Image */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl font-extrabold tracking-tight drop-shadow-md">
                      {item.city}
                    </h3>
                  </div>
                </div>

                {/* Highlights Tags */}
                <div className="p-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {item.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-lg bg-[#FFFDF7] border border-[#E7EAF6] text-[11px] font-semibold text-[#4B5563] group-hover:border-[#7D9AF6]/30 group-hover:text-[#7D9AF6] transition-colors"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Budget & Weather */}
              <div className="p-4 bg-[#F9FAFB] flex items-center justify-between border-t border-[#E7EAF6] mt-2">
                <div className="flex items-center gap-1 text-xs font-bold text-[#1F2937]">
                  <DollarSign className="w-4 h-4 text-[#7D9AF6]" />
                  <span>{item.budget}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{item.weather}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDestinations.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#E7EAF6]">
          <Compass className="w-10 h-10 text-[#9CA3AF] mx-auto mb-3 animate-spin" />
          <h4 className="font-bold text-lg text-[#1F2937]">No places found</h4>
          <p className="text-xs text-[#6B7280] mt-1">Try searching for "Kashmir", "Kanyakumari", "Temple", "Beach" or clear your filter.</p>
        </div>
      )}
    </section>
  );
}

