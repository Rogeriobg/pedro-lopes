import React from "react";
import { Clock, MapPin } from "lucide-react";
import Section from "../Section";
import { Show } from "@/types";

interface ScheduleProps {
  shows: Show[];
}

const Schedule: React.FC<ScheduleProps> = ({ shows }) => {
  return (
    <Section id="schedule" title="Agenda de Shows" isDark>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shows.length > 0 ? (
          shows.map((show) => (
            <div
              key={show.id}
              className="bg-gradient-to-br from-[#3D0F0F] to-[#2D0B0B] p-8 rounded-3xl border border-white/5 hover:border-red-600/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-red-700 text-white px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                  {new Date(show.date).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <div className="flex items-center gap-1 text-white/40 text-sm">
                  <Clock size={14} /> {show.time}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2 group-hover:text-red-500 transition text-white">
                {show.city}, {show.state}
              </h3>
              <p className="text-white/60 mb-6 flex items-center gap-2">
                <MapPin size={16} className="text-red-600" /> {show.venue}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/40">
            Agenda em breve. Aguarde novidades!
          </div>
        )}
      </div>
    </Section>
  );
};

export default Schedule;
