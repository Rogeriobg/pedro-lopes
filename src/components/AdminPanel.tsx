import React, { useState } from "react";
import { Show, BlogPost, GalleryItem, Song } from "@/types";
import { API_BASE_URL } from "@/constants";
import {
  Trash2,
  LogOut,
  Calendar,
  FileText,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Upload,
  Loader2,
  CheckCircle2,
  Music,
  Play,
  AlertTriangle,
} from "lucide-react";

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
    {children}
  </label>
);

const Input: React.FC<any> = (props) =>
  props.type === "textarea" ? (
    <textarea
      {...props}
      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 text-sm focus:border-red-600 outline-none transition resize-none text-white"
    />
  ) : (
    <input
      {...props}
      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 text-sm focus:border-red-600 outline-none transition text-white"
    />
  );

interface AdminPanelProps {
  shows: Show[];
  posts: BlogPost[];
  galleryItems: GalleryItem[];
  songs: Song[];

  onAddShow: (show: Omit<Show, "id">) => void;
  onDeleteShow: (id: string) => void;

  onAddPost: (post: Omit<BlogPost, "id" | "likes" | "loves">) => void;
  onDeletePost: (id: string) => void;

  onAddGalleryItem: (item: Omit<GalleryItem, "id">) => void;
  onDeleteGalleryItem: (id: string) => void;

  onAddSong: (song: Omit<Song, "id">) => void;
  onDeleteSong: (id: string) => void;

  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  shows,
  posts,
  galleryItems,
  songs = [],
  onAddShow,
  onDeleteShow,
  onAddPost,
  onDeletePost,
  onAddGalleryItem,
  onDeleteGalleryItem,
  onAddSong,
  onDeleteSong,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    "shows" | "blog" | "gallery" | "songs"
  >("shows");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [newShow, setNewShow] = useState({
    date: "",
    time: "",
    city: "",
    state: "",
    venue: "",
  });
  const [newPost, setNewPost] = useState({
    title: "",
    excerpt: "",
    content: "",
    date: "",
    imageUrl: "",
  });
  const [newItem, setNewItem] = useState<Omit<GalleryItem, "id">>({
    type: "image",
    url: "",
    thumbnail: "",
  });
  const [newSong, setNewSong] = useState({
    title: "",
    duration: "",
    spotifyUrl: "",
  });

