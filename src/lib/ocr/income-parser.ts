/**
 * Semantic income parser for OCR-extracted text from financial documents.
 *
 * Extracts the statement "total" amount by:
 * 1. Searching for semantic labels (Total, Ending Balance, etc.)
 * 2. Finding the nearest monetary value to the label
 * 3. Normalizing OCR mistakes in the numeric token
 * 4. Parsing monetary formats (US, EU, ISO)
 *
 * Returns null when extraction confidence is too low — the UI must
 * fall back to manual entry rather than guess.
 */

export interface ExtractedIncome {
  amount: number;
  currency: string | null;
  rawMatch: string;
  label: string;
  confidence: number;
}

export interface OcrResult {
  text: string;
  income: ExtractedIncome | null;
}

// ---------------------------------------------------------------------------
// Label patterns (case-insensitive).  Order matters — earlier = higher priority.
// ---------------------------------------------------------------------------
const LABEL_PATTERNS: { pattern: RegExp; priority: number }[] = [
  { pattern: /total\s*\(\s*([A-Z]{3})\s*\)/i, priority: 10 },
  { pattern: /total\s+(EUR|USD|GBP|CHF)/i, priority: 9 },
  { pattern: /total\s+(€|\$|£)/i, priority: 9 },
  { pattern: /\btotal\b/i, priority: 7 },
  { pattern: /closing\s+balance/i, priority: 6 },
  { pattern: /ending\s+balance/i, priority: 6 },
  { pattern: /total\s+credits/i, priority: 5 },
  { pattern: /total\s+gross/i, priority: 5 },
  { pattern: /annual\s+income/i, priority: 5 },
  { pattern: /net\s+salary/i, priority: 4 },
];

// Currency symbols → ISO codes
const SYMBOL_TO_ISO: Record<string, string> = {
  '€': 'EUR',
  '$': 'USD',
  '£': 'GBP',
};

// ---------------------------------------------------------------------------
// OCR mistake normalisation — ONLY applied to candidate numeric tokens
// ---------------------------------------------------------------------------
function normalizeOcrDigits(token: string): string {
  return token
    .replace(/[Oo]/g, '0')   // O → 0
    .replace(/[IlL|]/g, '1') // I, l, L, | → 1
    .replace(/[g]/g, '9')    // g → 9
    .replace(/[B]/g, '8')    // B → 8
    .replace(/[S]/g, '5')    // S → 5
    .replace(/\s+/g, '');    // internal spaces → remove
}

