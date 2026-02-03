import React from "react";
import { Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";

const Footer: React.FC = () => {
  const whatsappNumber = "5514997925822";
  const instagramHandle = "pedroolopesoficial";
  const facebookUrl = "https://www.facebook.com/pedrolopes.geraldo";
  const youtubeUrl = "https://youtu.be/_pwIiP28JXw?si=Jm_jSFnSu3vIkgFD";

  const navLinks = [
    { name: "Início", href: "#home" },
    { name: "Músicas", href: "#music" },
    { name: "Agenda", href: "#schedule" },
    { name: "Galeria", href: "#gallery" },
    { name: "Blog", href: "#blog" },
    { name: "Contato", href: "#contact" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      icon: <Instagram size={20} />,
      href: `https://instagram.com/${instagramHandle}`,
      color: "hover:text-pink-500",
    },
    {
      name: "Facebook",
      icon: <Facebook size={20} />,
      href: facebookUrl,
      color: "hover:text-blue-500",
    },
    {
      name: "YouTube",
      icon: <Youtube size={20} />,
      href: youtubeUrl,
      color: "hover:text-red-600",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle size={20} />,
      href: `https://wa.me/${whatsappNumber}`,
      color: "hover:text-green-500",
    },
  ];

  return (
    <footer className="bg-[#2D0B0B]/95 backdrop-blur-md border-t border-white/5 pt-16 pb-8 px-6 md:px-12 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo e Slogan */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="text-3xl font-serif font-black tracking-tighter mb-4">
              PEDRO <span className="text-red-600">LOPES</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Levando a essência do sertanejo raiz e moderno para todo o Brasil.
              Onde tem Pedro Lopes, tem emoção.
            </p>
          </div>

          {/* Links de Navegação */}
          <div className="flex flex-col items-center">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-red-600">
              Navegação
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 text-center md:text-left">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes Sociais */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-red-600">
              Redes Sociais
            </h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 flex items-center justify-center bg-white/5 rounded-full transition-all duration-300 transform hover:scale-110 hover:bg-white/10 ${social.color}`}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé Final */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
            © 2025 PEDRO LOPES - Todos os direitos reservados
          </p>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">
            Desenvolvido com Paixão Sertaneja
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
