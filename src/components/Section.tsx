import React from "react";

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  isDark?: boolean;
}

const Section: React.FC<SectionProps> = ({
  id,
  title,
  children,
  isDark = false,
}) => {
  return (
    <section
      id={id}
      className={`py-24 px-6 md:px-12 ${isDark ? "bg-[#2D0B0B]" : "bg-[#3D0F0F]"}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-black mb-2 text-white">
            {title}
          </h2>
          <div className="h-1.5 w-24 bg-red-600 rounded-full"></div>
        </div>
        {children}
      </div>
    </section>
  );
};

export default Section;
