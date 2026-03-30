import { useEffect, useState } from "react";
import AdminLayout from "./admin-sidebar";
import api from "./api";

interface APIEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  date: string;
  color: string;
}

const UpcomingEventsManagement = () => {
  const [events, setEvents] = useState<APIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<APIEvent | null>(null);

  // --- 1. Fetch Events (Read) ---
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("academics/events/");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- 2. Create / Update Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingEvent) {
        // Update
        const res = await api.patch(
          `academics/events/${editingEvent.id}/`,
          data,
        );
        setEvents(
          events.map((ev) => (ev.id === editingEvent.id ? res.data : ev)),
        );
      } else {
        // Create
        const res = await api.post("academics/events/", data);
        setEvents([res.data, ...events]);
      }
      closeModal();
    } catch (error) {
      alert("Failed to save event. Check console for details.");
    }
  };

  // --- 3. Delete Handler ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`academics/events/${id}/`);
      setEvents(events.filter((ev) => ev.id !== id));
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

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
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto mt-12 p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
            Manage Upcoming{" "}
            <span className="text-slate-300 font-light">Events</span>
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg"
          >
            + New Event
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            Loading events...
          </div>
        ) : events.length === 0 ? (
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
                  className="group relative flex items-center gap-6 p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Action Buttons (Visible on Hover) */}
                  <div className="absolute top-4 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setIsModalOpen(true);
                      }}
                      className="text-xs font-bold text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

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

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
              <h2 className="text-2xl font-black mb-6">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="title"
                  defaultValue={editingEvent?.title}
                  placeholder="Event Title"
                  required
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="description"
                  defaultValue={editingEvent?.description}
                  placeholder="Description"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 h-24"
                />

                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="date"
                    type="date"
                    defaultValue={editingEvent?.date}
                    required
                    className="p-4 bg-slate-50 rounded-2xl border-none"
                  />
                  <input
                    name="start_time"
                    type="time"
                    defaultValue={editingEvent?.start_time}
                    required
                    className="p-4 bg-slate-50 rounded-2xl border-none"
                  />
                </div>

                <select
                  name="color"
                  defaultValue={editingEvent?.color || "blue"}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none"
                >
                  <option value="blue">Blue (General)</option>
                  <option value="red">Red (Urgent)</option>
                  <option value="amber">Amber (Warning)</option>
                  <option value="green">Green (Success)</option>
                </select>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 p-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 p-4 font-bold bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-colors"
                  >
                    {editingEvent ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UpcomingEventsManagement;
