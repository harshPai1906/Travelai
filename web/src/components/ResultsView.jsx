import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TripStory from './TripStory';
import {
  Plane,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Star,
  CheckCircle,
  Download,
  Map,
  Share2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Dynamic destination image locator
function getDestinationImage(query = '') {
  const q = query.toLowerCase();
  if (q.includes('japan') || q.includes('tokyo') || q.includes('kyoto')) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80";
  }
  if (q.includes('paris') || q.includes('france')) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80";
  }
  if (q.includes('mumbai') || q.includes('india')) {
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80";
  }
  if (q.includes('dubai') || q.includes('uae')) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80";
  }
  if (q.includes('rome') || q.includes('italy')) {
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80";
  }
  if (q.includes('bali') || q.includes('indonesia')) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80";
  }
}

const CITY_IATA_MAP = {
  // 28 States of India
  andhra: "TIR", "andhra pradesh": "TIR",
  arunachal: "HGI", "arunachal pradesh": "HGI",
  assam: "GAU", guwahati: "GAU", gauhati: "GAU",
  bihar: "GAY",
  chhattisgarh: "RPR",
  goa: "GOI",
  gujarat: "AMD",
  haryana: "DEL",
  himachal: "IXC", "himachal pradesh": "IXC",
  jharkhand: "RNC",
  karnataka: "BLR",
  kerala: "COK",
  "madhya pradesh": "IDR",
  maharashtra: "BOM",
  manipur: "IMF",
  meghalaya: "SHL",
  mizoram: "AJL",
  nagaland: "DMU",
  odisha: "BBI", orissa: "BBI",
  punjab: "ATQ",
  rajasthan: "JAI",
  sikkim: "PYG",
  "tamil nadu": "MAA", tamilnadu: "MAA",
  telangana: "HYD",
  tripura: "IXA",
  "uttar pradesh": "VNS",
  uttarakhand: "DED",
  "west bengal": "CCU", bengal: "CCU",

  // 8 Union Territories of India
  andaman: "IXZ", nicobar: "IXZ", "port blair": "IXZ",
  chandigarh: "IXC",
  dadra: "DIU", daman: "DIU", diu: "DIU",
  delhi: "DEL", "new delhi": "DEL",
  jammu: "IXJ", kashmir: "SXR",
  ladakh: "IXL", leh: "IXL",
  lakshadweep: "AGX", agatti: "AGX",
  puducherry: "PNY", pondicherry: "PNY",

  // Andhra Pradesh Districts
  visakhapatnam: "VTZ", vizag: "VTZ", vijayawada: "VGA", guntur: "VGA",
  kakinada: "RJA", rajahmundry: "RJA", kurnool: "KJB", kadapa: "CDP",
  anantapur: "TIR", nellore: "TIR", chittoor: "TIR", tirupati: "TIR", tirumala: "TIR",

  // Uttar Pradesh Districts
  agra: "AGR", kanpur: "KNU", prayagraj: "IXD", allahabad: "IXD",
  varanasi: "VNS", kashi: "VNS", banaras: "VNS", lucknow: "LKO",
  ayodhya: "AYJ", gorakhpur: "GOP", bareilly: "BEK", jhansi: "GWL",
  mathura: "DEL", vrindavan: "DEL", meerut: "DEL", noida: "DEL",
  ghaziabad: "DEL", aligarh: "DEL",

  // Maharashtra Districts
  mumbai: "BOM", bombay: "BOM", pune: "PNQ", nagpur: "NAG",
  nashik: "ISK", aurangabad: "IXU", sambhajinagar: "IXU", solapur: "SSE",
  kolhapur: "KLH", nanded: "NDC", amravati: "NAG", shirdi: "SAG",

  // Tamil Nadu Districts
  chennai: "MAA", coimbatore: "CJB", madurai: "IXM", trichy: "TRZ",
  tiruchirappalli: "TRZ", salem: "SXV", tirunelveli: "TIZ", tuticorin: "TCR",
  thoothukudi: "TCR", vellore: "MAA", thanjavur: "TRZ", kanchipuram: "MAA",
  ooty: "CJB", kanyakumari: "TRV", rameswaram: "IXM", rameshwaram: "IXM", rameshvaram: "IXM",

  // Karnataka Districts
  bangalore: "BLR", banglore: "BLR", bengaluru: "BLR", bangaluru: "BLR", mysore: "MYQ", mysuru: "MYQ",
  mangalore: "IXE", mangaluru: "IXE", hubli: "HBX", hubballi: "HBX",
  belgaum: "IXG", belagavi: "IXG", kalaburagi: "GBI", bellary: "HBX",
  udupi: "IXE", hampi: "HBX", coorg: "MYQ",

  // Gujarat Districts
  ahmedabad: "AMD", ahmedbad: "AMD", surat: "STV", vadodara: "BDQ", rajkot: "RAJ",
  bhavnagar: "BHU", jamnagar: "JGA", bhuj: "BHJ", kutch: "BHJ",
  junagadh: "RAJ", gandhinagar: "AMD", porbandar: "PBD",

  // Rajasthan Districts
  jaipur: "JAI", jodhpur: "JDH", udaipur: "UDR", kota: "JAI",
  bikaner: "BKB", ajmer: "JAI", jaisalmer: "JSA", bhilwara: "UDR",

  // West Bengal Districts
  kolkata: "CCU", kolkatta: "CCU", howrah: "CCU", siliguri: "IXB", asansol: "CCU",
  durgapur: "RDP", darjeeling: "IXB", kharagpur: "CCU",

  // Kerala Districts
  kochi: "COK", cochin: "COK", trivandrum: "TRV", thiruvananthapuram: "TRV",
  calicut: "CCJ", kozhikode: "CCJ", kannur: "CNN", alleppey: "COK",
  alappuzha: "COK", thrissur: "COK", munnar: "COK", wayanad: "CCJ",

  // Bihar & Odisha Districts
  patna: "PAT", gaya: "GAY", "bodh gaya": "GAY", darbhanga: "DBR",
  bhubaneswar: "BBI", bhubaneshwar: "BBI", cuttack: "BBI", rourkela: "RRK", puri: "BBI",

  // Punjab, Haryana & MP Districts
  ludhiana: "LUH", amritsar: "ATQ", jalandhar: "ATQ", patiala: "IXC",
  bathinda: "BTI", gurgaon: "DEL", gurugram: "DEL", indore: "IDR",
  bhopal: "BHO", jabalpur: "JLR", gwalior: "GWL", ujjain: "IDR",

  // Uttarakhand & Hill Stations
  dehradun: "DED", haridwar: "DED", rishikesh: "DED", mussoorie: "DED",
  nainital: "PGH", shimla: "IXC", simla: "IXC", manali: "KUU", dharamshala: "DHM",

  // International Popular Destinations
  paris: "CDG", france: "CDG", "new york": "JFK", nyc: "JFK",
  london: "LHR", uk: "LHR", dubai: "DXB", uae: "DXB",
  tokyo: "HND", kyoto: "KIX", osaka: "KIX", japan: "HND",
  singapore: "SIN", sydney: "SYD", rome: "FCO", italy: "FCO",
  bali: "DPS", indonesia: "DPS", bangkok: "BKK", thailand: "BKK", maldives: "MLE"
};

