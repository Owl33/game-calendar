"use client";

import { useApi } from "@/lib/useApi";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1~12

  // 연월 문자열: "2025-01"
  const yearMonth = `${year}-${month.toString().padStart(2, "0")}`;

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games", yearMonth],
    queryFn: async () => {
      const { success, data } = await useApi.get(`/games/${yearMonth}`);
      return success ? data : [];
    },
    placeholderData: (previousData) => previousData,
  });

  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDay = new Date(year, month, 0).getDate();

  // 날짜별 게임 매핑
  const gamesByDate: Record<number, any[]> = {};
  games.forEach((g: any) => {
    const released = new Date(g.released);
    if (released.getFullYear() === year && released.getMonth() + 1 === month) {
      const day = released.getDate();
      if (!gamesByDate[day]) gamesByDate[day] = [];
      gamesByDate[day].push(g);
    }
  });

  return (
    <div className="grid grid-cols-10 gap-6">
      {/* 달력 (7) */}
      <div className="col-span-7 bg-white rounded-2xl shadow-lg p-6">
        {/* 연도/월 선택 */}
        <div className="flex items-center mb-6">
          <p className="mx-4 text-center font-semibold text-gray-800 text-3xl">{year}년</p>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <div
              key={m}
              onClick={() => setMonth(m)}
              className={`py-1 rounded-lg ml-4 flex-1 font-semibold text-lg text-center ${
                month === m ? "bg-blue-300 text-white" : "text-gray-800"
              }`}>
              {m}월
            </div>
          ))}
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 text-center font-semibold text-gray-600 mb-2">
          <div className="text-red-500">일</div>
          <div>월</div>
          <div>화</div>
          <div>수</div>
          <div>목</div>
          <div>금</div>
          <div className="text-blue-500">토</div>
        </div>

        {/* 날짜 칸 */}
        <div className="grid grid-cols-7 gap-2">
          {/* 빈칸 */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-28 rounded-xl bg-gray-50"></div>
          ))}

          {Array.from({ length: lastDay }, (_, i) => i + 1).map((day) => {
            const dayGames = gamesByDate[day] || [];
            const displayGames = dayGames.slice(0, 2);
            const extraCount = dayGames.length - displayGames.length;

            return (
              <div
                key={day}
                className="h-32 rounded-xl border bg-gradient-to-br from-white to-gray-50 p-2 flex flex-col hover:shadow-md transition-shadow">
                <div className="font-bold text-sm text-gray-700">{day}</div>
                <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                  {displayGames.map((g) => (
                    <div
                      key={g.id}
                      className="inline-flex items-center gap-2 text-[12px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium max-w-full truncate"
                      title={g.name}>
                      {g.name}
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <div className="text-[11px] text-gray-400">+{extraCount}...</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 게임 리스트 (3) */}
      <div className="col-span-3 bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">게임 목록</h2>
        {isLoading && <p>불러오는 중...</p>}
        {!isLoading && (
          <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
            {games.map((d: any) => (
              <div
                key={d.id}
                className="flex items-center gap-3 rounded-lg border p-2 hover:shadow-md transition">
                <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={d.image ?? "../../public/file.svg"}
                    alt={d.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.released}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
