"use client";

import { GameCalendar } from "./components/GameCalendar";
import { CalendarHeader } from "./components/GameCalendar/CalendarHeader";
import { GameList } from "./components/GameList/GameList";
import { useGameCalendar } from "./hooks/useGameCalendar";

export default function Calendar() {
  const { selectedDate, games, gamesByDate, filteredGames, isLoading, actions } = useGameCalendar();

  const handleGameClick = (game: any) => {
    // 게임 클릭 시 처리 로직 (선택사항)
    console.log("게임 클릭:", game);
  };

  return (
    <div className="h-full">
      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 h-full">
        {/* 캘린더 섹션 - glassmorphism 컨테이너 */}
        <div className="lg:col-span-8">
          <div className="">
            <GameCalendar
              year={selectedDate.year}
              month={selectedDate.month}
              selectedDay={selectedDate.day}
              gamesByDate={gamesByDate}
              onMonthChange={actions.selectMonth}
              onYearChange={actions.selectYear}
              onDaySelect={actions.selectDay}
            />
          </div>
        </div>

        {/* 게임 리스트 섹션 - glassmorphism 컨테이너 */}
        <div className="px-4 pb-4 lg:col-span-4 h-full overflow-y-auto overflow-x-hidden  [scrollbar-gutter:stable]">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
          />
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="lg:hidden space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-600">
        {/* 모바일 날짜 선택기 */}
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6">
          <CalendarHeader
            year={selectedDate.year}
            selectedMonth={selectedDate.month}
            onMonthChange={actions.selectMonth}
            onYearChange={actions.selectYear}
          />
        </div>

        {/* 모바일 게임 리스트 */}
        <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
          />
        </div>
      </div>
    </div>
  );
}
