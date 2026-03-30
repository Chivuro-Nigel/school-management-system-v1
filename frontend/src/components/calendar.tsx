const Calendar = () => {
  const today = new Date();
  const currentDay = today.getDate(); // 26
  const currentMonth = today.getMonth(); // February (1)
  const currentYear = today.getFullYear(); // 2026

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  // 1. Get the number of days in February 2026 (28)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // 2. Get the starting weekday (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Create array for empty slots (padding) before the 1st of the month
  const blanks = Array.from({ length: firstDayOfMonth });
  // Create array for the actual dates
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-sm mt-12 bg-white">
      {/* Month Selection */}
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
          February <span className="text-slate-300 font-light">2026</span>
        </h3>
        <div className="flex gap-4">
          <button className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
            &larr;
          </button>
          <button className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
            &rarr;
          </button>
        </div>
      </div>

      {/* Days Row */}
      <div className="grid grid-cols-7 mb-6">
        {days.map((day, index) => (
          <span
            key={index}
            className="text-[10px] font-bold text-slate-400 text-center tracking-widest uppercase"
          >
            {day}
          </span>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Render Blank Spaces */}
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}

        {/* Render Actual Dates */}
        {dates.map((date) => {
          // DYNAMIC CHECK: Is this date actually today?
          const isToday = date === currentDay;

          return (
            <div
              key={date}
              className="flex items-center justify-center aspect-square"
            >
              <button
                className={`
                  w-10 h-10 flex items-center justify-center text-sm font-semibold rounded-full transition-all
                  ${
                    isToday
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer"
                  }
                `}
              >
                {date}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
