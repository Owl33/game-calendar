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
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 h-full">
        {/* 캘린더 섹션 -  */}
        <div className="lg:col-span-8">
          <div className="">
            <GameCalendar
              year={selectedDate.year}
              month={selectedDate.month}
              selectedDay={selectedDate.day}
              gamesByDate={gamesByDate}
              onMonthChange={actions.selectMonth}
              onYearChange={actions.selectYear}
              onDateChange={actions.selectDate}
              onDaySelect={actions.selectDay}
            />
          </div>
        </div>

        {/* 게임 리스트 섹션 -  */}
        <div className="px-4 pb-4 lg:col-span-4 h-full overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable]">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
            selectedDay={selectedDate.day}
          />
        </div>
      </div>

      {/* 모바일 레이아웃 */}
      <div className="lg:hidden space-y-6">
        {/* 모바일 날짜 선택기 */}
        <div className="">
          <CalendarHeader
            year={selectedDate.year}
            selectedMonth={selectedDate.month}
            onMonthChange={actions.selectMonth}
            onYearChange={actions.selectYear}
            onDateChange={actions.selectDate}
          />
        </div>

        {/* 모바일 게임 리스트 */}
        <div className="px-4 pb-4">
          <GameList
            games={filteredGames}
            isLoading={isLoading}
            onGameClick={handleGameClick}
            selectedDay={selectedDate.day}
          />
        </div>
      </div>
    </div>
  );
}