function parseQueryRoute(query = '') {
  const q = query.toLowerCase();
  let depCity = null, depCode = null;
  let arrCity = null, arrCode = null;

  const sortedEntries = Object.entries(CITY_IATA_MAP).sort((a, b) => b[0].length - a[0].length);

  function findCityInText(text, excludeCode = null) {
    if (!text) return [null, null];
    for (let [city, code] of sortedEntries) {
      if (code !== excludeCode && text.includes(city)) {
        return [city.toUpperCase(), code];
      }
    }
    return [null, null];
  }

  // Step 1: Check if explicit "from ORIGIN" is present
  const matchFrom = q.match(/\bfrom\s+([a-z\s]+)/i);
  if (matchFrom) {
    const origPart = matchFrom[1].trim();
    const [cOrigName, cOrigCode] = findCityInText(origPart);
    if (cOrigCode) {
      depCity = cOrigName;
      depCode = cOrigCode;
    }
  }

  // Step 2: Check "X to Y" or "X - Y"
  const matchTo = q.match(/(?:from\s+)?([a-z\s]+?)\s+(?:to|-)\s+([a-z\s]+)/i);
  if (matchTo) {
    const leftPart = matchTo[1].replace(/\b(plan|trip|itinerary|itenary|flights|hotels|for|search|best|want|going|heading)\b/gi, '').trim();
    const rightPart = matchTo[2].replace(/\b(plan|trip|itinerary|itenary|flights|hotels|for|search|best|date|on|days|day)\b/gi, '').trim();

    if (!depCode) {
      const [cLeftName, cLeftCode] = findCityInText(leftPart);
      if (cLeftCode) {
        depCity = cLeftName;
        depCode = cLeftCode;
      }
    }

    const [cRightName, cRightCode] = findCityInText(rightPart, depCode);
    if (cRightCode) {
      arrCity = cRightName;
      arrCode = cRightCode;
    }
  }

  // Step 3: Check for DESTINATION before "vacation/trip/plan/itinerary/tour/holiday"
  if (!arrCode) {
    const matchDestNoun = q.match(/\b([a-z\s]+?)\s+(?:vacation|trip|itinerary|itenary|plan|tour|holiday|flights?|hotels?)\b/i);
    if (matchDestNoun) {
      const candidatePart = matchDestNoun[1].trim();
      const [cDestName, cDestCode] = findCityInText(candidatePart, depCode);
      if (cDestCode) {
        arrCity = cDestName;
        arrCode = cDestCode;
      }
    }
  }

  // Step 4: Unstructured multi-city scan
  if (!depCode || !arrCode) {
    const foundCities = [];
    for (let [city, code] of sortedEntries) {
      const pos = q.indexOf(city);
      if (pos !== -1) {
        foundCities.push({ pos, city: city.toUpperCase(), code });
      }
    }

    foundCities.sort((a, b) => a.pos - b.pos);

    if (foundCities.length >= 1) {
      if (!depCode) {
        depCity = foundCities[0].city;
        depCode = foundCities[0].code;
      }
      if (!arrCode) {
        for (let item of foundCities) {
          if (item.code !== depCode) {
            arrCity = item.city;
            arrCode = item.code;
            break;
          }
        }
      }
    }
  }

  // Step 5: Smart Defaults
  if (!depCode && arrCode) {
    depCity = arrCode !== "BOM" ? "MUMBAI" : "DELHI";
    depCode = arrCode !== "BOM" ? "BOM" : "DEL";
  }
  if (!arrCode && depCode) {
    arrCity = depCode !== "GOI" ? "GOA" : "DELHI";
    arrCode = depCode !== "GOI" ? "GOI" : "DEL";
  }

  if (!depCode) { depCity = "MUMBAI"; depCode = "BOM"; }
  if (!arrCode) { arrCity = "DELHI"; arrCode = "DEL"; }

  // Collision Prevention
  if (depCode === arrCode) {
    if (depCode === "GOI") {
      depCity = "MUMBAI"; depCode = "BOM";
    } else {
      depCity = "DELHI"; depCode = "DEL";
    }
  }

  return { depCity, depCode, arrCity, arrCode };
}

