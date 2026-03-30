import { useEffect, useState } from "react";
import Layout from "./sidebar";
import api from "./api";

interface APIEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  date: string;
  color: string;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<APIEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // 2. Use 'api' and remove the full URL (baseURL handles it)
        const response = await api.get("academics/events/");
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        // The interceptor in api.ts will handle 401s automatically
      }
    };
    fetchEvents();
  }, []);
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return {
      month: dateObj.toLocaleString("default", { month: "short" }),
      day: dateObj.getDate(),
    };
  };

  const colorMap: Record<string, string> = {
    red: "bg-rose-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-emerald-500",
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto mt-12 p-6">
        {/* 1. Header Section */}
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Upcoming <span className="text-slate-300 font-light">Events</span>
          </h3>
        </div>

        {events.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 italic">
              No upcoming events scheduled
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => {
              const { month, day } = formatDate(event.date);
              const dotColor = colorMap[event.color] || "bg-slate-400";

              return (
                <div
                  key={event.id}
                  className="group flex items-center gap-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Date Icon */}
                  <div className="shrink-0 w-16 h-16 flex flex-col items-center justify-center bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">
                      {month}
                    </span>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {day}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`w-2 h-2 rounded-full ${dotColor}`}
                      ></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        School Activity
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {event.title}
                    </h4>
                    <p className="text-sm text-slate-400 font-medium">
                      {event.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UpcomingEvents;
