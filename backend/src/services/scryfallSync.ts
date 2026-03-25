
import { fetchScryfallSets } from "../services/scryfall.js";
import prisma from "../db.js";

function parseDate(date?: string | null) {
  return date ? new Date(date) : null;
}

export async function syncScryfallSets() {
  console.log("🔄 Iniciando sync com Scryfall...");

  try {
    const { latestSets, precons } = await fetchScryfallSets();

    const allSets = [...latestSets, ...precons];

    await Promise.all(
      allSets.map((set) =>
        prisma.set.upsert({
          where: { code: set.code },
          update: {
            name: set.name,
            type: set.type,
            iconSvg: set.iconSvg ?? null,
            releaseAt: parseDate(set.releaseAt),
          },
          create: {
            name: set.name,
            code: set.code,
            type: set.type,
            iconSvg: set.iconSvg ?? null,
            releaseAt: parseDate(set.releaseAt),
          },
        })
      )
    );

    console.log(`✅ Sync finalizado: ${allSets.length} sets processados`);
  } catch (err) {
    console.error("❌ Erro no sync da Scryfall:", err);
  }
}