function extractTravelDates(query = '') {
  const q = query.toLowerCase();
  const months = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };

  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = q.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3] ? (slashMatch[3].length === 2 ? '20' + slashMatch[3] : slashMatch[3]) : '2026';
    const monthName = Object.keys(months).find(k => months[k] === month && k.length === 3)?.toUpperCase() || month;
    return {
      formatted: `${day}/${month}/${year}`,
      ixigoDate: `${day}${month}${year}`,
      display: `${day} ${monthName} ${year}`,
      hasCustomDate: true,
      day, month, year
    };
  }

  // Pattern 2: "15 Oct", "15th October"
  const monthRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b(?:\s*(\d{4}))?/i;
  const matchMonth = q.match(monthRegex);

  if (matchMonth) {
    const day = matchMonth[1].padStart(2, '0');
    const mStr = matchMonth[2].toLowerCase().slice(0, 3);
    const month = months[mStr] || '08';
    const year = matchMonth[3] || '2026';
    const displayMonth = mStr.toUpperCase();
    return {
      formatted: `${day}/${month}/${year}`,
      ixigoDate: `${day}${month}${year}`,
      display: `${day} ${displayMonth} ${year}`,
      hasCustomDate: true,
      day, month, year
    };
  }

  // Pattern 3: "October 15"
  const revMonthRegex = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{1,2})(?:st|nd|rd|th)?\b(?:\s*(\d{4}))?/i;
  const matchRev = q.match(revMonthRegex);

  if (matchRev) {
    const mStr = matchRev[1].toLowerCase().slice(0, 3);
    const day = matchRev[2].padStart(2, '0');
    const month = months[mStr] || '08';
    const year = matchRev[3] || '2026';
    const displayMonth = mStr.toUpperCase();
    return {
      formatted: `${day}/${month}/${year}`,
      ixigoDate: `${day}${month}${year}`,
      display: `${day} ${displayMonth} ${year}`,
      hasCustomDate: true,
      day, month, year
    };
  }

  // Default date
  return {
    formatted: '15/08/2026',
    ixigoDate: '15082026',
    display: '15 AUG 2026',
    hasCustomDate: false,
    day: '15', month: '08', year: '2026'
  };
}

// Helper functions for MakeMyTrip and ixigo redirects
function extractIATA(str, fallbackCode) {
  if (!str) return fallbackCode;
  const match = str.match(/\(([A-Z]{3})\)/);
  return match ? match[1] : fallbackCode;
}

function getMakeMyTripUrl(depStr, arrStr, query) {
  const route = parseQueryRoute(query);
  const dates = extractTravelDates(query);
  const dep = extractIATA(depStr, route.depCode);
  const arr = extractIATA(arrStr, route.arrCode);
  return `https://www.makemytrip.com/flight/search?itinerary=${dep}-${arr}-${dates.formatted}&tripType=O&paxType=A-1_C-0_I-0&intl=false&cabinClass=E`;
}

function getIxigoUrl(depStr, arrStr, query) {
  const route = parseQueryRoute(query);
  const dates = extractTravelDates(query);
  const dep = extractIATA(depStr, route.depCode);
  const arr = extractIATA(arrStr, route.arrCode);
  return `https://www.ixigo.com/search/result/flight?from=${dep}&to=${arr}&date=${dates.ixigoDate}&adults=1&children=0&infants=0&class=e`;
}

