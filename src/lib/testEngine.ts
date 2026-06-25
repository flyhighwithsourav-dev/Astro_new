// C:\Users\SnowIce\Documents\antigravity\keen-hopper\src\lib\testEngine.ts
import { generateHoroscope } from './astrologyEngine';
import { generatePredictions } from './plrEngine';
import rulesJson from '../data/rules.json';
import Astronomy from 'astronomy-engine';

console.log("=== STARTING ASTROLOGY ENGINE VERIFICATION ===");
console.log("Astronomy in testEngine.ts:", typeof Astronomy, Object.keys(Astronomy).slice(0, 10));
console.log("MakeTime type:", typeof (Astronomy as any).MakeTime);
console.log("MakeTime direct:", typeof Astronomy.MakeTime);

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`[PASS] ${message}`);
        passed++;
    } else {
        console.error(`[FAIL] ${message}`);
        failed++;
    }
}

try {
    // Test Case 1: Indian Birth (New Delhi, Jan 1, 1990, 12:00 PM IST)
    // Latitude: 28.61 N, Longitude: 77.21 E
    // Timezone: UTC offset +5.5 hours, so UTC time is 06:30 AM
    console.log("\n--- Test Case 1: Vedic (Lahiri Sidereal) Framework ---");
    const vedicChart = generateHoroscope(
        "Vedic Test Profile",
        "1990-01-01",
        "12:00",
        28.61,
        77.21,
        "vedic",
        "whole_sign"
    );

    console.log(`Generated Julian Day: ${vedicChart.julianDay.toFixed(4)}`);
    console.log(`Calculated Ayanamsa: ${vedicChart.ayanamsa.toFixed(4)}°`);
    console.log(`LST Degrees: ${vedicChart.lst.toFixed(2)}°`);
    console.log(`Ascendant (Lagna): ${vedicChart.ascendant.degreeInSign.toFixed(2)}° ${vedicChart.ascendant.signName}`);

    // Verify Vedic Placements
    assert(vedicChart.ascendant.signName === "Pisces", "Vedic Ascendant should be Pisces");
    
    const vSun = vedicChart.planets.find(p => p.name === "Sun")!;
    console.log(`Sun Placement: House ${vSun.house} in ${vSun.signName} (${vSun.degreeInSign.toFixed(2)}°)`);
    assert(vSun.signName === "Sagittarius", "Vedic Sun should be in Sagittarius");
    assert(vSun.house === 10, "Vedic Sun should be placed in the 10th House");

    const vMoon = vedicChart.planets.find(p => p.name === "Moon")!;
    console.log(`Moon Placement: House ${vMoon.house} in ${vMoon.signName} (${vMoon.degreeInSign.toFixed(2)}°)`);
    assert(vMoon.signName === "Aquarius", "Vedic Moon should be in Aquarius");

    const vJupiter = vedicChart.planets.find(p => p.name === "Jupiter")!;
    console.log(`Jupiter Placement: House ${vJupiter.house} in ${vJupiter.signName} (${vJupiter.degreeInSign.toFixed(2)}°)`);
    assert(vJupiter.signName === "Gemini", "Vedic Jupiter should be in Gemini");
    assert(vJupiter.house === 4, "Vedic Jupiter should be in the 4th House (from Pisces)");

    // Test Case 2: Western (Tropical) Framework for same birth
    console.log("\n--- Test Case 2: Western (Tropical) Framework ---");
    const westernChart = generateHoroscope(
        "Western Test Profile",
        "1990-01-01",
        "12:00",
        28.61,
        77.21,
        "western",
        "whole_sign"
    );

    console.log(`Ascendant: ${westernChart.ascendant.degreeInSign.toFixed(2)}° ${westernChart.ascendant.signName}`);
    assert(westernChart.ascendant.signName === "Aries", "Western Ascendant should be Aries");
    
    const wSun = westernChart.planets.find(p => p.name === "Sun")!;
    console.log(`Sun Placement: House ${wSun.house} in ${wSun.signName} (${wSun.degreeInSign.toFixed(2)}°)`);
    assert(wSun.signName === "Capricorn", "Western Sun should be in Capricorn");
    assert(wSun.house === 10, "Western Sun should be placed in the 10th House (from Aries)");

    const wJupiter = westernChart.planets.find(p => p.name === "Jupiter")!;
    console.log(`Jupiter Placement: House ${wJupiter.house} in ${wJupiter.signName} (${wJupiter.degreeInSign.toFixed(2)}°)`);
    assert(wJupiter.signName === "Cancer", "Western Jupiter should be in Cancer (Exalted)");
    assert(wJupiter.house === 4, "Western Jupiter should be in the 4th House (from Aries)");

    // Test Case 3: PLR Predictions Engine matching
    console.log("\n--- Test Case 3: PLR Prediction Matching ---");
    // Mock a horoscope where Jupiter is in House 1, and Sun is in Leo
    const mockHoroscope = {
        name: "Mock Profile",
        birthDate: "2026-06-25",
        birthTime: "12:00",
        latitude: 0,
        longitude: 0,
        ascendant: { longitude: 120, signIndex: 4, signName: "Leo", degreeInSign: 0 }, // Leo Asc
        planets: [
            { name: "Sun", longitude: 125, signIndex: 4, signName: "Leo", degreeInSign: 5, house: 1, isRetrograde: false }, // Sun in Leo (Own Sign)
            { name: "Moon", longitude: 35, signIndex: 1, signName: "Taurus", degreeInSign: 5, house: 10, isRetrograde: false }, // Moon in Taurus (Exalted)
            { name: "Jupiter", longitude: 130, signIndex: 4, signName: "Leo", degreeInSign: 10, house: 1, isRetrograde: false }, // Jupiter in 1st House
            { name: "Venus", longitude: 300, signIndex: 10, signName: "Aquarius", degreeInSign: 0, house: 7, isRetrograde: false } // Venus in 7th House
        ],
        system: "vedic" as const,
        houseSystem: "whole_sign" as const,
        ayanamsa: 24,
        julianDay: 2451545,
        lst: 0
    };

    const predictions = generatePredictions(mockHoroscope, rulesJson as any);
    console.log(`Active predictions generated: ${predictions.length}`);
    predictions.forEach(p => console.log(`Matched: [${p.category.toUpperCase()}] ${p.title}`));

    // Assert correct matches
    const hasJupiter1 = predictions.some(p => p.id === "jupiter_house_1");
    const hasSunLeo = predictions.some(p => p.id === "sun_leo");
    const hasMoonTaurus = predictions.some(p => p.id === "moon_taurus");
    const hasVenus7 = predictions.some(p => p.id === "venus_house_7");
    
    assert(hasJupiter1, "Should match 'jupiter_house_1' rule");
    assert(hasSunLeo, "Should match 'sun_leo' rule");
    assert(hasMoonTaurus, "Should match 'moon_taurus' rule");
    assert(hasVenus7, "Should match 'venus_house_7' rule");

    // Test House Lord in House Rule Matching
    // Mock: Ascendant is Leo (ruled by Sun). Sun is in Leo (1st House).
    // So Lord of 1st House is in 1st House!
    // Let's check if 'lord_1_house_1' matches.
    const hasLord1In1 = predictions.some(p => p.id === "lord_1_house_1");
    assert(hasLord1In1, "Should match 'lord_1_house_1' rule (Sun rules Leo and is in 1st House)");

    // Test Lord of 7th in 1st
    // Mock: 7th House of Leo is Aquarius (ruled by Saturn).
    // Place Saturn in the 1st House (Leo)
    const mockHoroscope2 = {
        name: "Mock 2",
        birthDate: "2026-06-25",
        birthTime: "12:00",
        latitude: 0,
        longitude: 0,
        ascendant: { longitude: 120, signIndex: 4, signName: "Leo", degreeInSign: 0 },
        planets: [
            { name: "Sun", longitude: 125, signIndex: 4, signName: "Leo", degreeInSign: 5, house: 1, isRetrograde: false },
            { name: "Saturn", longitude: 135, signIndex: 4, signName: "Leo", degreeInSign: 15, house: 1, isRetrograde: false } // Lord of 7th in 1st
        ],
        system: "vedic" as const,
        houseSystem: "whole_sign" as const,
        ayanamsa: 24,
        julianDay: 2451545,
        lst: 0
    };

    const predictions2 = generatePredictions(mockHoroscope2, rulesJson as any);
    const hasLord7In1 = predictions2.some(p => p.id === "lord_7_house_1");
    assert(hasLord7In1, "Should match 'lord_7_house_1' rule (Saturn rules Aquarius/7th and is in 1st House)");

    console.log("\n=== VERIFICATION RESULTS ===");
    console.log(`Passed: ${passed} / ${passed + failed}`);
    if (failed > 0) {
        console.error(`Failed: ${failed}`);
        process.exit(1);
    } else {
        console.log("All calculation and matching engine tests passed successfully!");
    }

} catch (e) {
    console.error("Test execution failed with error:", e);
    process.exit(1);
}
