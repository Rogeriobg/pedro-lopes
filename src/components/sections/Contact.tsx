import React, { useState } from "react";
import {
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Section from "../Section";
import { API_BASE_URL } from "@/constants";

const Contact: React.FC = () => {
  const whatsappNumber = "5514997925822";
  const instagramHandle = "pedroolopesoficial";
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;
  const instagramUrl = `https://instagram.com/${instagramHandle}`;
  const facebookUrl = "https://www.facebook.com/pedrolopes.geraldo";
  const youtubeUrl = "https://youtu.be/_pwIiP28JXw?si=Jm_jSFnSu3vIkgFD";

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem.");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      // Volta ao estado normal após 5 segundos
      setTimeout(() => setStatus("idle"), 5000);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Erro de conexão com o servidor.");
    }
  };

  return (
    <Section id="contact" title="Contato">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-white">
        <div>
          <p className="text-xl text-white/70 mb-8 font-light leading-relaxed">
            Deseja levar o show do Pedro Lopes para sua cidade ou evento? Entre
            em contato com nossa equipe comercial.
          </p>
          <div className="space-y-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group cursor-pointer w-fit"
            >
              <div className="w-12 h-12 bg-red-700/20 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-700 group-hover:text-white transition-all">
                <MessageCircle />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-bold group-hover:text-red-500 transition-colors">
                  WhatsApp Comercial
                </p>
                <p className="font-bold text-lg text-white group-hover:underline">
                  (14) 99792-5822
                </p>
              </div>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 group cursor-pointer w-fit"
            >
              <div className="w-12 h-12 bg-red-700/20 rounded-full flex items-center justify-center text-red-600 group-hover:bg-red-700 group-hover:text-white transition-all">
                <Instagram />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase font-bold group-hover:text-red-500 transition-colors">
                  Instagram Oficial
                </p>
                <p className="font-bold text-lg text-white group-hover:underline">
                  @pedroolopesoficial
                </p>
              </div>
            </a>
          </div>

          <div className="flex gap-4 mt-12">
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 rounded-full hover:bg-red-700 transition"
              title="Facebook"
            >
              <Facebook />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 rounded-full hover:bg-red-700 transition"
              title="Instagram"
            >
              <Instagram />
            </a>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-white/5 rounded-full hover:bg-red-700 transition"
              title="YouTube"
            >
              <Youtube />
            </a>
          </div>
        </div>

        <div className="relative">
          {status === "success" ? (
            <div className="bg-green-900/20 border border-green-500/50 p-10 rounded-3xl h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
              <CheckCircle2 size={64} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Mensagem Enviada!</h3>
              <p className="text-white/60">
                Obrigado pelo contato. Responderemos em breve.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 p-10 rounded-3xl border border-white/5 space-y-4"
            >
              {status === "error" && (
                <div className="bg-red-900/30 border border-red-500 p-4 rounded-xl text-red-200 text-sm font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Seu Nome"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none text-white transition-colors"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={status === "loading"}
                />
                <input
                  type="email"
                  placeholder="Seu E-mail"
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none text-white transition-colors"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={status === "loading"}
                />
              </div>
              <input
                type="text"
                placeholder="Assunto"
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none text-white transition-colors"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                disabled={status === "loading"}
              />
              <textarea
                rows={5}
                placeholder="Sua mensagem..."
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 focus:border-red-600 outline-none text-white transition-colors resize-none"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                disabled={status === "loading"}
              ></textarea>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition shadow-lg ${status === "loading" ? "bg-gray-700 cursor-not-allowed" : "bg-red-700 hover:bg-red-600 shadow-red-950/50"}`}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    ENVIAR MENSAGEM
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Contact;