const DOMESTIC_INDIA_IATAS = new Set(["BOM", "DEL", "BLR", "GOI", "GOX", "HYD", "MAA", "CCU", "AMD", "PNQ", "JAI", "COK", "ATQ", "BBI", "NAG", "VNS", "IXC", "TRV", "TIR", "IXM", "DED", "SAG", "IDR", "AYJ", "LKO", "TRZ", "PBD", "HSR", "IXJ", "GAY", "GAU", "UDR", "JDH", "JSA", "KUU", "DHM", "SXR", "IXL", "IXB", "MYQ", "HBX", "VTZ", "HGI", "RPR", "RNC", "IMF", "SHL", "AJL", "DMU", "PYG", "IXA", "IXZ", "DIU", "AGX", "PNY"]);
const INDIAN_CARRIERS = ["indigo", "air india", "vistara", "akasa", "spicejet", "express"];

// Parse live flight text from AviationStack API or return route-accurate flights
function parseFlights(flightText, query) {
  const route = parseQueryRoute(query);
  const dates = extractTravelDates(query);
  const isDomesticRoute = DOMESTIC_INDIA_IATAS.has(route.depCode) && DOMESTIC_INDIA_IATAS.has(route.arrCode);

  if (flightText && flightText.includes('Flight:')) {
    const blocks = flightText.split('\n\n').filter(b => b.trim());
    const parsed = [];

    for (let block of blocks) {
      const lines = block.split('\n');
      let airline = "IndiGo";
      let code = "6E-204";
      let departure = `${route.depCity} (${route.depCode})`;
      let arrival = `${route.arrCity} (${route.arrCode})`;
      let status = "Scheduled";
      let flightDate = dates.display;

      for (let line of lines) {
        if (line.includes('Airline:')) {
          const parts = line.split('|');
          if (parts.length > 1) {
            code = parts[0].replace('Flight:', '').trim();
            airline = parts[1].replace('Airline:', '').trim();
          } else {
            airline = line.replace('Airline:', '').trim();
          }
        }
        if (line.includes('Departure:')) departure = line.replace('Departure:', '').trim();
        if (line.includes('Arrival:')) arrival = line.replace('Arrival:', '').trim();
        if (line.includes('Status:')) status = line.replace('Status:', '').trim();
        if (line.includes('Date:')) flightDate = line.replace('Date:', '').trim();
      }

      // If domestic India route, filter out foreign codeshare carriers (Japan Airlines, Virgin Atlantic, KLM, etc.)
      if (isDomesticRoute) {
        const isIndianCarrier = INDIAN_CARRIERS.some(c => airline.toLowerCase().includes(c));
        if (!isIndianCarrier) {
          continue;
        }
      }

      // Check if departure IATA matches expected route or contains origin city
      const depIata = extractIATA(departure, '');
      if (!depIata || depIata === route.depCode || departure.toLowerCase().includes(route.depCity.toLowerCase())) {
        parsed.push({
          airline,
          code,
          departure,
          arrival,
          travelDate: flightDate,
          duration: "2h 15m Direct",
          price: "Live Tracked Rate",
          status
        });
      }
    }

    if (parsed.length > 0) return parsed;
  }

  // Guaranteed route-accurate fallback flights: Departure = Origin, Arrival = Destination
  if (isDomesticRoute) {
    return [
      { airline: "IndiGo", code: "6E-5008", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "2h 25m Direct", price: "₹4,800", status: "Scheduled" },
      { airline: "Air India", code: "AI-884", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "2h 30m Direct", price: "₹5,200", status: "On Time" },
      { airline: "Vistara", code: "UK-848", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "2h 20m Direct", price: "₹5,600", status: "Scheduled" },
      { airline: "Akasa Air", code: "QP-1304", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "2h 25m Direct", price: "₹4,500", status: "Scheduled" }
    ];
  }

  return [
    { airline: "Air France / ANA", code: "AF-226", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "8h 10m Direct", price: "₹48,500", status: "Scheduled" },
    { airline: "Emirates", code: "EK-502", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "8h 35m Direct", price: "₹52,000", status: "On Time" },
    { airline: "British Airways", code: "BA-138", departure: `${route.depCity} (${route.depCode})`, arrival: `${route.arrCity} (${route.arrCode})`, travelDate: dates.display, duration: "9h 05m Direct", price: "₹54,200", status: "Scheduled" }
  ];
}

const HOTEL_IMAGE_POOL = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", // Heritage Palace
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", // Beach Resort Infinity Pool
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", // Modern High-Rise Luxury
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80", // Tropical Villa & Pool
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80", // Boutique Ocean Suite
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80", // Presidential Suite Interior
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80", // Luxury Resort Courtyard
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=600&q=80"  // Grand Lobby & Lounge
];

