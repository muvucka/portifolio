import { Router } from "express";
import prisma from "../db.js";
import fetch from "node-fetch";

const router = Router();

/**
 * Pega a imagem da carta do comandante de um set via Scryfall
 */
async function getCommanderCardImage(setCode: string): Promise<string | undefined> {
  try {
    const searchUri = `https://api.scryfall.com/cards/search?order=set&q=set:${setCode}&unique=prints`;
    const res = await fetch(searchUri);

    interface ScryfallCard {
      type_line: string;
      image_uris?: {
        normal?: string;
      };
    }
    interface ScryfallResponse {
      data: ScryfallCard[];
    }

    // Aqui é o cast que resolve o 'unknown'
    const data = (await res.json()) as ScryfallResponse;

    const commanderCard = data.data.find((card) =>
      card.type_line.toLowerCase().includes("legendary")
    );

    return commanderCard?.image_uris?.normal;
  } catch (err) {
    console.error(`Erro ao buscar carta do set ${setCode}:`, err);
    return undefined;
  }
}

router.get("/discover", async (req, res) => {
  try {
    const latestSets = await prisma.set.findMany({
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    const precons = await prisma.set.findMany({
      where: { type: "commander" },
      orderBy: { releaseAt: "desc" },
      take: 10,
    });

    // Enriquecer precons com a imagem do comandante
    const enrichedPrecons = await Promise.all(
  precons.map(async (precon) => {
    const commanderCardImage = await getCommanderCardImage(precon.code);
    return {
      ...precon,
      commanderImage: commanderCardImage ?? precon.iconSvg ?? "/placeholder-set.png",
    };
  })
);

    res.json({
      latestSets,
      precons: enrichedPrecons,
    });
  } catch (err) {
    console.error("Erro no /discover:", err);
    res.status(500).json({ error: "Erro ao buscar discover" });
  }
});


export default router;