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
// DTO de resposta do set
interface Set {
  object: string;
  id: string;
  code: string;
  mtgo_code: string | null;
  arena_code: string | null;
  tcgplayer_id: number | null;
  name: string;
  uri: string;
  scryfall_uri: string;
  released_at: string;
  set_type: string;
  card_count: number;
  printed_size: number | null;
  digital: boolean;
  nonfoil_only: boolean;
  foil_only: boolean;
  block_code: string | null;
  block: string | null;
  parent_set_code: string | null;
  icon_svg_uri: string | null;
  search_uri: string;
}

interface ScryfallApiResponse {
  data: Set[];
  has_more: boolean;
  next_page: string | null;
}

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
// Função para buscar sets no Scryfall

export async function fetchScryfallSets() {
  console.log("🌐 Chamando API da Scryfall para buscar sets...");

  const setsRes = await fetch("https://api.scryfall.com/sets", {
    headers: {
      "User-Agent": "NAGO/1.0",
      Accept: "application/json",
    },
  });

  if (!setsRes.ok) throw new Error("Erro ao buscar sets na Scryfall");

  const setsData = await setsRes.json() as ScryfallApiResponse;

  const allSets = setsData.data;

  // 🔹 10 sets mais recentes (geral)
  const latestSets = allSets
    .filter((set) => set.released_at) // evita null
    .sort((a, b) =>
      new Date(b.released_at!).getTime() - new Date(a.released_at!).getTime()
    )
    .slice(0, 10)
    .map(mapSet);

  // 🔹 10 precons (commander) mais recentes
  const precons = allSets
    .filter((set) => set.set_type === "commander" && set.released_at)
    .sort((a, b) =>
      new Date(b.released_at!).getTime() - new Date(a.released_at!).getTime()
    )
    .slice(0, 10)
    .map(mapSet);

  return { latestSets, precons };
}

// 🔹 helper pra não duplicar código
function mapSet(set: Set) {
  return {
    id: set.id,
    code: set.code,
    name: set.name,
    releaseAt: set.released_at,
    type: set.set_type,
    iconSvg: set.icon_svg_uri,
  };
}