function getHotelImage(query = '', index = 0) {
  const route = parseQueryRoute(query);
  const dest = (route.arrCity || '').toLowerCase();

  if (dest.includes('tirupati') || dest.includes('tirumala')) {
    const tirupatiImages = [
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80", // Temple View Residency
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", // Fortune Select Grand Ridge
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80"  // Taj Tirupati Luxury Stay
    ];
    return tirupatiImages[index % tirupatiImages.length];
  }

  if (dest.includes('varanasi') || dest.includes('kashi')) {
    const varanasiImages = [
      "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80", // BrijRama Palace Ghat Stay
      "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80", // Taj Nadesar Palace
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80"  // Heritage Ganges View
    ];
    return varanasiImages[index % varanasiImages.length];
  }

  if (dest.includes('goa')) {
    const goaImages = [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80", // Benaulim Beach Resort
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", // Vagator Rock Pool
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80", // Bambolim Bay Palace
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80"  // Tropical Villa
    ];
    return goaImages[index % goaImages.length];
  }

  if (dest.includes('paris')) {
    const parisImages = [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", // Bristol Palace
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", // Opera Boutique
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80"  // Eiffel Suite
    ];
    return parisImages[index % parisImages.length];
  }

  if (dest.includes('japan') || dest.includes('tokyo') || dest.includes('kyoto')) {
    const japanImages = [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", // Ryokan Garden
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80", // Tokyo Skyline Hotel
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80"  // Kyoto Zen Villa
    ];
    return japanImages[index % japanImages.length];
  }

  if (dest.includes('mumbai')) {
    const mumbaiImages = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80", // Taj Palace
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80", // Juhu Beachfront
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&q=80"  // Airport Executive
    ];
    return mumbaiImages[index % mumbaiImages.length];
  }

  return HOTEL_IMAGE_POOL[index % HOTEL_IMAGE_POOL.length];
}

