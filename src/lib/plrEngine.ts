import type { HoroscopeData } from './astrologyEngine';
import { SIGN_LORDS } from './astrologyEngine';

export interface PLRRule {
    id: string;
    category: 'personality' | 'career' | 'relationships' | 'wealth';
    condition: {
        type: 'planet_sign' | 'planet_house' | 'lord_house';
        planet?: string;
        sign?: string;
        house?: number;
        targetHouse?: number;
    };
    title: string;
    prediction: string;
}

export interface MatchedPrediction {
    id: string;
    category: string;
    title: string;
    prediction: string;
}

/**
 * Gets the ruling planet (Lord) of a given house (1-12) in a horoscope.
 */
export function getHouseLord(horoscope: HoroscopeData, houseNum: number): string {
    const ascSignIndex = horoscope.ascendant.signIndex;
    // House H corresponds to the sign signIdx
    const signIdx = (ascSignIndex + houseNum - 1) % 12;
    return SIGN_LORDS[signIdx];
}

/**
 * Evaluates a single rule against a generated horoscope.
 */
export function evaluateRuleCondition(horoscope: HoroscopeData, rule: PLRRule): boolean {
    const { condition } = rule;
    
    switch (condition.type) {
        case 'planet_sign': {
            if (!condition.planet || !condition.sign) return false;
            const planet = horoscope.planets.find(p => p.name === condition.planet);
            return planet ? planet.signName === condition.sign : false;
        }
        
        case 'planet_house': {
            if (!condition.planet || condition.house === undefined) return false;
            const planet = horoscope.planets.find(p => p.name === condition.planet);
            return planet ? planet.house === condition.house : false;
        }
        
        case 'lord_house': {
            if (condition.house === undefined || condition.targetHouse === undefined) return false;
            
            // 1. Find the lord of the source house
            const lordName = getHouseLord(horoscope, condition.house);
            
            // 2. Find where this lord is placed in the horoscope
            const lordPlanet = horoscope.planets.find(p => p.name === lordName);
            
            // 3. Match if the lord is placed in the target house
            return lordPlanet ? lordPlanet.house === condition.targetHouse : false;
        }
        
        default:
            return false;
    }
}

/**
 * Evaluates all rules against the horoscope and returns matching predictions.
 */
export function generatePredictions(horoscope: HoroscopeData, rules: PLRRule[]): MatchedPrediction[] {
    const matched: MatchedPrediction[] = [];
    
    for (const rule of rules) {
        if (evaluateRuleCondition(horoscope, rule)) {
            matched.push({
                id: rule.id,
                category: rule.category,
                title: rule.title,
                prediction: rule.prediction
            });
        }
    }
    
    return matched;
}
