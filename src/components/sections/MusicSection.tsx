import React, { useState, useRef } from "react";
import { Music, Play, Pause, Disc, AlertCircle } from "lucide-react";
import Section from "../Section";
import { Song } from "@/types";
import { getMediaUrl, PEDRO_LOPES_MUSIC_IMAGE } from "@/constants";

interface MusicSectionProps {
  songs: Song[];
}

const MusicSection: React.FC<MusicSectionProps> = ({ songs }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = async (song: Song) => {
    if (!audioRef.current) return;

    setAudioError(null);

    // ======================================================
    // PAUSAR MÚSICA ATUAL
    // ======================================================

    if (playingId === song.id) {
      audioRef.current.pause();

      setPlayingId(null);

      return;
    }

    try {
      // ======================================================
      // VALIDA URL
      // ======================================================

      if (!song.spotifyUrl || song.spotifyUrl.trim() === "") {
        setAudioError("Arquivo de áudio não encontrado.");

        return;
      }

      // ======================================================
      // LOADING
      // ======================================================

      setLoadingSongId(song.id);

      // ======================================================
      // URL FINAL
      // ======================================================

      const audioUrl = getMediaUrl(song.spotifyUrl);

      // ======================================================
      // RESET PLAYER
      // ======================================================

      audioRef.current.pause();

      audioRef.current.currentTime = 0;

      audioRef.current.src = audioUrl;

      // força recarregamento do áudio
      audioRef.current.load();

      // ======================================================
      // PLAY
      // ======================================================

      await audioRef.current.play();

      // ======================================================
      // SUCESSO
      // ======================================================

      setPlayingId(song.id);

      setAudioError(null);
    } catch (error) {
      console.error("Erro ao reproduzir:", error);

      setAudioError("Não foi possível reproduzir esta música.");

      setPlayingId(null);
    } finally {
      // ======================================================
      // FINALIZA LOADING
      // ======================================================

      setLoadingSongId(null);
    }
  };

  return (
    <Section id="music" title="Minhas Músicas">
      <audio
        ref={audioRef}
        preload="metadata"
        onEnded={() => setPlayingId(null)}
        onPause={() => {
          if (!audioRef.current?.ended) {
            setPlayingId(null);
          }
        }}
        onError={(e) => {
          console.error("Erro audio:", e);

          setAudioError("Erro ao carregar o arquivo de áudio.");

          setPlayingId(null);

          setLoadingSongId(null);
        }}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
        <div className="bg-black/20 p-8 md:p-12 rounded-[40px] border border-white/5 backdrop-blur-sm relative">
          <h3 className="text-3xl font-serif font-black mb-10 flex items-center gap-4 italic">
            <Music className="text-red-600 w-8 h-8" /> Playlist Oficial
          </h3>

          {audioError && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle size={16} /> {audioError}
            </div>
          )}

          <div className="space-y-4">
            {songs && songs.length > 0 ? (
              songs.map((song, i) => (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-5 rounded-3xl transition-all group cursor-pointer ${playingId === song.id ? "bg-red-700/20 border border-red-700/50" : "bg-white/5 border border-transparent hover:bg-white/10"}`}
                  onClick={() => togglePlay(song)}
                >
                  <div className="flex items-center gap-6">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                      <span
                        className={`text-2xl font-black italic transition-opacity absolute ${
                          playingId === song.id || loadingSongId === song.id
                            ? "opacity-0"
                            : "opacity-20 text-white"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {(playingId === song.id || loadingSongId === song.id) && (
                        <Disc className="text-red-600 animate-spin" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg tracking-tight group-hover:text-red-500 transition">
                        {song.title}
                      </p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-white/30">
                        Áudio Original
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm font-bold opacity-40">
                      {song.duration}
                    </span>
                    <button
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        playingId === song.id
                          ? "bg-red-700 text-white shadow-lg shadow-red-900/50"
                          : "bg-white/10 text-white group-hover:bg-red-700"
                      }`}
                    >
                      {loadingSongId === song.id ? (
                        <Disc className="animate-spin" size={18} />
                      ) : playingId === song.id ? (
                        <Pause size={20} fill="currentColor" />
                      ) : (
                        <Play size={20} fill="currentColor" className="ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Music size={40} className="mx-auto mb-4 opacity-5" />
                <p className="font-bold uppercase tracking-[0.3em] text-[10px] opacity-20">
                  Novas músicas em breve
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="relative group flex items-center justify-center">
          <div className="absolute inset-0 bg-red-600/10 blur-[120px] rounded-full group-hover:bg-red-600/20 transition-all"></div>
          <div className="relative">
            <img
              src={PEDRO_LOPES_MUSIC_IMAGE}
              className="w-full aspect-square max-w-[500px] object-cover rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-4 border-white/5"
              alt="Pedro Lopes Álbum"
            />
            <a
              href="https://open.spotify.com/intl-pt/album/37ZwGWeqdiGa2O7KPK1F9l?si=qbZ6JY8yR2qlQ-eoPzeuoQ"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-6 -right-6 bg-red-700 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl animate-pulse hover:scale-110 transition-transform cursor-pointer group"
            >
              <span className="text-white font-black text-center text-xs uppercase leading-none group-hover:underline">
                OUÇA NO
                <br />
                SPOTIFY
              </span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default MusicSection;