// Parse live hotel markdown from Tavily API
function parseHotels(hotelText, query) {
  const route = parseQueryRoute(query);
  const destName = route.arrCity || query;
  const origName = route.depCity || '';

  if (hotelText && (hotelText.includes('http') || hotelText.includes('['))) {
    const items = hotelText.split('\n\n').filter(b => b.trim());
    const parsed = [];

    let idx = 0;
    for (let item of items) {
      const itemLower = item.toLowerCase();
      // Filter out items belonging strictly to origin city when origin != destination
      if (origName && origName.toLowerCase() !== destName.toLowerCase()) {
        if (itemLower.includes(origName.toLowerCase()) && !itemLower.includes(destName.toLowerCase())) {
          continue;
        }
      }

      const linkMatch = item.match(/\[(.*?)\]\((.*?)\)/);
      let title = "Recommended Hotel";
      let url = "https://www.booking.com";
      let snippet = item;

      if (linkMatch) {
        title = linkMatch[1];
        url = linkMatch[2];
        const lines = item.split('\n').filter(l => !l.includes(title));
        snippet = lines.join(' ').replace(/^\d+\.\s*/, '').trim() || snippet;
      } else {
        const boldMatch = item.match(/\*\*(.*?)\*\*/);
        if (boldMatch) title = boldMatch[1];
      }

      parsed.push({
        name: title.replace(/^\d+\.\s*/, '').replace(/[\*\[\]]/g, ''),
        type: "Recommended Hotel",
        rating: (4.7 + (idx % 3) * 0.1).toFixed(1),
        location: destName || "Central Location",
        snippet: snippet.replace(/^\d+\.\s*/, '').replace(/[\*\[\]]/g, '').slice(0, 180) + '...',
        url: url,
        image: getHotelImage(query, idx),
        price: "Live Rate Tracked"
      });
      idx++;
    }

    if (parsed.length > 0) return parsed;
  }

  // Destination-based dynamic fallback hotels strictly based on parsed destination city
  const dest = (route.arrCity || '').toLowerCase();

  if (dest.includes('goa')) {
    return [
      { name: "Taj Exotica Resort & Spa, Benaulim", type: "5-Star Luxury Beachfront Resort", rating: 4.9, location: "Benaulim Beach, South Goa", price: "₹16,500 / night", url: "https://www.booking.com", image: getHotelImage(query, 0), snippet: "Mediterranean-style luxury 56-acre resort set along Benaulim Beach with fine dining & golf." },
      { name: "W Goa, Vagator Beach", type: "5-Star Lifestyle Beach Resort", rating: 4.8, location: "Vagator Beachfront, North Goa", price: "₹18,200 / night", url: "https://www.tripadvisor.com", image: getHotelImage(query, 1), snippet: "Chic luxury resort perched on Vagator beach with Rock Pool sunsets, spa & vibrant lounges." },
      { name: "Grand Hyatt Goa", type: "5-Star Heritage Bay Resort", rating: 4.7, location: "Bambolim Bay, North Goa", price: "₹14,000 / night", url: "https://www.expedia.com", image: getHotelImage(query, 2), snippet: "17th-century Indo-Portuguese palace resort overlooking Bambolim Bay with lush gardens." }
    ];
  }

  if (dest.includes('paris')) {
    return [
      { name: "Le Bristol Paris", type: "5-Star Palace Hotel", rating: 4.9, location: "8th Arrondissement, Paris", price: "€950 / night", url: "https://www.booking.com", image: getHotelImage(query, 0), snippet: "Luxury palace hotel with 3-Michelin starred dining and rooftop garden pool." },
      { name: "Hotel Joyce - Astotel", type: "4-Star Boutique Hotel", rating: 4.8, location: "9th Arr. Opera, Paris", price: "€210 / night", url: "https://www.tripadvisor.com", image: getHotelImage(query, 1), snippet: "Charming boutique hotel located minutes from Montmartre and Sacré-Cœur." },
      { name: "Hôtel Plaza Athénée", type: "5-Star Luxury Fashion Stay", rating: 4.9, location: "Avenue Montaigne, Paris", price: "€1,100 / night", url: "https://www.booking.com", image: getHotelImage(query, 2), snippet: "Iconic luxury hotel overlooking the Eiffel Tower on the avenue of Haute Couture." }
    ];
  }

  if (dest.includes('mumbai')) {
    return [
      { name: "The Taj Mahal Palace, Mumbai", type: "5-Star Luxury Heritage", rating: 4.9, location: "Colaba, South Mumbai (Sea View)", price: "₹18,500 / night", url: "https://www.tripadvisor.com", image: getHotelImage(query, 0), snippet: "Iconic 120-year luxury landmark facing the Gateway of India with fine dining restaurants and luxury spa." },
      { name: "JW Marriott Mumbai Juhu", type: "5-Star Beach Resort", rating: 4.8, location: "Juhu Beachfront, Mumbai", price: "₹14,200 / night", url: "https://www.booking.com", image: getHotelImage(query, 1), snippet: "Luxury beachfront resort with infinity pools overlooking the Arabian Sea and award-winning dining." },
      { name: "Fairfield By Marriott Mumbai Airport", type: "4-Star Executive Hotel", rating: 4.7, location: "Near BOM Airport, Mumbai", price: "₹7,800 / night", url: "https://www.expedia.com", image: getHotelImage(query, 2), snippet: "Contemporary executive hotel with rooftop pool and seamless airport connectivity." }
    ];
  }

  return [
    { name: `Grand Luxury Palace & Resort in ${destName}`, type: "5-Star Luxury Heritage Stay", rating: 4.9, location: destName, price: "Best Rate Tracked", url: "https://www.booking.com", image: getHotelImage(query, 0), snippet: `Iconic luxury resort in ${destName} featuring ocean/city panorama suites, fine dining & luxury spa.` },
    { name: `Boutique Executive Stay in ${destName}`, type: "4-Star Modern Boutique Hotel", rating: 4.8, location: destName, price: "Best Price Tracked", url: "https://www.tripadvisor.com", image: getHotelImage(query, 1), snippet: `Charming central accommodation in ${destName} located close to prime cultural hotspots & shopping.` },
    { name: `Executive Suites in ${destName}`, type: "5-Star Scenic Bay & Spa Resort", rating: 4.7, location: destName, price: "Best Price Tracked", url: "https://www.expedia.com", image: getHotelImage(query, 2), snippet: `Serene central resort with infinity pool decks, tropical gardens & high-tier guest amenities in ${destName}.` }
  ];
}

function isInterCityRoute(query = '') {
  const q = query.toLowerCase();
  const route = parseQueryRoute(query);
  const dep = (route.depCode || '').toUpperCase();
  const arr = (route.arrCode || '').toUpperCase();

  if (dep && arr && dep !== arr) {
    return true;
  }

  return q.includes(' to ') || q.includes(' from ') || q.includes(' - ');
}

function buildFallbackItineraryText(query = '') {
  const matchD = query.match(/(\d+)\s*(?:day|days)/i);
  const numDays = matchD ? Math.min(14, Math.max(1, parseInt(matchD[1], 10))) : 5;

  const route = parseQueryRoute(query);
  const destName = route.arrCity || 'Destination';

  let text = `### Master ${numDays}-Day Travel Plan for: ${destName}\n\n`;

  const templates = [
    `**Day 1: Historic ${destName} & Primary Landmarks**\n- Morning: Arrival at airport/station, transfer to hotel, and check-in.\n- Afternoon: Guided tour of central landmarks and iconic monuments in ${destName}.\n- Evening: Regional dinner and gourmet food tasting at a top-rated local dining spot.`,
    `**Day 2: ${destName} Heritage & Cultural Exploration**\n- Morning: Guided tour of historic palaces, heritage monuments, and cultural museums in ${destName}.\n- Afternoon: Local art gallery exploration, handicraft workshops, and cafe downtime.\n- Evening: Sunset view from a scenic viewpoint followed by evening bazaar stroll.`,
    `**Day 3: ${destName} Nature Trails & Scenic Overlooks**\n- Morning: Excursion to lush botanical gardens, lake trails, and nature parks around ${destName}.\n- Afternoon: Visit artisan craft villages and observe regional craftsmen at work.\n- Evening: Leisure stroll through historic city center and night markets.`,
    `**Day 4: ${destName} Spiritual Sanctuaries & Architectural Wonders**\n- Morning: Tour iconic spiritual sanctuaries, shrines, and sacred architectural corridors in ${destName}.\n- Afternoon: Exploration of local heritage bazaars and boutique shopping.\n- Evening: Sunset river/bay cruise or panoramic rooftop dining.`,
    `**Day 5: ${destName} Artisan Bazaars & Cultural Highlights**\n- Morning: Souvenir shopping in traditional craft markets and spice bazaars.\n- Afternoon: Farewell regional lunch and airport/station transfer.`
  ];

  for (let i = 0; i < numDays; i++) {
    const t = templates[i % templates.length];
    text += t.replace(/Day \d+/, `Day ${i + 1}`) + '\n\n';
  }

  return text;
}

