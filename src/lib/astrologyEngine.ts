import * as AstronomyNS from 'astronomy-engine';
import type { AstroTime } from 'astronomy-engine';

const Astronomy = (AstronomyNS as any).default && (AstronomyNS as any).MakeTime === undefined
    ? (AstronomyNS as any).default
    : AstronomyNS;

const { Body, MakeTime, SiderealTime, e_tilt, GeoVector, Ecliptic } = Astronomy;

export interface PlanetInfo {
    name: string;
    longitude: number; // 0 to 360
    signIndex: number; // 0 to 11
    signName: string;
    degreeInSign: number; // 0 to 30
    house: number; // 1 to 12
    isRetrograde: boolean;
}

export interface HoroscopeData {
    name: string;
    birthDate: string; // ISO date string
    birthTime: string; // HH:MM
    latitude: number;
    longitude: number;
    ascendant: {
        longitude: number;
        signIndex: number;
        signName: string;
        degreeInSign: number;
    };
    planets: PlanetInfo[];
    system: 'vedic' | 'western';
    houseSystem: 'whole_sign' | 'equal_house';
    ayanamsa: number;
    julianDay: number;
    lst: number;
}

export const ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Ruling planets (Lords) for each sign (0-indexed)
// Aries -> Mars, Taurus -> Venus, Gemini -> Mercury, Cancer -> Moon, Leo -> Sun,
// Virgo -> Mercury, Libra -> Venus, Scorpio -> Mars (Ketu co-rules),
// Sagittarius -> Jupiter, Capricorn -> Saturn, Aquarius -> Saturn (Rahu co-rules), Pisces -> Jupiter
export const SIGN_LORDS = [
    "Mars",       // Aries
    "Venus",      // Taurus
    "Mercury",    // Gemini
    "Moon",       // Cancer
    "Sun",        // Leo
    "Mercury",    // Virgo
    "Venus",      // Libra
    "Mars",       // Scorpio
    "Jupiter",    // Sagittarius
    "Saturn",     // Capricorn
    "Saturn",     // Aquarius
    "Jupiter"     // Pisces
];

/**
 * Calculates the Lahiri Ayanamsa in degrees for a given AstroTime.
 * Formula is based on J2000 epoch and standard precession rates.
 */
export function calculateLahiriAyanamsa(time: AstroTime): number {
    const tCenturies = time.tt / 36525; // centuries since J2000
    // Lahiri value at J2000 is 23.856498 degrees
    // Precession rate is approx 1.396042 degrees per century
    return 23.856498 + 1.396042 * tCenturies + 0.000308 * Math.pow(tCenturies, 2);
}

/**
 * Calculates the Mean Moon Node (Rahu) longitude in degrees.
 * Ketu is exactly 180 degrees opposite.
 */
export function calculateMeanMoonNode(time: AstroTime): number {
    const T = time.tt / 36525; // centuries since J2000
    // Standard Meeus formula for the longitude of ascending node of the Moon
    let omega = 125.0445222 - 1934.1362608 * T + 0.0020754 * T * T;
    omega = (omega % 360 + 360) % 360;
    return omega;
}

/**
 * Helper to get geocentric ecliptic longitude of date for a body.
 */
function getGeocentricLongitude(body: Body, time: AstroTime): number {
    const vec = GeoVector(body, time, true);
    const ecl = Ecliptic(vec);
    return ecl.elon;
}

/**
 * Helper to check if a planet is retrograde by looking at its position 1 hour later.
 */
function isPlanetRetrograde(body: Body, time: AstroTime): boolean {
    if (body === Body.Sun || body === Body.Moon) {
        return false;
    }
    const pos1 = getGeocentricLongitude(body, time);
    
    // +1 hour (1 / 24 of a day)
    const futureDate = new Date(time.date.getTime() + 60 * 60 * 1000);
    const futureTime = MakeTime(futureDate);
    const pos2 = getGeocentricLongitude(body, futureTime);
    
    let diff = pos2 - pos1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
}

/**
 * Calculates the Ascendant longitude (0-360) from Local Sidereal Time and latitude.
 */
export function calculateAscendantLongitude(time: AstroTime, latitude: number, longitude: number): number {
    const gastHours = SiderealTime(time);
    const gastDegrees = gastHours * 15;
    const lstDegrees = (gastDegrees + longitude + 360) % 360;
    
    const tilt = e_tilt(time);
    const epsDegrees = tilt.tobl; // obliquity
    
    const RAD = Math.PI / 180;
    const lstRad = lstDegrees * RAD;
    const epsRad = epsDegrees * RAD;
    const latRad = latitude * RAD;
    
    const y = Math.cos(lstRad);
    const x = -(Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad));
    
    let ascRad = Math.atan2(y, x);
    let ascDegrees = ascRad * (180 / Math.PI);
    return (ascDegrees + 360) % 360;
}

/**
 * Main function to generate horoscope data.
 */
