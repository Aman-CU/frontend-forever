export type Quote = { text: string; author: string };

const QUOTES: Quote[] = [
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Well begun is half done.", author: "Aristotle" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
];

// Deterministic per UTC calendar day (not per request) — same quote all day,
// changes the next day, no database/schema needed for something this small.
export function getQuoteOfTheDay(): Quote {
  const dayOfYear = Math.floor(
    (Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86_400_000,
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
