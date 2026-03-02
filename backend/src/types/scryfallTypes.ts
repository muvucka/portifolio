export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  cmc: number;
  image_uris?: {
    normal?: string;
    art_crop?: string;
  };
  colors: string[];
  color_identity: string[];
  set: string;
  set_name: string;
}
