import { Show, BlogPost, GalleryItem, Song } from "./types";

// Detecta se está rodando em produção (VPS) ou localmente
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Em produção, deixamos a URL vazia para que o navegador use o próprio domínio do site
// Ex: se o site é pedro.com, ele chamará pedro.com/api/...
export const API_BASE_URL = isLocal ? "http://localhost:5000" : "";

// Foto Principal do Pedro Lopes
// Certifique-se de que a pasta 'assets' esteja dentro da pasta 'public' no seu projeto.
export const PEDRO_LOPES_HERO_IMAGE = "/assets/02.jpeg";

// Iniciando a agenda sem nenhum show fixado
export const INITIAL_SHOWS: Show[] = [];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];
export const GALLERY_ITEMS: GalleryItem[] = [];
export const MY_SONGS: Song[] = [];
