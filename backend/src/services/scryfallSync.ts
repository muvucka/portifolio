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

    // Junta e remove duplicatas pelo `code`
    const allSetsMap = new Map<string, typeof latestSets[0]>();
    [...latestSets, ...precons].forEach((set) => {
      allSetsMap.set(set.code, set);
    });
    const allSets = Array.from(allSetsMap.values());

    console.log(`${allSets.length} sets únicos para processar...`);

    for (const set of allSets) {
      // Upsert do set (sem o campo commanderImage)
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

      console.log(`Set processado: ${set.code} - ${set.name}`);

      // Se for precon (commander), buscar carta lendária dentro do deck
      if (set.type === "commander") {
        try {
          const res = await fetch(
            `https://api.scryfall.com/cards/search?order=set&q=e:${set.code}&unique=prints`
          );

          const json = await res.json();
          const data = json as ScryfallResponse;

          if (!data.data || !Array.isArray(data.data)) {
            console.warn(`Resposta inesperada da Scryfall para o set ${set.code}`);
            continue;
          }

          // Procurar uma carta lendária do deck
          const legendaryCard = data.data.find(
            (card) => card.type_line.toLowerCase().includes("legendary")
          );

          if (legendaryCard) {
            // Agora vamos garantir que a imagem da carta lendária é salva
            const imageNormal = legendaryCard.image_uris?.normal ?? null;
            const imageArtCrop = legendaryCard.image_uris?.art_crop ?? null;

            // Salvar a imagem da carta lendária no banco
            await prisma.card.upsert({
              where: { scryfallId: legendaryCard.id },
              update: {
                name: legendaryCard.name,
                typeLine: legendaryCard.type_line,
                cmc: legendaryCard.cmc,
                imageNormal: imageNormal,   // Aqui estamos salvando a imagem normal
                imageArtCrop: imageArtCrop, // E aqui a imagem art crop
                setCode: set.code,
                setName: set.name,
                collectorNumber: legendaryCard.collectorNumber ?? null,
              },
              create: {
                scryfallId: legendaryCard.id,
                name: legendaryCard.name,
                typeLine: legendaryCard.type_line,
                cmc: legendaryCard.cmc,
                imageNormal: imageNormal,
                imageArtCrop: imageArtCrop,
                setCode: set.code,
                setName: set.name,
                collectorNumber: legendaryCard.collectorNumber ?? null,
              },
            });

            console.log(`Carta lendária salva: ${legendaryCard.name}`);

            // **Agora vamos buscar o set com a carta lendária associada para pegar a imagem correta**
            const setWithImage = await prisma.set.findUnique({
              where: { code: set.code },
              include: {
                cards: {
                  where: {
                    scryfallId: legendaryCard.id,  // Filtrando pela carta lendária
                  },
                  select: {
                    imageNormal: true,
                    imageArtCrop: true,
                  },
                },
              },
            });

            // Aqui, garantimos que o campo `commanderImage` seja preenchido com a imagem correta da carta
            const commanderImage = setWithImage?.cards[0]?.imageArtCrop ?? setWithImage?.cards[0]?.imageNormal;


            console.log(`Imagem do comandante para ${set.code}: ${commanderImage}`);
            // Aqui você pode enviar `responseToFrontend` para o frontend no formato desejado.
          } else {
            console.log(`Nenhuma carta lendária encontrada para ${set.code}`);
          }
        } catch (err) {
          console.error(`Erro ao buscar carta lendária do set ${set.code}:`, err);
        }
      }
    }

    console.log(`Sync finalizado: ${allSets.length} sets processados`);
  } catch (err) {
    console.error("Erro no sync da Scryfall:", err);
  }
}