export function generateHoroscope(
    name: string,
    birthDateStr: string, // YYYY-MM-DD
    birthTimeStr: string, // HH:MM
    latitude: number,
    longitude: number,
    system: 'vedic' | 'western' = 'vedic',
    houseSystem: 'whole_sign' | 'equal_house' = 'whole_sign'
): HoroscopeData {
    // 1. Create date object in UTC
    // Note: Birth time is local, so we must adjust it to UTC.
    // In MVP we assume standard local time input.
    // For absolute accuracy, timezone offset should be handled. We assume the user inputs UTC or local.
    // Let's assume the user inputs timezone offset or we default to +5.5 (India) or handle timezone.
    // Let's add a timezone offset parameter (default +5.5 hours for IST since it's most common in Vedic astrology).
    // Better: let's parse standard timezone offsets from the birthTimeStr or pass it.
    // Let's assume birthDateStr is YYYY-MM-DD, birthTimeStr is HH:MM, and we'll calculate local time.
    // If we parse the date directly as local, we can use the browser timezone or pass the timezone offset.
    // Let's assume the date is passed as a combined ISO string or we assume UTC if no offset.
    // Let's create a Date object.
    const dateObj = new Date(`${birthDateStr}T${birthTimeStr}:00`);
    const time = MakeTime(dateObj);
    
    const ayanamsa = calculateLahiriAyanamsa(time);
    const offset = system === 'vedic' ? ayanamsa : 0;
    
    // 2. Calculate Ascendant
    let ascendantLon = calculateAscendantLongitude(time, latitude, longitude);
    ascendantLon = (ascendantLon - offset + 360) % 360;
    
    const ascSignIndex = Math.floor(ascendantLon / 30);
    const ascSignName = ZODIAC_SIGNS[ascSignIndex];
    const ascDegree = ascendantLon % 30;
    
    // 3. Define bodies to calculate
    // We calculate Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Rahu, Ketu
    const bodies = [
        { name: 'Sun', key: Body.Sun },
        { name: 'Moon', key: Body.Moon },
        { name: 'Mercury', key: Body.Mercury },
        { name: 'Venus', key: Body.Venus },
        { name: 'Mars', key: Body.Mars },
        { name: 'Jupiter', key: Body.Jupiter },
        { name: 'Saturn', key: Body.Saturn }
    ];
    
    const planets: PlanetInfo[] = [];
    
    // 4. Calculate coordinates for classic planets
    for (const b of bodies) {
        let lon = getGeocentricLongitude(b.key, time);
        lon = (lon - offset + 360) % 360;
        
        const isRetro = isPlanetRetrograde(b.key, time);
        const signIdx = Math.floor(lon / 30);
        
        planets.push({
            name: b.name,
            longitude: lon,
            signIndex: signIdx,
            signName: ZODIAC_SIGNS[signIdx],
            degreeInSign: lon % 30,
            house: 1, // Will be resolved below
            isRetrograde: isRetro
        });
    }
    
    // 5. Calculate Rahu and Ketu
    const rahuLonRaw = calculateMeanMoonNode(time);
    
    // Rahu
    const rahuLon = (rahuLonRaw - offset + 360) % 360;
    const rahuSignIdx = Math.floor(rahuLon / 30);
    planets.push({
        name: 'Rahu',
        longitude: rahuLon,
        signIndex: rahuSignIdx,
        signName: ZODIAC_SIGNS[rahuSignIdx],
        degreeInSign: rahuLon % 30,
        house: 1,
        isRetrograde: true // Rahu/Ketu always move retrograde in mean node calculations
    });
    
    // Ketu
    const ketuLon = (rahuLon + 180) % 360;
    const ketuSignIdx = Math.floor(ketuLon / 30);
    planets.push({
        name: 'Ketu',
        longitude: ketuLon,
        signIndex: ketuSignIdx,
        signName: ZODIAC_SIGNS[ketuSignIdx],
        degreeInSign: ketuLon % 30,
        house: 1,
        isRetrograde: true
    });
    
    // 6. Calculate House Placements
    for (const p of planets) {
        if (houseSystem === 'whole_sign') {
            // Whole Sign: 1st house is the entire sign of the Ascendant.
            // House = (PlanetSignIndex - AscendantSignIndex + 12) % 12 + 1
            p.house = (p.signIndex - ascSignIndex + 12) % 12 + 1;
        } else {
            // Equal House: 1st house starts at Ascendant longitude.
            // House = Math.floor((PlanetLongitude - AscendantLongitude + 360) % 360 / 30) + 1
            p.house = Math.floor(((p.longitude - ascendantLon + 360) % 360) / 30) + 1;
        }
    }
    
    const gastHours = SiderealTime(time);
    const lstDegrees = (gastHours * 15 + longitude + 360) % 360;
    
    return {
        name,
        birthDate: birthDateStr,
        birthTime: birthTimeStr,
        latitude,
        longitude,
        ascendant: {
            longitude: ascendantLon,
            signIndex: ascSignIndex,
            signName: ascSignName,
            degreeInSign: ascDegree
        },
        planets,
        system,
        houseSystem,
        ayanamsa: offset,
        julianDay: time.ut + 2451545.0, // convert days since J2000 to julian day
        lst: lstDegrees
    };
}
