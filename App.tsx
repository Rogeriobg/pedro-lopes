import React, { useState, useEffect } from "react";
import Navbar from "./src/components/Navbar";
import Hero from "./src/components/sections/Hero";
import MusicSection from "./src/components/sections/MusicSection";
import Schedule from "./src/components/sections/Schedule";
import Gallery from "./src/components/sections/Gallery";
import Blog from "./src/components/sections/Blog";
import Contact from "./src/components/sections/Contact";

import AdminPanel from "./src/components/AdminPanel";
import Footer from "./src/components/Footer";

import { Show, BlogPost, GalleryItem, Song } from "./types";
import {
  INITIAL_SHOWS,
  INITIAL_BLOG_POSTS,
  GALLERY_ITEMS,
  MY_SONGS,
  API_BASE_URL,
} from "./constants";
import { Loader2, X } from "lucide-react";

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Estados com persistência no LocalStorage
  const [shows, setShows] = useState<Show[]>(() => {
    const saved = localStorage.getItem("pedro_lopes_shows");
    return saved ? JSON.parse(saved) : INITIAL_SHOWS;
  });

  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem("pedro_lopes_posts");
    return saved ? JSON.parse(saved) : INITIAL_BLOG_POSTS;
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem("pedro_lopes_gallery");
    return saved ? JSON.parse(saved) : GALLERY_ITEMS;
  });

  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem("pedro_lopes_songs");
    return saved ? JSON.parse(saved) : MY_SONGS;
  });

  useEffect(() => {
    localStorage.setItem("pedro_lopes_shows", JSON.stringify(shows));
  }, [shows]);

  useEffect(() => {
    localStorage.setItem("pedro_lopes_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("pedro_lopes_gallery", JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem("pedro_lopes_songs", JSON.stringify(songs));
  }, [songs]);

  const handleAdminLogin = async () => {
    if (!loginPass) return;

    setIsAuthenticating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: loginPass }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdminMode(true);
        setShowLogin(false);
        setLoginPass("");
      } else {
        alert(data.error || "Senha incorreta!");
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert("Erro ao conectar com o servidor administrativo.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const addShow = (s: Omit<Show, "id">) =>
    setShows((prev) => [{ ...s, id: Date.now().toString() }, ...prev]);
  const deleteShow = (id: string) =>
    setShows((prev) => prev.filter((s) => s.id !== id));

  const addPost = (p: Omit<BlogPost, "id" | "likes" | "loves">) =>
    setPosts((prev) => [
      { ...p, id: Date.now().toString(), likes: 0, loves: 0 },
      ...prev,
    ]);
  const deletePost = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  const addGalleryItem = (item: Omit<GalleryItem, "id">) =>
    setGalleryItems((prev) => [
      { ...item, id: Date.now().toString() },
      ...prev,
    ]);
  const deleteGalleryItem = (id: string) =>
    setGalleryItems((prev) => prev.filter((item) => item.id !== id));

  const addSong = (s: Omit<Song, "id">) =>
    setSongs((prev) => [{ ...s, id: Date.now().toString() }, ...prev]);
  const deleteSong = (id: string) =>
    setSongs((prev) => prev.filter((s) => s.id !== id));

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p)),
    );
  };

  const toggleLove = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, loves: p.loves + 1 } : p)),
    );
  };

  if (isAdminMode) {
    return (
      <AdminPanel
        shows={shows}
        posts={posts}
        galleryItems={galleryItems}
        songs={songs}
        onAddShow={addShow}
        onDeleteShow={deleteShow}
        onAddPost={addPost}
        onDeletePost={deletePost}
        onAddGalleryItem={addGalleryItem}
        onDeleteGalleryItem={deleteGalleryItem}
        onAddSong={addSong}
        onDeleteSong={deleteSong}
        onLogout={() => setIsAdminMode(false)}
      />
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#2D0B0B]">
      <Navbar onOpenLogin={() => setShowLogin(true)} />

      <main>
        <Hero />
        <MusicSection songs={songs} />
        <Schedule shows={shows} />
        <Gallery items={galleryItems} />
        <Blog
          posts={posts}
          onLike={toggleLike}
          onLove={toggleLove}
          onReadMore={(post) => setSelectedPost(post)}
        />
        <Contact />
      </main>

      <Footer />

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedPost(null)}
          ></div>
          <div className="relative bg-[#2D0B0B] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-red-700 text-white rounded-full shadow-xl hover:scale-110 transition"
            >
              <X size={24} />
            </button>
            <img
              src={selectedPost.imageUrl}
              className="w-full h-[450px] object-cover"
              alt=""
            />
            <div className="p-8 md:p-12">
              <span className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4 block">
                {selectedPost.date}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-white mb-8">
                {selectedPost.title}
              </h2>
              <div className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          ></div>
          <div className="relative bg-[#2D0B0B] p-10 rounded-3xl border border-white/10 max-w-sm w-full text-white">
            <h2 className="text-2xl font-bold mb-6">Acesso Administrativo</h2>
            <input
              type="password"
              placeholder="Digite a senha"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 outline-none focus:border-red-600"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isAuthenticating && handleAdminLogin()
              }
              disabled={isAuthenticating}
            />
            <button
              onClick={handleAdminLogin}
              disabled={isAuthenticating}
              className={`w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 py-4 rounded-xl font-bold transition uppercase tracking-widest ${isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isAuthenticating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Entrar no Painel"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