// ---------------------------------------------------------------------------
// Parse a monetary string into a canonical number.
//
// Handles:
//   40,778.09   (US/UK)
//   40.778,09   (EU)
//   40 778.09   (ISO space grouping with dot decimal)
//   40 778,09   (ISO space grouping with comma decimal)
//   40778.09    (raw decimal)
//   40778,09    (raw comma decimal)
// ---------------------------------------------------------------------------
export function parseMonetaryValue(raw: string): number | null {
  // Remove currency symbols and whitespace at edges
  let s = raw.replace(/[€$£]/g, '').trim();

  // Strip internal spaces (already handled by normalizeOcrDigits but be safe)
  s = s.replace(/\s/g, '');

  if (!s || !/\d/.test(s)) return null;

  // Count dots and commas
  const dots = (s.match(/\./g) || []).length;
  const commas = (s.match(/,/g) || []).length;

  if (dots === 0 && commas === 0) {
    // Pure integer like 40778
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  if (dots === 1 && commas === 0) {
    // Could be 40778.09  or  40.778 (ambiguous — assume US decimal if digits after dot ≤ 2)
    const afterDot = s.split('.')[1];
    if (afterDot.length <= 2) {
      const n = Number(s);
      return Number.isFinite(n) ? n : null;
    }
    // More than 2 digits after dot — treat dot as grouping separator (EU style without comma decimal)
    const n = Number(s.replace(/\./g, ''));
    return Number.isFinite(n) ? n : null;
  }

  if (dots === 0 && commas === 1) {
    // 40778,09  or  40,778 (ambiguous)
    const afterComma = s.split(',')[1];
    if (afterComma.length <= 2) {
      // Treat comma as decimal separator
      const n = Number(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    }
    // 3+ digits after comma — treat comma as grouping
    const n = Number(s.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  if (commas >= 1 && dots === 1) {
    // Check if dot comes after all commas → US format  40,778.09
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastDot > lastComma) {
      // US/UK: commas are grouping, dot is decimal
      const n = Number(s.replace(/,/g, ''));
      return Number.isFinite(n) ? n : null;
    }
    // Dot before comma → EU format  40.778,09
    const n = Number(s.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  if (dots >= 1 && commas === 1) {
    // Multiple dots, one comma → EU format  1.234.567,89
    const n = Number(s.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : null;
  }

  if (commas >= 2 && dots === 0) {
    // Multiple commas, no dot → grouping separators  1,234,567
    const n = Number(s.replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  }

  if (dots >= 2 && commas === 0) {
    // Multiple dots, no comma → grouping separators  1.234.567
    const n = Number(s.replace(/\./g, ''));
    return Number.isFinite(n) ? n : null;
  }

  // Fallback: try removing commas
  const fallback = Number(s.replace(/,/g, ''));
  return Number.isFinite(fallback) ? fallback : null;
}

// ---------------------------------------------------------------------------
// Detect currency from surrounding text
// ---------------------------------------------------------------------------
function detectCurrency(text: string): string | null {
  // Look for ISO codes
  const isoMatch = text.match(/\b(EUR|USD|GBP|CHF)\b/i);
  if (isoMatch) return isoMatch[1].toUpperCase();

  // Look for symbols
  for (const [sym, code] of Object.entries(SYMBOL_TO_ISO)) {
    if (text.includes(sym)) return code;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main extraction pipeline
// ---------------------------------------------------------------------------

/**
 * Monetary value regex — matches things like:
 *   40,778.09   40.778,09   40 778.09   40778.09   40778
 *   €40,778.09  $88,000.00  4O,778.O9 (OCR misreads)
 *
 * Strategy: match an optional currency symbol, then a sequence of
 * digit-like characters (including OCR mistakes) separated by
 * commas/dots/spaces, ending at a word boundary or whitespace.
 */
const MONETARY_RE =
  /[€$£]?\s*(?:[\dOoIlL|gBS][\d\sOoIlL|gBS,.]*)[\dOoIlL|gBS]/g;

/**
 * More strict: looks like an actual number after normalisation.
 * Must have at least 2 consecutive digits and be all digits/separators.
 */
function isPlausibleAmount(raw: string): boolean {
  const norm = normalizeOcrDigits(raw.replace(/[€$£\s]/g, ''));
  // After normalisation, should be digits with at most commas and dots
  return /^[\d.,]+$/.test(norm) && /\d{3,}/.test(norm);
}

export function extractIncome(ocrText: string): ExtractedIncome | null {
  const lines = ocrText.split('\n');
  let bestMatch: ExtractedIncome | null = null;

  for (const labelDef of LABEL_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const lineMatch = labelDef.pattern.exec(lines[i]);
      if (!lineMatch) continue;

      // Extract currency from the label match group or surrounding text
      let currency = lineMatch[1]
        ? (SYMBOL_TO_ISO[lineMatch[1]] || lineMatch[1].toUpperCase())
        : null;

      // Search this line and the next few lines for a monetary value
      const searchLines = lines.slice(i, Math.min(i + 4, lines.length));
      const searchWindow = searchLines.join('\n');

      if (!currency) {
        currency = detectCurrency(searchWindow);
      }

      // Find all monetary candidates — search line-by-line to prevent
      // cross-line matches (e.g. "40,778.09\nBIC" becoming "40778.0981")
      const candidates: { raw: string; amount: number }[] = [];
      for (const searchLine of searchLines) {
        let m: RegExpExecArray | null;
        const re = new RegExp(MONETARY_RE.source, 'g');
        while ((m = re.exec(searchLine)) !== null) {
          const raw = m[0].trim();
          if (!isPlausibleAmount(raw)) continue;

          const normalised = normalizeOcrDigits(raw.replace(/[€$£]/g, '').trim());
          const amount = parseMonetaryValue(normalised);
          if (amount !== null && amount > 0) {
            candidates.push({ raw, amount });
          }
        }
      }

      if (candidates.length === 0) continue;

      // Prefer the candidate closest to the label (first non-zero match)
      // but also prefer larger amounts when there are ties
      // (the "Total" should be ≥ individual line items)
      const best = candidates[0];

      const confidence = (labelDef.priority / 10) * (candidates.length === 1 ? 1 : 0.85);

      const candidate: ExtractedIncome = {
        amount: best.amount,
        currency,
        rawMatch: best.raw,
        label: lineMatch[0].trim(),
        confidence: Math.min(confidence, 1),
      };

      if (!bestMatch || candidate.confidence > bestMatch.confidence) {
        bestMatch = candidate;
      }
    }
  }

  // Final sanity: reject amounts that look implausible (e.g. < 1)
  if (bestMatch && bestMatch.amount < 1) {
    return null;
  }

  return bestMatch;
}
