"use client";

import { useApi } from "@/lib/useApi";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Calendar() {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1); // 1~12
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // 연월 문자열: "2025-01"
  const yearMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games", yearMonth],
    queryFn: async () => {
      const { success, data } = await useApi.get(`/games/${yearMonth}`);
      return success ? data : [];
    },
    staleTime: Infinity, // 한 번 받아오면 페이지 머무는 동안 캐시만 사용
    gcTime: Infinity, // 캐시를 지우지 않음
    refetchOnWindowFocus: false, // 탭 전환 시 자동 fetch 방지
    refetchOnReconnect: false, // 네트워크 재연결 시 fetch 방지
  });
  //데이터가 바뀌면 백엔드에서 알려주고 이걸 호출해야한다함.
  //  queryClient.invalidateQueries(["games", yearMonth]);

  const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();

  // 날짜별 게임 매핑
  const gamesByDate: Record<number, any[]> = {};
  games.forEach((g: any) => {
    const released = new Date(g.released);
    if (released.getFullYear() === selectedYear && released.getMonth() + 1 === selectedMonth) {
      const day = released.getDate();
      if (!gamesByDate[day]) gamesByDate[day] = [];
      gamesByDate[day].push(g);
    }
  });
  const filteredGames = selectedDay
    ? games.filter((g: any) => {
        const released = new Date(g.released);
        return (
          released.getFullYear() === selectedYear &&
          released.getMonth() + 1 === selectedMonth &&
          released.getDate() === selectedDay
        );
      })
    : games;
  const onChangeMonth = (month: number) => {
    setSelectedDay(null);
    setSelectedMonth(month);
  };
  return (
    <div className="px-8">
      {/* 연도/월 선택 */}
      <div className="py-4 grid grid-cols-12 items-center gap-6">
        <div className="col-span-8 bg-white rounded-2xl shadow-lg ">
          <div className="grid  grid-cols-7 text-center font-semibold text-gray-600 ">
            <div className="col-span-1">
              <p className="font-semibold text-gray-800 text-3xl">{selectedYear}년</p>
            </div>
            <div className="col-span-6">
              <div className="flex">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <div
                    key={month}
                    onClick={() => onChangeMonth(month)}
                    className={`py-1 flex-1 rounded-lg font-semibold text-lg text-center ${
                      month === selectedMonth ? "bg-blue-300 text-white" : "text-gray-800"
                    }`}>
                    {month}월
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4 bg-white rounded-2xl shadow-lg ">
          <div className="">리스트 보기</div>
        </div>
      </div>

      <div className="py-4 grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-white rounded-2xl shadow-lg">
          {/* 요일 헤더 */}
          <div className="mb-6 grid grid-cols-7 text-center font-semibold text-gray-600 ">
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
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  className={`h-32 
                    rounded-xl border p-2 
                    flex flex-col cursor-pointer transition 
    ${selectedDay === day ? "ring-2 ring-blue-400" : "bg-gradient-to-br from-white to-gray-50"}
  `}>
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

        <div className="col-span-4 bg-white rounded-2xl shadow-lg">
          <div className="mb-4 flex items-center gap-4">
            <p className="text-lg font-bold ">게임 목록</p>
            <p>정렬 아이콘 added, date 등</p>
          </div>
          {isLoading && <p>불러오는 중...</p>}
          {!isLoading && (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2">
              {filteredGames.map((d: any) => (
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
    </div>
  );
}
