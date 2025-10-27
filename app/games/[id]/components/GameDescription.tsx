"use client";

import { memo } from "react";

function GameDescription({ html }: { html?: string | null }) {
  if (!html) return null;
  return (
    <section className="mt-6 rounded-2xl p-5">
      <h2 className="text-lg font-semibold mb-2">게임 소개</h2>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

export default memo(GameDescription);
