"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
};

export function InputDataTabs({ tabs }: Props) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const activeTab = tabRefs.current[activeId];
    const indicator = indicatorRef.current;
    const list = listRef.current;
    if (!activeTab || !indicator || !list) return;

    function position() {
      if (!activeTab || !indicator) return;
      indicator.style.width = `${activeTab.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeTab.offsetLeft}px)`;
    }

    position();

    const observer = new ResizeObserver(position);
    observer.observe(list);
    observer.observe(activeTab);
    return () => observer.disconnect();
  }, [activeId]);

  function focusTab(id: string) {
    setActiveId(id);
    tabRefs.current[id]?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeId);
    if (currentIndex === -1) return;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const offset = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + offset + tabs.length) % tabs.length;
      focusTab(tabs[nextIndex].id);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(tabs[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(tabs[tabs.length - 1].id);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={listRef}
        role="tablist"
        aria-label="Input data"
        className="relative flex overflow-x-auto border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              ref={(node) => {
                tabRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={handleKeyDown}
              className={`relative min-h-12 shrink-0 cursor-pointer whitespace-nowrap px-4 text-[0.8125rem] font-medium uppercase tracking-[0.06em] transition-colors duration-200 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-primary transition-[transform,width] duration-300 ease-out"
        />
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-panel`}
          aria-labelledby={`${tab.id}-tab`}
          hidden={tab.id !== activeId}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
