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
  getMediaUrl,
} from "./constants";
import { Loader2, X } from "lucide-react";

const App: React.FC = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPass, setLoginPass] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Estados dos Dados (Carregados do Servidor)
  const [shows, setShows] = useState<Show[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  // 1. CARREGAR DADOS AO INICIAR
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/data`);

        if (response.ok) {
          const data = await response.json();

          console.log("DADOS DA API:", data);
          console.log("GALERIA:", data.gallery);

          setShows(data.shows || []);
          setPosts(data.posts || []);
          setGalleryItems(data.gallery || []);
          setSongs(data.songs || []);
        }
      } catch (error) {
        console.error("Erro ao sincronizar dados com o servidor:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleAdminLogin = async () => {
    if (!loginPass) return;
    setIsAuthenticating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ password: loginPass }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.token);

        setIsAdminMode(true);
        setShowLogin(false);
        setLoginPass("");
      } else {
        alert("Senha incorreta!");
      }
    } catch (error) {
      alert("Erro de conexão com a API.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 2. FUNÇÕES CRUD GENÉRICAS (Sincronizam com o Servidor)
  const addData = async (collection: string, item: any, setState: Function) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/data/${collection}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        throw new Error("Não autorizado");
      }

      const newItem = await response.json();

      setState((prev: any) => [newItem, ...prev]);

      console.log(`Sucesso ao salvar ${collection}`);
    } catch (err) {
      console.error(err);

      alert("Erro ao salvar dados.");
    }
  };

  const deleteData = async (
    collection: string,
    id: string,
    setState: Function,
  ) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este item permanentemente?",
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/data/${collection}/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Não autorizado");
      }

      setState((prev: any) => prev.filter((i: any) => i.id !== id));
    } catch (err) {
      console.error(err);

      alert("Erro ao excluir.");
    }
  };

  const editData = async (
    collection: string,
    id: string,
    updatedItem: any,
    setState: Function,
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/data/${collection}/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedItem),
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar");
      }

      const data = await response.json();

      setState((prev: any) =>
        prev.map((item: any) =>
          String(item.id) === String(id) ? data.item : item,
        ),
      );

      console.log(`${collection} atualizado com sucesso`);
    } catch (err) {
      console.error(err);

      alert("Erro ao atualizar.");
    }
  };

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
        // SHOWS
        onAddShow={(s) => addData("shows", s, setShows)}
        onDeleteShow={(id) => deleteData("shows", id, setShows)}
        onEditShow={async (id, updatedShow) => {
          try {
            const token = localStorage.getItem("token");

            const response = await fetch(
              `${API_BASE_URL}/api/data/shows/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedShow),
              },
            );

            if (!response.ok) {
              throw new Error("Erro ao atualizar show");
            }

            const data = await response.json();

            setShows((prev) =>
              prev.map((show) => (show.id === id ? data.item : show)),
            );
          } catch (error) {
            console.error(error);

            alert("Erro ao atualizar show");
          }
        }}
        // POSTS
        onAddPost={(p) => addData("posts", p, setPosts)}
        onDeletePost={(id) => deleteData("posts", id, setPosts)}
        onEditPost={async (id, updatedPost) => {
          try {
            const token = localStorage.getItem("token");

            const response = await fetch(
              `${API_BASE_URL}/api/data/posts/${id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedPost),
              },
            );

            if (!response.ok) {
              throw new Error("Erro ao atualizar post");
            }

            const data = await response.json();

            setPosts((prev) =>
              prev.map((post) => (post.id === id ? data.item : post)),
            );
          } catch (error) {
            console.error(error);

            alert("Erro ao atualizar post");
          }
        }}
        // GALERIA
        onAddGalleryItem={(i) => addData("gallery", i, setGalleryItems)}
        onDeleteGalleryItem={(id) => deleteData("gallery", id, setGalleryItems)}
        // MÚSICAS
        onAddSong={(s) => addData("songs", s, setSongs)}
        onDeleteSong={(id) => deleteData("songs", id, setSongs)}
        onLogout={() => {
          localStorage.removeItem("token");
          setIsAdminMode(false);
        }}
      />
    );
  }

  return (
    <div className="relative overflow-hidden bg-[#2D0B0B]">
      <Navbar onOpenLogin={() => setShowLogin(true)} />

      {isLoadingData ? (
        <div className="h-screen flex flex-col items-center justify-center text-white gap-6">
          <Loader2 className="animate-spin text-red-600" size={64} />
          <div className="text-center">
            <h2 className="text-xl font-serif font-black uppercase tracking-widest">
              Sincronizando
            </h2>
            <p className="text-xs opacity-50 uppercase tracking-[0.3em] mt-2">
              Carregando Agenda e Mídia...
            </p>
          </div>
        </div>
      ) : (
        <main>
          <Hero />
          <MusicSection songs={songs} />
          <Schedule shows={shows} />
          <Gallery items={galleryItems} />
          <Blog
            posts={posts}
            onLike={toggleLike}
            onLove={toggleLove}
            onReadMore={setSelectedPost}
          />
          <Contact />
        </main>
      )}

      <Footer />

      {/* Modal de Leitura do Blog */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/95 backdrop-blur-md"
            onClick={() => setSelectedPost(null)}
          ></div>

          <div className="relative bg-[#2D0B0B] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-6 right-6 z-10 p-2 bg-red-700 text-white rounded-full"
            >
              <X size={24} />
            </button>

            {/* IMAGEM AJUSTADA */}
            <div className="w-full bg-black flex items-center justify-center p-4">
              <img
                src={getMediaUrl(selectedPost.imageUrl)}
                className="max-w-full max-h-[450px] object-contain rounded-2xl"
                alt=""
              />
            </div>

            <div className="p-8 md:p-12 text-white">
              <span className="text-red-600 font-bold uppercase tracking-widest text-sm mb-4 block">
                {selectedPost.date}
              </span>

              <h2 className="text-4xl md:text-5xl font-serif font-black mb-8">
                {selectedPost.title}
              </h2>

              <div className="text-white/80 text-lg leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Admin */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          ></div>
          <div className="relative bg-[#2D0B0B] p-10 rounded-3xl border border-white/10 max-w-sm w-full text-white">
            <h2 className="text-2xl font-bold mb-6">Painel Administrativo</h2>
            <input
              type="password"
              placeholder="Senha de acesso"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 mb-4 outline-none focus:border-red-600"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 py-4 rounded-xl font-bold transition uppercase"
            >
              {isAuthenticating ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Acessar"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
