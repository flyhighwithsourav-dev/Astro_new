import type { HoroscopeData } from './astrologyEngine';
import { ZODIAC_SIGNS } from './astrologyEngine';

const getAbbreviation = (name: string) => {
  switch (name) {
    case 'Sun': return 'Su';
    case 'Moon': return 'Mo';
    case 'Mercury': return 'Me';
    case 'Venus': return 'Ve';
    case 'Mars': return 'Ma';
    case 'Jupiter': return 'Ju';
    case 'Saturn': return 'Sa';
    case 'Rahu': return 'Ra';
    case 'Ketu': return 'Ke';
    default: return name.substring(0, 2);
  }
};

// Coordinates for North Indian house centers (viewBox 300x300)
const houseCenters = [
  { x: 150, y: 80 },  // House 1
  { x: 75, y: 40 },   // House 2
  { x: 40, y: 80 },   // House 3
  { x: 80, y: 150 },  // House 4
  { x: 40, y: 220 },  // House 5
  { x: 75, y: 260 },  // House 6
  { x: 150, y: 220 }, // House 7
  { x: 225, y: 260 }, // House 8
  { x: 260, y: 220 }, // House 9
  { x: 220, y: 150 }, // House 10
  { x: 260, y: 80 },  // House 11
  { x: 225, y: 40 }   // House 12
];

const signNumberPlacements = [
  { x: 150, y: 110 }, // House 1
  { x: 95, y: 55 },   // House 2
  { x: 55, y: 95 },   // House 3
  { x: 110, y: 150 }, // House 4
  { x: 55, y: 205 },  // House 5
  { x: 95, y: 245 },  // House 6
  { x: 150, y: 190 }, // House 7
  { x: 205, y: 245 }, // House 8
  { x: 245, y: 205 }, // House 9
  { x: 190, y: 150 }, // House 10
  { x: 245, y: 95 },  // House 11
  { x: 205, y: 55 }   // House 12
];

const southIndianBoxes = [
  { signIdx: 11, x: 0, y: 0 },
  { signIdx: 0, x: 100, y: 0 },
  { signIdx: 1, x: 200, y: 0 },
  { signIdx: 2, x: 300, y: 0 },
  { signIdx: 3, x: 300, y: 100 },
  { signIdx: 4, x: 300, y: 200 },
  { signIdx: 5, x: 300, y: 300 },
  { signIdx: 6, x: 200, y: 300 },
  { signIdx: 7, x: 100, y: 300 },
  { signIdx: 8, x: 0, y: 300 },
  { signIdx: 9, x: 0, y: 200 },
  { signIdx: 10, x: 0, y: 100 }
];