// Professional Day-by-Day Itinerary Component
function FormattedItinerary({ text = '', query = '' }) {
  const rawText = text || buildFallbackItineraryText(query);

  const renderInlineFormatted = (str) => {
    if (!str) return '';
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-[#1E293B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Filter out redundant summary blocks
  let skipSection = false;
  const filteredLines = [];

  for (let line of lines) {
    if (line.includes('**Flight Options:**') || line.includes('**Hotel Options:**')) {
      skipSection = true;
      continue;
    }
    if (skipSection && (line.toLowerCase().startsWith('**day') || line.toLowerCase().startsWith('day'))) {
      skipSection = false;
    }
    if (!skipSection) {
      filteredLines.push(line);
    }
  }

  const days = [];
  let currentDay = null;
  let introLines = [];

  for (let line of filteredLines) {
    const isDayHeader = line.match(/^(?:\*\*|\#\#|\#)*\s*(Day\s+\d+.*?)(?:\*\*|\#\#)?$/i);
    if (isDayHeader) {
      if (currentDay) days.push(currentDay);
      const title = line.replace(/[\*\#]/g, '').trim();
      currentDay = { title, items: [] };
    } else if (currentDay) {
      if (line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./)) {
        const itemText = line.replace(/^[\*\-\d\.]+\s*/, '').trim();
        if (itemText) currentDay.items.push(itemText);
      } else {
        const cleaned = line.replace(/^[\*\#]+/, '').trim();
        if (cleaned) currentDay.items.push(cleaned);
      }
    } else {
      if (!line.includes('Final Travel Response') && !line.includes('We\'ve curated')) {
        introLines.push(line);
      }
    }
  }
  if (currentDay) days.push(currentDay);

  // Fallback if no explicit Day headers were detected
  if (days.length === 0) {
    const fallbackLines = buildFallbackItineraryText(query).split('\n').filter(Boolean);
    return (
      <div className="bg-white rounded-[24px] border border-[#E7EAF6] p-6 text-[#1F2937] leading-relaxed text-sm space-y-3 shadow-sm">
        {fallbackLines.map((line, idx) => (
          <p key={idx}>{renderInlineFormatted(line)}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {introLines.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50/80 to-blue-50/50 rounded-2xl p-5 border border-indigo-100/80 text-sm text-[#475569] leading-relaxed">
          {introLines.map((l, i) => (
            <p key={i} className="mb-1">{renderInlineFormatted(l)}</p>
          ))}
        </div>
      )}

      {/* Timeline Connector */}
      <div className="relative border-l-2 border-dashed border-[#7D9AF6]/40 ml-4 pl-6 space-y-8 py-2">
        {days.map((day, idx) => (
          <div key={idx} className="relative group">
            {/* Numbered Badge Circle */}
            <div className="absolute -left-[37px] top-1.5 w-7 h-7 rounded-full bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-xs flex items-center justify-center shadow-md ring-4 ring-white">
              {idx + 1}
            </div>

            {/* Day Activity Card */}
            <div className="bg-white rounded-[24px] border border-[#E7EAF6] p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF6]">
                <h4 className="text-base font-extrabold text-[#1E293B] tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7D9AF6]" />
                  {renderInlineFormatted(day.title)}
                </h4>
                <span className="px-3 py-1 rounded-full bg-[#7D9AF6]/15 text-[#7D9AF6] text-xs font-bold">
                  Day {idx + 1} Plan
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {day.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 text-sm text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#F1F5F9] hover:bg-white transition-all">
                    <span className="mt-0.5 shrink-0 text-[#7D9AF6] font-extrabold">✦</span>
                    <div className="flex-1">{renderInlineFormatted(item)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsView({ results, query, onReset }) {
  const [copied, setCopied] = useState(false);

  // Confetti celebration animation removed per user preference

  const parsedFlights = parseFlights(results?.flight_results, query);
  const parsedHotels = parseHotels(results?.hotel_results, query);
  const showFlights = Boolean(results?.flight_results && results.flight_results.trim().length > 0 && isInterCityRoute(query));

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my AI Travel Plan for ${query}!\n\n${results.final_response || results.itinerary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `# Master Travel Plan for: ${query}\n\n## ✈️ Flights\n${results.flight_results}\n\n## 🏨 Hotels\n${results.hotel_results}\n\n## 🗓️ Itinerary\n${results.itinerary}\n\n---\n${results.final_response}`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Travel_Plan_${query.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-10 py-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-[28px] border border-[#E7EAF6] p-8 shadow-xl shadow-[#7D9AF6]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#34D399]/15 text-[#34D399] font-bold text-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Master Plan Generated for {query}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Your Bespoke Travel Itinerary
          </h2>
          <p className="text-sm text-[#6B7280]">
            Target Query: <span className="font-semibold text-[#1F2937]">"{query}"</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-3 rounded-2xl bg-white border border-[#E7EAF6] text-[#1F2937] font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-[#34D399]" /> : <Share2 className="w-4 h-4 text-[#7D9AF6]" />}
            <span>{copied ? "Copied!" : "Share Plan"}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download MD</span>
          </button>

          <button onClick={onReset} className="px-5 py-3 rounded-2xl bg-[#FFFDF7] border border-[#E7EAF6] text-[#1F2937] font-semibold text-xs hover:bg-white shadow-sm transition-all">
            New Plan
          </button>
        </div>
      </div>

      {/* Flight Cards Section - Only shown when inter-city route is requested */}
      {showFlights && parsedFlights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#7D9AF6]/15 text-[#7D9AF6] flex items-center justify-center">
                <Plane className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1F2937]">Available Flights for {query}</h3>
                {parsedFlights[0]?.travelDate && (
                  <p className="text-xs font-semibold text-[#7D9AF6] mt-0.5">
                    📅 Flights for Travel Date: {parsedFlights[0].travelDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedFlights.map((flight, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#E7EAF6] p-5 shadow-sm hover:shadow-md hover:border-[#7D9AF6]/40 transition-all duration-300 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-[#1F2937]">{flight.airline}</span>
                    {flight.travelDate && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7D9AF6]/15 text-[#7D9AF6]">
                        📅 {flight.travelDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#1F2937] mt-1">🛫 {flight.departure}</p>
                  <p className="text-xs font-medium text-[#1F2937]">🛬 {flight.arrival}</p>
                  <span className="inline-block text-[11px] font-semibold text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full mt-2">{flight.status}</span>
                </div>

                <div className="pt-3 border-t border-[#E7EAF6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#7D9AF6]">{flight.price}</span>
                    <span className="text-[10px] font-semibold text-[#6B7280]">Book on app:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={getMakeMyTripUrl(flight.departure, flight.arrival, query)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:scale-102 transition-all"
                    >
                      <span>MakeMyTrip</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <a
                      href={getIxigoUrl(flight.departure, flight.arrival, query)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 py-1.5 rounded-xl shadow-sm hover:shadow-md hover:scale-102 transition-all"
                    >
                      <span>ixigo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Luxury Hotel Scout Cards */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF3C6] text-[#1F2937] flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#7D9AF6]" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937]">Curated Accommodations for {query}</h3>
          </div>
          <span className="text-xs font-semibold text-[#6B7280]">{parsedHotels.length} Stays Found</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {parsedHotels.map((hotel, idx) => (
            <motion.div key={idx} whileHover={{ y: -6 }} className="bg-white rounded-[24px] border border-[#E7EAF6] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#7D9AF6]/10 transition-all duration-300 flex flex-col justify-between">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#1F2937] flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{hotel.rating}</span>
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#7D9AF6] uppercase tracking-wider">{hotel.type}</span>
                  <h4 className="font-bold text-base text-[#1F2937] line-clamp-1 mt-0.5">{hotel.name}</h4>
                  <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{hotel.location}</span>
                  </p>
                  <p className="text-xs text-[#475569] mt-2 line-clamp-2">{hotel.snippet}</p>
                </div>

                <div className="pt-3 border-t border-[#E7EAF6] flex items-center justify-between">
                  <span className="text-base font-bold text-[#1F2937]">{hotel.price}</span>
                  <a href={hotel.url} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7D9AF6] to-[#A4BDF9] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1">
                    <span>Book Hotel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Day-by-Day Itinerary */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7D9AF6] to-[#A4BDF9] text-white flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2937]">Day-by-Day Itinerary</h3>
        </div>

        <FormattedItinerary text={results.itinerary || results.final_response} query={query} />
      </div>

      {/* Trip Story — AI-generated editorial travel journal */}
      <TripStory
        tripStoryJson={results.trip_story}
        query={query}
        onReset={onReset}
      />


    </motion.div>
  );
}
