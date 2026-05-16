import { Show, BlogPost, GalleryItem, Song } from "./types";

// ======================================================
// DETECTA AMBIENTE
// ======================================================

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// ======================================================
// API BASE URL
// ======================================================

export const API_BASE_URL = isLocal ? "http://localhost:5000" : "";

// ======================================================
// MEDIA URL
// ======================================================

export const getMediaUrl = (url: string) => {
  if (!url) return "";

  // já é URL absoluta
  if (url.startsWith("http")) {
    return url;
  }

  // ambiente local
  if (isLocal) {
    return `http://localhost:5000${url}`;
  }

  // produção
  return url;
};

// ======================================================
// ASSETS
// ======================================================

export const PEDRO_LOPES_HERO_IMAGE = "/assets/02.jpeg";
export const PEDRO_LOPES_MUSIC_IMAGE = "/assets/03.jpg";

export const LOGO_IMAGE = "/assets/logo.png";
export const LOGO_NAV_IMAGE = "/assets/logo2.png";

// ======================================================
// DADOS INICIAIS
// ======================================================

export const INITIAL_SHOWS: Show[] = [];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];

export const GALLERY_ITEMS: GalleryItem[] = [];

export const MY_SONGS: Song[] = [];