export function renderSvgChart(horoscope: HoroscopeData, style: 'north_indian' | 'south_indian'): string {
  // Organize planets by house
  const planetsByHouse = Array.from({ length: 12 }, () => [] as string[]);
  horoscope.planets.forEach(p => {
    planetsByHouse[p.house - 1].push(getAbbreviation(p.name) + (p.isRetrograde ? ' (R)' : ''));
  });

  // Organize planets by sign
  const planetsBySign = Array.from({ length: 12 }, () => [] as string[]);
  horoscope.planets.forEach(p => {
    planetsBySign[p.signIndex].push(getAbbreviation(p.name) + (p.isRetrograde ? ' (R)' : ''));
  });

  if (style === 'north_indian') {
    let content = `
      <svg viewBox="0 0 300 300" class="kundli-svg north-indian">
        <defs>
          <radialGradient id="space-grad-client" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1b1236" />
            <stop offset="100%" stop-color="#0f0924" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="300" height="300" rx="16" fill="url(#space-grad-client)" stroke="var(--md-sys-color-primary)" stroke-width="2" />
        
        <!-- Diagonals -->
        <line x1="0" y1="0" x2="300" y2="300" stroke="rgba(255, 217, 102, 0.4)" stroke-width="1.5" />
        <line x1="300" y1="0" x2="0" y2="300" stroke="rgba(255, 217, 102, 0.4)" stroke-width="1.5" />
        
        <!-- Inner Diamond -->
        <polygon points="150,0 300,150 150,300 0,150" fill="none" stroke="var(--md-sys-color-primary)" stroke-width="2" />
    `;

    houseCenters.forEach((center, idx) => {
      const signNum = (horoscope.ascendant.signIndex + idx) % 12 + 1;
      const planets = planetsByHouse[idx];
      const numLoc = signNumberPlacements[idx];
      const isLagna = idx === 0;

      content += `
        <g>
          <!-- Sign Number -->
          <text x="${numLoc.x}" y="${numLoc.y}" class="sign-number" text-anchor="middle" dominant-baseline="middle">
            ${signNum}
          </text>
          
          <!-- Planets List -->
          <g transform="translate(${center.x}, ${center.y})">
            ${isLagna ? `<text x="0" y="-18" class="lagna-tag" text-anchor="middle" dominant-baseline="middle">ASC</text>` : ''}
      `;

      planets.forEach((planet, pIdx) => {
        const yOffset = pIdx * 13 - ((planets.length - 1) * 13) / 2;
        content += `
          <text x="0" y="${yOffset}" class="planet-text" text-anchor="middle" dominant-baseline="middle">
            ${planet}
          </text>
        `;
      });

      content += `
          </g>
        </g>
      `;
    });

    content += `</svg>`;
    return content;
  } else {
    // South Indian
    let content = `
      <svg viewBox="0 0 400 400" class="kundli-svg south-indian">
        <defs>
          <radialGradient id="space-grad-si-client" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stop-color="#1b1236" />
            <stop offset="100%" stop-color="#0f0924" />
          </radialGradient>
        </defs>
        
        <!-- Background -->
        <rect width="400" height="400" rx="16" fill="url(#space-grad-si-client)" stroke="var(--md-sys-color-primary)" stroke-width="2" />
        
        <!-- Inner Box -->
        <rect x="100" y="100" width="200" height="200" fill="#0b0717" stroke="var(--md-sys-color-primary)" stroke-width="1.5" />
    `;

    southIndianBoxes.forEach((box) => {
      const planets = planetsBySign[box.signIdx];
      const isLagna = box.signIdx === horoscope.ascendant.signIndex;

      content += `
        <g>
          <!-- Box border -->
          <rect x="${box.x}" y="${box.y}" width="100" height="100" fill="none" stroke="rgba(255, 217, 102, 0.4)" stroke-width="1.5" />
          
          <!-- Sign name -->
          <text x="${box.x + 8}" y="${box.y + 16}" class="si-sign-name">
            ${ZODIAC_SIGNS[box.signIdx].substring(0, 3)}
          </text>
          
          ${isLagna ? `
            <g>
              <line x1="${box.x}" y1="${box.y + 100}" x2="${box.x + 100}" y2="${box.y}" stroke="rgba(255, 217, 102, 0.6)" stroke-dasharray="2,2" stroke-width="1.5" />
              <text x="${box.x + 50}" y="${box.y + 25}" class="si-lagna-tag" text-anchor="middle" dominant-baseline="middle">
                ASC
              </text>
            </g>
          ` : ''}
          
          <!-- Planets list -->
          <g transform="translate(${box.x + 50}, ${box.y + 60})">
      `;

      planets.forEach((planet, pIdx) => {
        const yOffset = pIdx * 13 - ((planets.length - 1) * 13) / 2;
        content += `
          <text x="0" y="${yOffset}" class="si-planet-text" text-anchor="middle" dominant-baseline="middle">
            ${planet}
          </text>
        `;
      });

      content += `
          </g>
        </g>
      `;
    });

    // Center Text
    content += `
        <g transform="translate(200, 200)">
          <text x="0" y="-20" class="si-center-title" text-anchor="middle">${horoscope.name}</text>
          <text x="0" y="5" class="si-center-sub" text-anchor="middle">${horoscope.birthDate}</text>
          <text x="0" y="25" class="si-center-sub" text-anchor="middle">${horoscope.birthTime}</text>
        </g>
      </svg>
    `;

    return content;
  }
}
