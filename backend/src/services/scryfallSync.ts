import { fetchScryfallSets } from "../services/scryfall.js";
import type { ScryfallCard, ScryfallResponse } from "../types/scryfallTypes.js";
import prisma from "../db.js";

function parseDate(date?: string | null) {
  return date ? new Date(date) : null;
}

export async function syncScryfallSets() {
  console.log("Iniciando sync com Scryfall...");

  try {
    const { latestSets, precons } = await fetchScryfallSets();

    // 🔹 Junta e remove duplicatas pelo `code`
    const allSetsMap = new Map<string, typeof latestSets[0]>();
    [...latestSets, ...precons].forEach((set) => {
      allSetsMap.set(set.code, set);
    });
    const allSets = Array.from(allSetsMap.values());

    console.log(`${allSets.length} sets únicos para processar...`);

    for (const set of allSets) {
      // 🔹 Upsert do set
      await prisma.set.upsert({
        where: { code: set.code },
        update: {
          name: set.name,
          type: set.type,
          iconSvg: set.iconSvg ?? null,
          releaseAt: parseDate(set.releaseAt),
        },
        create: {
          code: set.code,
          name: set.name,
          type: set.type,
          iconSvg: set.iconSvg ?? null,
          releaseAt: parseDate(set.releaseAt),
        },
      });

      console.log(`✔️  Set processado: ${set.code} - ${set.name}`);

      // 🔹 Se for precon (commander), buscar carta do comandante no Scryfall
      if (set.type === "commander") {
        try {
          const res = await fetch(
            `https://api.scryfall.com/cards/search?order=set&q=e:${set.code}&unique=prints`
          );

          // Tipagem segura do JSON da Scryfall
          const json = await res.json();
          const data = json as ScryfallResponse;

          if (!data.data || !Array.isArray(data.data)) {
            console.warn(`Resposta inesperada da Scryfall para o set ${set.code}`);
            continue;
          }

          // Procurar carta tipo "Commander"
         const commanderCard: ScryfallCard | undefined = data.data.find(
  (c) => c.type_line.toLowerCase().includes("legendary") 
     && c.oracle_text?.toLowerCase().includes("commander")
);

          if (commanderCard) {
            // Upsert da carta no banco
            await prisma.card.upsert({
              where: { scryfallId: commanderCard.id },
              update: {
                name: commanderCard.name,
                typeLine: commanderCard.type_line,
                cmc: commanderCard.cmc,
                imageNormal: commanderCard.image_uris?.normal ?? null,
                imageArtCrop: commanderCard.image_uris?.art_crop ?? null,
                setCode: set.code,
                setName: set.name,
                collectorNumber: commanderCard.collectorNumber ?? null,
              },
              create: {
                scryfallId: commanderCard.id,
                name: commanderCard.name,
                typeLine: commanderCard.type_line,
                cmc: commanderCard.cmc,
                imageNormal: commanderCard.image_uris?.normal ?? null,
                imageArtCrop: commanderCard.image_uris?.art_crop ?? null,
                setCode: set.code,
                setName: set.name,
                collectorNumber: commanderCard.collectorNumber ?? null,
              },
            });

            console.log(`Comandante salvo: ${commanderCard.name}`);
          } else {
            console.log(`Nenhum comandante encontrado para ${set.code}`);
          }
        } catch (err) {
          console.error(`Erro ao buscar comandante do set ${set.code}:`, err);
        }
      }
    }

    console.log(`Sync finalizado: ${allSets.length} sets processados`);
  } catch (err) {
    console.error("Erro no sync da Scryfall:", err);
  }
}