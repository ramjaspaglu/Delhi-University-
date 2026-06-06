/**
 * Fuzzy matching library for Delhi University study archive.
 * Provides Jaro-Winkler/Levenshtein similarity scores and token coverage checks.
 */

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const d: number[][] = [];

  for (let i = 0; i <= m; i++) d[i] = [i];
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return d[m][n];
}

export function fuzzyMatch(text: string, query: string, code?: string): { matches: boolean; score: number } {
  const normText = text.toLowerCase().trim();
  const normQuery = query.toLowerCase().trim();
  const normCode = code ? code.toLowerCase().trim() : '';

  if (!normQuery) return { matches: true, score: 1 };
  if (!normText) return { matches: false, score: 0 };

  // 1. Direct code prefix/exact match gets a very high weight of matching
  if (normCode && (normCode === normQuery || normCode.includes(normQuery) || normQuery.includes(normCode))) {
    return { matches: true, score: 95 };
  }

  // 2. Exact matches
  if (normText === normQuery) {
    return { matches: true, score: 100 };
  }

  // 3. Simple substring startsWith / includes logic
  if (normText.startsWith(normQuery)) {
    return { matches: true, score: 90 };
  }
  if (normText.includes(normQuery)) {
    return { matches: true, score: 80 };
  }

  // 4. Token-based word matches
  const textWords = normText.split(/[\s\-_,./()]+/);
  const queryWords = normQuery.split(/[\s\-_,./()]+/);

  let matchedWordsCount = 0;
  let totalDistanceContribution = 0;

  for (const qWord of queryWords) {
    if (!qWord || qWord.length < 2) continue;
    let bestWordMatchScore = 0;

    for (const tWord of textWords) {
      if (!tWord || tWord.length < 2) continue;
      if (tWord.includes(qWord)) {
        bestWordMatchScore = Math.max(bestWordMatchScore, qWord.length / tWord.length);
      } else {
        const dist = levenshteinDistance(qWord, tWord);
        const maxLen = Math.max(qWord.length, tWord.length);
        const similarity = maxLen > 0 ? (maxLen - dist) / maxLen : 0;
        
        // Threshold for a typo correction
        if (similarity > 0.65) {
          bestWordMatchScore = Math.max(bestWordMatchScore, similarity * 0.9);
        }
      }
    }

    if (bestWordMatchScore > 0) {
      matchedWordsCount++;
      totalDistanceContribution += bestWordMatchScore;
    }
  }

  const queryWordsLen = queryWords.filter(w => w.length >= 2).length;
  if (queryWordsLen === 0) {
    // Fallback if all query words are 1 letter
    return { matches: normText.includes(normQuery), score: normText.includes(normQuery) ? 50 : 0 };
  }

  const wordCoverage = matchedWordsCount / queryWordsLen;
  const averageWordScore = matchedWordsCount > 0 ? totalDistanceContribution / matchedWordsCount : 0;
  const finalScore = (wordCoverage * 60) + (averageWordScore * 40);

  // If we found at least 50% of original query terms (or 1 major term)
  const matches = wordCoverage >= 0.5 && finalScore >= 40;

  return { matches, score: finalScore };
}
