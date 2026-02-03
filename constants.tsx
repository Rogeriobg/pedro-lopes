import { Show, BlogPost, GalleryItem, Song } from "./types";

// URL da sua API Node.js centralizada aqui
export const API_BASE_URL = "http://localhost:5000";

// Foto Estática Oficial do Pedro Lopes (Localizada em /assets/pedro-lopes-hero.jpg)
export const PEDRO_LOPES_HERO_IMAGE = "/assets/02.jpeg";

export const INITIAL_SHOWS: Show[] = [
  {
    id: "1",
    date: "2025-05-15",
    time: "22:00",
    city: "Goiânia",
    state: "GO",
    venue: "Villa Mix",
  },
  {
    id: "2",
    date: "2025-06-10",
    time: "23:00",
    city: "São Paulo",
    state: "SP",
    venue: "Espaço Unimed",
  },
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];

export const GALLERY_ITEMS: GalleryItem[] = [];

// Iniciamos com lista vazia para evitar que o player tente carregar links "#" inválidos
export const MY_SONGS: Song[] = [];
