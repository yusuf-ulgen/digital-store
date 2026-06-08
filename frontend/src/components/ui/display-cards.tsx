"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
  href?: string;
  isActive?: boolean;
  isAnyActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const HOVER_MAP: Record<string, string> = {
  "hover:-translate-y-[64px]": "group-hover:-translate-y-[64px]",
  "hover:-translate-y-10": "group-hover:-translate-y-10",
  "hover:-translate-y-1": "group-hover:-translate-y-1",
  "hover:translate-y-10": "group-hover:translate-y-10",
  "hover:!opacity-100": "group-hover:!opacity-100",
};

import { useState, useEffect } from "react";

function DisplayCard({
  className,
  icon = <Sparkles className="size-4 text-blue-300" />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-blue-500",
  titleClassName = "text-blue-500",
  href,
  isActive,
  isAnyActive,
  onMouseEnter,
  onMouseLeave,
}: DisplayCardProps) {
  const content = (
    <div className="relative z-10 flex flex-col justify-between h-full w-full [&>*]:flex [&>*]:items-center [&>*]:gap-2.5">
      <div className="flex items-center gap-2.5">
        <span className={cn("relative inline-flex items-center justify-center rounded-full bg-stone-950 border border-stone-850 w-8 h-8 sm:w-10 sm:h-10 text-sm sm:text-base shadow-inner", iconClassName)}>
          {icon}
        </span>
        <p className={cn("text-sm sm:text-base font-bold tracking-tight", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-nowrap text-base sm:text-xl text-white font-bold tracking-tight">{description}</p>
      <p className="text-stone-400 text-[10px] sm:text-xs font-semibold">{date}</p>
    </div>
  );

  const classes = className ? className.split(" ") : [];

  // Positioning classes that go to the wrapper
  const wrapperClassesList = classes.filter(c => 
    c.startsWith("[grid-area:") ||
    c.startsWith("translate-x-") ||
    c.startsWith("sm:translate-x-") ||
    c.startsWith("translate-y-") ||
    c.startsWith("sm:translate-y-") ||
    c.startsWith("z-") ||
    c === "hover:z-[100]" ||
    c === "hover:z-[10]"
  );

  // Styling and hover animation classes that go to the inner card
  const cardClassesList = classes.filter(c => 
    !wrapperClassesList.includes(c)
  ).map(c => {
    if (c.startsWith("hover:")) {
      const mapped = HOVER_MAP[c];
      if (mapped) return mapped;
      return c.replace("hover:", "group-hover:");
    }
    return c;
  });

  const activeTranslateClasses = cardClassesList
    .filter(c => c.startsWith("group-hover:-translate") || c.startsWith("group-hover:translate"))
    .map(c => c.replace("group-hover:", ""));

  const activeClasses = [];
  if (isActive) {
    activeClasses.push(...activeTranslateClasses);
    activeClasses.push("!opacity-100");
  } else if (isAnyActive) {
    activeClasses.push("!opacity-50");
  }

  const cardClasses = cn(
    "relative flex h-full w-full select-none flex-col justify-between rounded-xl border border-stone-750 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-950 px-4 py-3 sm:px-6 sm:py-5 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl z-10 pointer-events-auto transform translate-y-0 translate-x-0",
    "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-stone-950 after:to-transparent after:content-['']",
    "hover:border-stone-400 hover:from-stone-750 hover:to-stone-850 cursor-pointer hover:shadow-stone-950/65 hover:shadow-2xl",
    cardClassesList.join(" "),
    activeClasses.join(" ")
  );

  const wrapperClasses = cn(
    "group relative w-[85vw] sm:w-[28rem] h-36 sm:h-44 -skew-y-[8deg] pointer-events-auto transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
    wrapperClassesList.join(" "),
    isActive && "!z-[100]"
  );

  if (href) {
    return (
      <div 
        className={wrapperClasses}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Link href={href} className={cardClasses}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div 
      className={wrapperClasses}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={cardClasses}>
        {content}
      </div>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      className: "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      className: "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Auto-cycle effect
  useEffect(() => {
    if (hoveredIndex !== null) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % displayCards.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [hoveredIndex, displayCards.length]);

  const effectiveActiveIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const isAnyActive = effectiveActiveIndex !== null;

  return (
    <div className="group/stack grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard 
          key={index} 
          {...cardProps} 
          isActive={effectiveActiveIndex === index}
          isAnyActive={isAnyActive}
          onMouseEnter={() => {
            setHoveredIndex(index);
            setActiveIndex(null);
          }}
          onMouseLeave={() => {
            setHoveredIndex(null);
          }}
        />
      ))}
    </div>
  );
}

export { DisplayCard };
export type { DisplayCardProps, DisplayCardsProps };
