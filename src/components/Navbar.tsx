import React, { useState } from "react";
import { Menu, X, Settings } from "lucide-react";

interface NavbarProps {
  onOpenLogin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Início", href: "#home" },
    { name: "Músicas", href: "#music" },
    { name: "Agenda", href: "#schedule" },
    { name: "Galeria", href: "#gallery" },
    { name: "Blog", href: "#blog" },
    { name: "Contato", href: "#contact" },
  ];

  return (
    <>
      <nav className="fixed w-full z-50 bg-[#2D0B0B]/90 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="text-2xl font-serif font-black tracking-tighter text-white">
          PEDRO <span className="text-red-600">LOPES</span>
        </div>

        <div className="hidden md:flex gap-8 items-center text-sm font-semibold tracking-wider uppercase text-white/80">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-red-600 transition"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={onOpenLogin}
            className="p-2 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white"
          >
            <Settings size={20} />
          </button>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#2D0B0B] flex flex-col items-center justify-center gap-8 text-2xl font-serif text-white">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              onOpenLogin();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 text-sm text-white/50"
          >
            <Settings size={16} /> Painel do Artista
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
