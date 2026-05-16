import React, { useMemo, useState, useEffect } from "react";
import { Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

import Section from "../Section";
import { Show } from "@/types";

interface ScheduleProps {
  shows: Show[];
}

const Schedule: React.FC<ScheduleProps> = ({ shows }) => {
  const currentDate = new Date();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Agrupa os shows
  const groupedShows = useMemo(() => {
    const groups: Record<
      string,
      {
        key: string;
        label: string;
        shows: Show[];
        month: number;
        year: number;
        dateValue: number;
      }
    > = {};

    shows.forEach((show) => {
      const date = new Date(show.date);

      const month = date.getMonth();
      const year = date.getFullYear();

      const key = `${year}-${month}`;

      const label = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });

      if (!groups[key]) {
        groups[key] = {
          key,
          label,
          shows: [],
          month,
          year,
          dateValue: new Date(year, month).getTime(),
        };
      }

      groups[key].shows.push(show);
    });

    // Ordena crescente
    return Object.values(groups).sort((a, b) => a.dateValue - b.dateValue);
  }, [shows]);

  // Descobre índice do mês atual
  const currentMonthIndex = groupedShows.findIndex(
    (item) => item.month === currentMonth && item.year === currentYear,
  );

  // Mês selecionado
  const [selectedIndex, setSelectedIndex] = useState(
    currentMonthIndex >= 0 ? currentMonthIndex : 0,
  );

  // Atualiza automaticamente quando shows carregarem
  useEffect(() => {
    if (currentMonthIndex >= 0) {
      setSelectedIndex(currentMonthIndex);
    }
  }, [currentMonthIndex]);

  const selectedMonth = groupedShows[selectedIndex];

  const previousMonth =
    selectedIndex > 0 ? groupedShows[selectedIndex - 1] : null;

  const nextMonth =
    selectedIndex < groupedShows.length - 1
      ? groupedShows[selectedIndex + 1]
      : null;

  return (
    <Section id="schedule" title="Agenda de Shows" isDark>
      {shows.length > 0 && selectedMonth ? (
        <div className="space-y-8">
          {/* Navegação dos meses */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Mês anterior */}
            {previousMonth && (
              <button
                onClick={() => setSelectedIndex(selectedIndex - 1)}
                className="flex items-center gap-2 bg-gradient-to-br from-[#2A0B0B] to-[#1B0707] border border-white/5 hover:border-red-600/40 px-5 py-3 rounded-2xl transition-all hover:scale-[1.02]"
              >
                <ChevronLeft size={18} className="text-red-500" />

                <span className="text-white/70 capitalize">
                  {previousMonth.label}
                </span>
              </button>
            )}

            {/* Mês atual selecionado */}
            <div className="bg-red-700 px-6 py-3 rounded-2xl text-white font-bold uppercase tracking-wider shadow-lg shadow-red-900/30">
              {selectedMonth.label}
            </div>

            {/* Próximo mês */}
            {nextMonth && (
              <button
                onClick={() => setSelectedIndex(selectedIndex + 1)}
                className="flex items-center gap-2 bg-gradient-to-br from-[#2A0B0B] to-[#1B0707] border border-white/5 hover:border-red-600/40 px-5 py-3 rounded-2xl transition-all hover:scale-[1.02]"
              >
                <span className="text-white/70 capitalize">
                  {nextMonth.label}
                </span>

                <ChevronRight size={18} className="text-red-500" />
              </button>
            )}
          </div>

          {/* Shows do mês */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedMonth.shows.map((show) => (
              <div
                key={show.id}
                className="bg-gradient-to-br from-[#3D0F0F] to-[#2D0B0B] p-8 rounded-3xl border border-white/5 hover:border-red-600/50 transition-all group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-red-700 text-white px-4 py-1 rounded-lg text-xs font-bold uppercase tracking-widest">
                    {new Date(show.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-white/40 text-sm">
                    <Clock size={14} />
                    {show.time}
                  </div>
                </div>

                <h3 className="text-2xl font-bold mb-2 group-hover:text-red-500 transition text-white">
                  {show.city}, {show.state}
                </h3>

                <p className="text-white/60 mb-6 flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  {show.venue}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-white/40">
          Agenda em breve. Aguarde novidades!
        </div>
      )}
    </Section>
  );
};

export default Schedule;
