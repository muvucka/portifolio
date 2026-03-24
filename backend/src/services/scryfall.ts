import fetch from "node-fetch";
import type { ScryfallCardResponse } from "../types/deckTypes.js";

// =========================
// CARD DTO
// =========================
type CardDTO = {
  scryfallId: string;
  name: string;
  typeLine: string;
  cmc: number;
  imageNormal: string | null;
  imageArtCrop: string | null;
  setCode: string;
  setName: string;
  collectorNumber: string;
  isBasicLand: boolean;
  colors: string[];
  colorIdentity: string[];
};

// =========================
// SETS DTO
// =========================
export type ScryfallSet = {
  id: string;
  code: string;
  name: string;
  type: string;
  released_at: string;
  icon_svg_uri: string;
};

export type SetDTO = {
  name: string;
  code: string;
  releaseAt: Date;
  type: string;
  iconSvg: string;
};

// =========================
// FETCH CARD BY NAME
// =========================
export async function fetchCardByName(name: string): Promise<CardDTO> {
  const response = await fetch(
    `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}`,
    {
      headers: {
        "User-Agent": "NAGO/1.0",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error("Carta não encontrada");
    throw new Error(`Scryfall error: ${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as ScryfallCardResponse;

  return {
    scryfallId: data.id,
    name: data.name,
    typeLine: data.type_line,
    cmc: data.cmc,
    imageNormal: data.image_uris?.normal ?? null,
    imageArtCrop: data.image_uris?.art_crop ?? null,
    setCode: data.set,
    setName: data.set_name,
    collectorNumber: data.collector_number,
    isBasicLand: data.type_line.toLowerCase().includes("basic"),
    colors: data.colors ?? [],
    colorIdentity: data.color_identity ?? [],
  };
}

// =========================
// FETCH SETS FROM Scryfall
// =========================
// =========================
// FETCH SETS FROM Scryfall COM LOG
// =========================
export async function fetchScryfallSets(): Promise<{ latestSets: SetDTO[]; precons: SetDTO[] }> {
  console.log("🌐 Chamando API da Scryfall para buscar sets...");

  const setsRes = await fetch("https://api.scryfall.com/sets", {
    headers: {
      "User-Agent": "NAGO/1.0",
      Accept: "application/json",
    },
  });

  console.log("📡 Resposta da Scryfall recebida:", setsRes.status, setsRes.statusText);

  if (!setsRes.ok) throw new Error("Erro ao buscar sets na Scryfall");

  const setsData = (await setsRes.json()) as { data: ScryfallSet[] };

  if (!setsData || !setsData.data) throw new Error("Resposta inválida da Scryfall");

  console.log("✅ Total de sets recebidos da Scryfall:", setsData.data.length);

  const latestSets: SetDTO[] = setsData.data
    .sort((a, b) => new Date(b.released_at).getTime() - new Date(a.released_at).getTime())
    .slice(0, 10)
    .map((s) => ({
      name: s.name,
      code: s.code,
      releaseAt: new Date(s.released_at),
      type: s.type,
      iconSvg: s.icon_svg_uri,
    }));

  const precons: SetDTO[] = latestSets.filter((s) => s.type === "commander").slice(0, 10);

  console.log("📦 LatestSets:", latestSets.map((s) => s.code));
  console.log("🛡 Precons:", precons.map((s) => s.code));

  return { latestSets, precons };
}