const FIPE_BASE = 'https://fipe.parallelum.com.br/api/v2';

// Marcas que são exclusivamente motos na FIPE
const MOTO_ONLY_BRANDS = ['YAMAHA', 'KAWASAKI', 'SHINERAY', 'TRIUMPH', 'SUZUKI', 'DUCATI', 'HARLEY', 'DAFRA', 'TRAXX', 'HAOJUE'];

// Modelos Honda que são motos
const HONDA_MOTO_MODELS = ['CG', 'CB', 'BIZ', 'POP', 'PCX', 'NXR', 'XRE', 'BROS', 'TITAN', 'FAN', 'LEAD', 'ELITE'];

interface FipeItem { code: string; name: string }

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function bestMatch(query: string, items: FipeItem[]): FipeItem | null {
  const q = normalize(query);
  const qWords = q.split(/[\s\-\/]+/).filter(Boolean);

  const candidates: { item: FipeItem; score: number; len: number }[] = [];

  for (const item of items) {
    const name = normalize(item.name);
    if (name === q) return item;

    const nameWords = name.split(/[\s\-\/]+/).filter(Boolean);
    let score = 0;
    for (const w of qWords) {
      if (nameWords.some(n => n === w)) score += 2;
      else if (nameWords.some(n => n.startsWith(w) || w.startsWith(n))) score += 1;
    }
    const normalized = score / (qWords.length * 2);
    if (normalized >= 0.4) candidates.push({ item, score: normalized, len: name.length });
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => Math.abs(a.score - b.score) > 0.15 ? b.score - a.score : a.len - b.len);
  return candidates[0].item;
}

function isMotoVehicle(brand: string, model: string) {
  const b = brand.toUpperCase();
  const m = model.toUpperCase();
  if (MOTO_ONLY_BRANDS.some(k => b.includes(k))) return true;
  if (b.includes('HONDA') && HONDA_MOTO_MODELS.some(k => m.startsWith(k) || m.includes(` ${k}`))) return true;
  return false;
}

export async function fetchFipeValue(brand: string, model: string, year: number): Promise<number | null> {
  try {
    const vehicleType = isMotoVehicle(brand, model) ? 'motorcycles' : 'cars';

    // 1. Busca marcas
    const brandsRes = await fetch(`${FIPE_BASE}/${vehicleType}/brands`);
    if (!brandsRes.ok) return null;
    const brands: FipeItem[] = await brandsRes.json();

    const brandMatch = bestMatch(brand, brands);
    if (!brandMatch) return null;

    // 2. Busca modelos
    const modelsRes = await fetch(`${FIPE_BASE}/${vehicleType}/brands/${brandMatch.code}/models`);
    if (!modelsRes.ok) return null;
    const models: FipeItem[] = await modelsRes.json();

    const modelMatch = bestMatch(model, models);
    if (!modelMatch) return null;

    // 3. Busca anos disponíveis
    const yearsRes = await fetch(`${FIPE_BASE}/${vehicleType}/brands/${brandMatch.code}/models/${modelMatch.code}/years`);
    if (!yearsRes.ok) return null;
    const years: FipeItem[] = await yearsRes.json();
    if (!Array.isArray(years) || years.length === 0) return null;

    const yearMatch =
      years.find(y => y.name.startsWith(String(year))) ??
      years.find(y => y.name.startsWith(String(year - 1))) ??
      years.find(y => y.name.startsWith(String(year + 1))) ??
      years.find(y => y.name.startsWith(String(year - 2)));
    if (!yearMatch) return null;

    // 4. Busca preço
    const priceRes = await fetch(`${FIPE_BASE}/${vehicleType}/brands/${brandMatch.code}/models/${modelMatch.code}/years/${yearMatch.code}`);
    if (!priceRes.ok) return null;
    const priceData = await priceRes.json();

    if (!priceData.price) return null;

    // "R$ 52.000,00" → 52000
    const value = parseFloat(
      String(priceData.price).replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
    );
    return isNaN(value) ? null : value;
  } catch {
    return null;
  }
}
