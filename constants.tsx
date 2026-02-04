import { Show, BlogPost, GalleryItem, Song } from "./types";

// Detecta ambiente
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Em produção, deixamos vazio para o Nginx assumir o domínio atual
// Em local, apontamos para a porta do Node
export const API_BASE_URL = isLocal ? "http://localhost:5000" : "";

// Função para garantir que URLs de mídia tenham o prefixo da API se necessário
export const getMediaUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // Se a URL já começa com /api/, está correta para produção
  if (url.startsWith("/api/")) return url;

  // Se começa com /uploads/, adicionamos /api na frente para passar pelo proxy
  if (url.startsWith("/uploads/")) return `/api${url}`;

  return url;
};

export const PEDRO_LOPES_HERO_IMAGE = "/assets/02.jpeg";
export const PEDRO_LOPES_MUSIC_IMAGE = "/assets/03.jpg";

export const INITIAL_SHOWS: Show[] = [];
export const INITIAL_BLOG_POSTS: BlogPost[] = [];
export const GALLERY_ITEMS: GalleryItem[] = [];
export const MY_SONGS: Song[] = [];
