import { Show, BlogPost, GalleryItem, Song } from "./types";

// Detecta ambiente
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// Em produção, deixamos vazio para o Nginx assumir o domínio atual
// Em local, apontamos para a porta do Node
export const API_BASE_URL = isLocal ? "http://localhost:5000" : "";

export const PEDRO_LOPES_HERO_IMAGE = "/assets/02.jpeg";

export const INITIAL_SHOWS: Show[] = [];
export const INITIAL_BLOG_POSTS: BlogPost[] = [];
export const GALLERY_ITEMS: GalleryItem[] = [];
export const MY_SONGS: Song[] = [];