  const uploadFile = async (
    file: File,
    folder: "imagens" | "musicas" = "imagens",
  ) => {
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("file", file);

    const targetUrl = `${API_BASE_URL}/api/upload`;
    console.log(
      `[PAINEL] Iniciando upload para: ${targetUrl} (Pasta: ${folder})`,
    );

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[PAINEL] Erro HTTP ${response.status}:`, errorText);
        throw new Error(
          `Servidor respondeu com erro ${response.status}: ${errorText || "Erro desconhecido"}`,
        );
      }

      const data = await response.json();
      console.log("[PAINEL] Upload finalizado com sucesso:", data.url);
      setIsUploading(false);
      return data.url;
    } catch (error: any) {
      console.error("[PAINEL] Erro fatal no fetch de upload:", error);
      setIsUploading(false);
      setUploadError(error.message);
      return null;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "post" | "gallery" | "thumb" | "music",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const folder = target === "music" ? "musicas" : "imagens";
      const url = await uploadFile(file, folder);
      if (url) {
        if (target === "post")
          setNewPost((prev) => ({ ...prev, imageUrl: url }));
        else if (target === "gallery")
          setNewItem((prev) => ({ ...prev, url: url }));
        else if (target === "thumb")
          setNewItem((prev) => ({ ...prev, thumbnail: url }));
        else if (target === "music")
          setNewSong((prev) => ({ ...prev, spotifyUrl: url }));
      }
    }
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSong.spotifyUrl) {
      alert("Por favor, selecione e aguarde o upload do arquivo MP3 primeiro.");
      return;
    }
    onAddSong({
      title: newSong.title,
      duration: newSong.duration,
      spotifyUrl: newSong.spotifyUrl,
    });
    setNewSong({ title: "", duration: "", spotifyUrl: "" });
  };

  const tabs = [
    { id: "shows", label: "Agenda", icon: Calendar },
    { id: "songs", label: "Músicas", icon: Music },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "gallery", label: "Galeria", icon: ImageIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 font-sans">
      <header className="bg-[#1a1a1a] border-b border-white/5 px-8 py-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-red-700 p-2 rounded-lg text-white">
            <SettingsIcon size={20} />
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight">
            Painel <span className="text-red-600">Pedro Lopes</span>
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-lg"
        >
          <LogOut size={16} /> SAIR
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {uploadError && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-2xl flex items-start gap-4 text-red-200 animate-in slide-in-from-top duration-300">
            <AlertTriangle className="mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="font-bold text-xs uppercase tracking-widest">
                Falha Crítica de Conexão
              </p>
              <p className="text-sm opacity-80 mt-1">{uploadError}</p>
              <p className="text-[10px] mt-2 opacity-50 italic">
                Verifique se o Nginx está permitindo arquivos grandes ou se a
                API está online em /api/debug
              </p>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-[10px] bg-white/10 px-3 py-1 rounded-lg uppercase font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-xl font-bold text-xs transition-all ${activeTab === tab.id ? "bg-red-700 text-white shadow-lg shadow-red-900/40" : "text-gray-500 hover:bg-white/5"}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {isUploading && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-red-600" size={48} />
              <p className="font-bold uppercase tracking-widest text-sm">
                Fazendo Upload...
              </p>
            </div>
          </div>
        )}

        <div className="min-h-[400px]">
          {activeTab === "shows" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-4 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl h-fit">
                <h2 className="text-lg font-bold mb-6 text-red-600">
                  Novo Show
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddShow(newShow);
                    setNewShow({
                      date: "",
                      time: "",
                      city: "",
                      state: "",
                      venue: "",
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data</Label>
                      <Input
                        type="date"
                        required
                        value={newShow.date}
                        onChange={(e: any) =>
                          setNewShow({ ...newShow, date: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Hora</Label>
                      <Input
                        type="time"
                        required
                        value={newShow.time}
                        onChange={(e: any) =>
                          setNewShow({ ...newShow, time: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      type="text"
                      placeholder="Ex: Goiânia"
                      required
                      value={newShow.city}
                      onChange={(e: any) =>
                        setNewShow({ ...newShow, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <Label>UF</Label>
                      <Input
                        type="text"
                        placeholder="GO"
                        maxLength={2}
                        required
                        value={newShow.state}
                        onChange={(e: any) =>
                          setNewShow({ ...newShow, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Local</Label>
                      <Input
                        type="text"
                        placeholder="Arena Hall"
                        required
                        value={newShow.venue}
                        onChange={(e: any) =>
                          setNewShow({ ...newShow, venue: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-red-700 hover:bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all"
                  >
                    Salvar Show
                  </button>
                </form>
              </div>
              <div className="lg:col-span-8 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold mb-6">Agenda de Shows</h2>
                <div className="space-y-3">
                  {shows.map((show) => (
                    <div
                      key={show.id}
                      className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-red-700/10 px-4 py-2 rounded-xl text-center min-w-[70px]">
                          <p className="text-red-500 font-black text-xl leading-none">
                            {new Date(show.date).getUTCDate()}
                          </p>
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wide">
                            {show.city}, {show.state}
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase font-bold">
                            {show.venue} • {show.time}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteShow(show.id)}
                        className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "songs" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-4 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl h-fit">
                <h2 className="text-lg font-bold mb-6 text-red-600 uppercase tracking-tighter">
                  Gerenciar Músicas
                </h2>
                <form onSubmit={handleAddSong} className="space-y-4">
                  <div>
                    <Label>Título da Música</Label>
                    <Input
                      type="text"
                      required
                      value={newSong.title}
                      onChange={(e: any) =>
                        setNewSong({ ...newSong, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Duração (Ex: 3:45)</Label>
                    <Input
                      type="text"
                      required
                      value={newSong.duration}
                      onChange={(e: any) =>
                        setNewSong({ ...newSong, duration: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Arquivo de Áudio (MP3)</Label>
                    <div className="relative group">
                      <div className="w-full h-32 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-colors group-hover:border-red-600/50">
                        {newSong.spotifyUrl ? (
                          <div className="flex flex-col items-center p-4">
                            <CheckCircle2
                              size={32}
                              className="text-green-500 mb-2"
                            />
                            <span className="text-[10px] text-green-500 font-black uppercase text-center">
                              Áudio Pronto!
                            </span>
                          </div>
                        ) : (
                          <>
                            <Music size={24} className="text-gray-600 mb-2" />
                            <span className="text-[10px] uppercase font-bold text-gray-600">
                              Clique para selecionar
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => handleFileChange(e, "music")}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!newSong.spotifyUrl}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${!newSong.spotifyUrl ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-red-700 shadow-lg shadow-red-900/40 hover:bg-red-600"}`}
                  >
                    Salvar na Lista
                  </button>
                </form>
              </div>
              <div className="lg:col-span-8 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold mb-6">Músicas Disponíveis</h2>
                <div className="space-y-3">
                  {songs.length > 0 ? (
                    songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex justify-between items-center bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-red-700/10 p-3 rounded-xl">
                            <Play size={18} className="text-red-500" />
                          </div>
                          <div>
                            <p className="font-bold text-sm uppercase tracking-wide">
                              {song.title}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">
                              {song.duration} • MP3 Local
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteSong(song.id)}
                          className="p-3 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                      <Music size={48} className="mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">
                        Nenhuma música cadastrada
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "blog" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-5 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl h-fit">
                <h2 className="text-lg font-bold mb-6 text-red-600">
                  Nova Notícia
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAddPost(newPost);
                    setNewPost({
                      title: "",
                      excerpt: "",
                      content: "",
                      date: "",
                      imageUrl: "",
                    });
                  }}
                  className="space-y-4"
                >
                  <Input
                    placeholder="Título"
                    required
                    value={newPost.title}
                    onChange={(e: any) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                  />
                  <div className="relative h-40 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                    {newPost.imageUrl ? (
                      <img
                        src={newPost.imageUrl}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-600 mb-2" />
                        <span className="text-[10px] uppercase font-bold text-gray-600">
                          Selecionar foto
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, "post")}
                    />
                  </div>
                  <Input
                    type="date"
                    required
                    value={newPost.date}
                    onChange={(e: any) =>
                      setNewPost({ ...newPost, date: e.target.value })
                    }
                  />
                  <Input
                    type="textarea"
                    placeholder="Conteúdo..."
                    rows={6}
                    value={newPost.content}
                    onChange={(e: any) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    disabled={!newPost.imageUrl}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${!newPost.imageUrl ? "bg-gray-800 text-gray-500" : "bg-red-700 shadow-lg shadow-red-900/40"}`}
                  >
                    Publicar no Blog
                  </button>
                </form>
              </div>
              <div className="lg:col-span-7 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl">
                <h2 className="text-lg font-bold mb-6">Posts Atuais</h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="flex gap-4 items-center bg-black/30 p-3 rounded-2xl border border-white/5"
                    >
                      <img
                        src={post.imageUrl}
                        className="w-16 h-16 rounded-xl object-cover bg-black"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs truncate uppercase tracking-wide">
                          {post.title}
                        </p>
                        <p className="text-[9px] text-gray-500 font-bold">
                          {post.date}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="text-gray-600 hover:text-red-500 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-4 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 shadow-xl h-fit">
                <h2 className="text-lg font-bold mb-6 text-red-600">Galeria</h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: "image" })}
                    className={`py-3 rounded-xl border text-[10px] font-black ${newItem.type === "image" ? "bg-red-700 border-red-700 text-white" : "border-white/5 text-gray-600"}`}
                  >
                    FOTO
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewItem({ ...newItem, type: "video" })}
                    className={`py-3 rounded-xl border text-[10px] font-black ${newItem.type === "video" ? "bg-red-700 border-red-700 text-white" : "border-white/5 text-gray-600"}`}
                  >
                    VÍDEO
                  </button>
                </div>
                <div className="relative aspect-video bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden group">
                  {newItem.url ? (
                    newItem.type === "image" ? (
                      <img
                        src={newItem.url}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <video
                        src={newItem.url}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <>
                      <Upload size={32} className="text-gray-600 mb-2" />
                      <span className="text-[10px] uppercase font-black text-gray-600">
                        Escolher {newItem.type === "image" ? "Foto" : "Vídeo"}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept={newItem.type === "image" ? "image/*" : "video/*"}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, "gallery")}
                  />
                </div>
                {newItem.type === "video" && (
                  <div className="mt-4">
                    <Label>Capa do Vídeo (Thumbnail)</Label>
                    <div className="relative h-24 bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                      {newItem.thumbnail ? (
                        <img
                          src={newItem.thumbnail}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <Upload size={16} />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, "thumb")}
                      />
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onAddGalleryItem(newItem);
                    setNewItem({ type: "image", url: "", thumbnail: "" });
                  }}
                  disabled={!newItem.url}
                  className="w-full mt-6 py-4 bg-red-700 rounded-xl font-black uppercase tracking-widest transition-all"
                >
                  Adicionar
                </button>
              </div>
              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-black rounded-2xl overflow-hidden group border border-white/5"
                  >
                    <img
                      src={item.type === "video" ? item.thumbnail : item.url}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500"
                      alt=""
                    />
                    <button
                      onClick={() => onDeleteGalleryItem(item.id)}
                      className="absolute top-2 right-2 bg-red-700 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xl"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
