import React, { useState } from "react";
import { ThumbsUp, Heart, ImageIcon } from "lucide-react";
import Section from "../Section";
import { BlogPost } from "@/types";
import { getMediaUrl } from "@/constants";

interface BlogProps {
  posts: Array<BlogPost>;
  onLike: (id: string) => void;
  onLove: (id: string) => void;
  onReadMore: (post: BlogPost) => void;
}

const Blog: React.FC<BlogProps> = ({ posts, onLike, onLove, onReadMore }) => {
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageError = (id: string) => {
    setErrorImages((prev) => ({ ...prev, [id]: true }));
  };

  // Só mostramos posts que possuam imagem válida
  const validPosts = posts.filter(
    (post) =>
      post.imageUrl && post.imageUrl.trim() !== "" && !errorImages[post.id],
  );

  if (validPosts.length === 0) return null;

  return (
    <Section id="blog" title="Blog do Pedro" isDark>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {validPosts.map((post) => {
          return (
            <article
              key={post.id}
              className="bg-white/5 rounded-3xl overflow-hidden border border-white/5 hover:bg-white/[0.08] transition text-white flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={getMediaUrl(post.imageUrl)}
                  className="w-full h-full object-contain transition duration-500 hover:scale-105"
                  alt=""
                  onError={() => handleImageError(post.id)}
                />

                <div className="absolute top-4 left-4">
                  <span className="bg-red-700 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {new Date(post.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-red-500 transition">
                  {post.title}
                </h3>
                <p className="text-white/60 mb-6 line-clamp-3 text-sm leading-relaxed flex-1">
                  {post.excerpt || post.content}
                </p>
                <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-auto">
                  <div className="flex gap-4">
                    <button
                      onClick={() => onLike(post.id)}
                      className="flex items-center gap-2 hover:text-red-500 transition group"
                    >
                      <ThumbsUp
                        size={18}
                        className="group-active:scale-125 transition"
                      />
                      <span className="text-sm font-bold">{post.likes}</span>
                    </button>
                    <button
                      onClick={() => onLove(post.id)}
                      className="flex items-center gap-2 hover:text-red-500 transition group"
                    >
                      <Heart
                        size={18}
                        className="text-pink-500 group-active:scale-125 transition fill-pink-500/20"
                      />
                      <span className="text-sm font-bold">{post.loves}</span>
                    </button>
                  </div>
                  <button
                    onClick={() => onReadMore(post)}
                    className="text-xs font-black uppercase tracking-widest text-red-600 hover:text-white transition flex items-center gap-1 group"
                  >
                    Ler tudo{" "}
                    <span className="group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
};

export default Blog;
