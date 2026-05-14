/**
 * OCR Utility for Pokemon Cards
 * Cleans up Tesseract output and extracts potential card IDs and Names.
 */

export interface ScannedCardInfo {
  name?: string;
  number?: string;
  total?: string;
  fullId?: string;
  attackName?: string;
  keywords?: string[];
}

export function parseOCRText(text: string): ScannedCardInfo {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);
  
  const info: ScannedCardInfo = { keywords: [] };

  // 1. Try to find card number
  const idPattern = /(\d+|[A-Z]?\d+)\s*[\/\\]\s*(\d+)/;
  for (const line of lines) {
    const match = line.match(idPattern);
    if (match) {
      info.number = match[1];
      info.total = match[2];
      info.fullId = `${match[1]}/${match[2]}`;
      break;
    }
  }

  // 2. Identify Keywords (Mega, EX, GX, VMAX, etc.)
  const keywordList = ['MEGA', 'EX', 'GX', 'VMAX', 'VSTAR', 'V-MAX', 'STAGE', 'BASIC', 'TRAINER', 'ENERGY', 'ITEM', 'SUPPORTER'];
  for (const line of lines) {
    const upper = line.toUpperCase();
    keywordList.forEach(kw => {
      if (upper.includes(kw) && !info.keywords?.includes(kw)) {
        info.keywords?.push(kw);
      }
    });
  }

  // 3. Try to find an Attack Name (anywhere in a line, followed by a damage number)
  // Modified to handle noise like "@@ x Labyrinth of Shadows 120,7/"
  const attackPattern = /([A-Z][A-Z\s\-']{3,}[A-Z])\s+(\d{2,3})/i;
  for (const line of lines) {
    const match = line.match(attackPattern);
    if (match) {
      // Clean up common OCR noise from the captured name
      const potentialAttack = match[1].trim();
      // Ensure it's not just "STAGE" or "POKEMON"
      if (!['STAGE', 'BASIC', 'POKEMON', 'POKÉMON'].includes(potentialAttack.toUpperCase())) {
        info.attackName = potentialAttack;
        break;
      }
    }
  }

  // 4. Try to find the Name
  const noise = [
    'STAGE', 'HP', 'LEVEL', 'EVOLVES', 'BASIC', 'POKÉMON', 
    'TRAINER', 'ENERGY', 'RETREAT', 'WEAKNESS', 'RESISTANCE',
    'ABILITY', 'ITEM', 'SUPPORTER', 'STADIUM', 'RULE', 'LENGTH', 'WEIGHT',
    'OPPONENT', 'HAND', 'DAMAGE', 'TURN', 'POKEMON', 'RETREAT'
  ];
  
  // Potential names are usually in the top half of the OCR result
  for (const line of lines.slice(0, 12)) {
    // Strip everything except letters and spaces for name candidate
    let cleanLine = line.replace(/[^A-Za-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanLine.length < 3) continue;

    const upper = cleanLine.toUpperCase();
    const isNoise = noise.some(n => upper.includes(n));
    
    if (isNoise && !upper.includes('GENGAR') && !upper.includes('AGGRON')) {
      if (upper.includes(' HP')) {
        cleanLine = cleanLine.split(/HP/i)[0].trim();
      } else {
        continue;
      }
    }

    // Filter out lines that are likely just UI fragments or noise
    if (cleanLine.length > 3 && cleanLine.split(' ').length <= 4) {
      info.name = cleanLine;
      break;
    }
  }

  return info;
}
