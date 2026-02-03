import React, { useState } from "react";
import { Image as ImageIcon, Video, X, Play } from "lucide-react";
import Section from "../Section";
import { GalleryItem } from "@/types";

interface GalleryProps {
  items: GalleryItem[];
}

const Gallery: React.FC<GalleryProps> = ({ items }) => {
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setErrorImages((prev) => ({ ...prev, [id]: true }));
  };

  // Filtramos itens que deram erro para não mostrar o "quadro" quebrado
  const validItems = items.filter((item) => !errorImages[item.id]);

  return (
    <Section id="gallery" title="Galeria">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {validItems.length > 0 ? (
          validItems.map((item) => {
            const displayUrl =
              item.type === "video" ? item.thumbnail || "" : item.url;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer shadow-lg bg-[#1a1a1a] border border-white/5"
              >
                <img
                  src={displayUrl}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110 group-hover:opacity-40"
                  alt=""
                  loading="lazy"
                  onError={() => handleImageError(item.id)}
                />

                <div className="absolute inset-0 bg-red-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white p-4">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-2">
                    {item.type === "video" ? (
                      <>
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Play size={24} fill="white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Ver Vídeo
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <ImageIcon size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          Ver Foto
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-32 text-center text-white/10 border-2 border-dashed border-white/5 rounded-3xl">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-5" />
            <p className="font-bold uppercase tracking-[0.3em] text-xs">
              Novas mídias em breve
            </p>
          </div>
        )}
      </div>

      {/* Lightbox / Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
          <div
            className="absolute inset-0 bg-black/98 backdrop-blur-xl"
            onClick={() => setSelectedMedia(null)}
          ></div>
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-8 right-8 text-white/60 hover:text-white transition z-[120] p-2 bg-white/5 rounded-full"
          >
            <X size={32} />
          </button>

          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                controls
                autoPlay
              />
            ) : (
              <img
                src={selectedMedia.url}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                alt=""
              />
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

export default Gallery;
