
export interface Show {
  id: string;
  date: string;
  time: string;
  city: string;
  state: string;
  venue: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
  likes: number;
  loves: number;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Song {
  id: string;
  title: string;
  duration: string;
  spotifyUrl: string;
}
