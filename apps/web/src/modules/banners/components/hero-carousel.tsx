"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button, cn } from "@feri/ui";
import type { BannerTone } from "@feri/database";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  tone: BannerTone;
};

type ToneStyle = {
  surface: string;
  subtitle: string;
  ctaVariant: "accent" | "primary";
};

const AUTO_ADVANCE_INTERVAL_MS = 6000;
const FIRST_SLIDE_INDEX = 0;
const NEXT_SLIDE_STEP = 1;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const TONE_STYLES: Record<BannerTone, ToneStyle> = {
  UMBER: { surface: "bg-primary text-white", subtitle: "text-white/85", ctaVariant: "accent" },
  CLAY: { surface: "bg-accent text-ink", subtitle: "text-ink/80", ctaVariant: "primary" },
  INK: { surface: "bg-ink text-white", subtitle: "text-white/85", ctaVariant: "accent" },
  TAUPE: { surface: "bg-taupe text-ink", subtitle: "text-ink/80", ctaVariant: "primary" },
};

const subscribeToReducedMotion = (onChange: () => void): (() => void) => {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

const readReducedMotionPreference = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches;

const useReducedMotionPreference = (): boolean =>
  useSyncExternalStore(subscribeToReducedMotion, readReducedMotionPreference, () => false);

export const HeroCarousel = ({ slides }: { slides: readonly HeroSlide[] }) => {
  const [activeIndex, setActiveIndex] = useState(FIRST_SLIDE_INDEX);
  const [isHoldingPosition, setIsHoldingPosition] = useState(false);
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();

  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > NEXT_SLIDE_STEP;
  const isAutoAdvancing =
    hasMultipleSlides && !isHoldingPosition && !isPausedByUser && !prefersReducedMotion;

  useEffect(() => {
    if (!isAutoAdvancing) {
      return;
    }
    const timerId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + NEXT_SLIDE_STEP) % slideCount);
    }, AUTO_ADVANCE_INTERVAL_MS);
    return () => window.clearInterval(timerId);
  }, [isAutoAdvancing, slideCount]);

  if (slideCount === 0) {
    return null;
  }

  const goToSlide = (index: number): void => {
    setActiveIndex((index + slideCount) % slideCount);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured offers"
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsHoldingPosition(true)}
      onMouseLeave={() => setIsHoldingPosition(false)}
      onFocus={() => setIsHoldingPosition(true)}
      onBlur={() => setIsHoldingPosition(false)}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        aria-live={isAutoAdvancing ? "off" : "polite"}
      >
        {slides.map((slide, index) => {
          const toneStyle = TONE_STYLES[slide.tone];
          const isActive = index === activeIndex;
          return (
            <article
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${slideCount}`}
              aria-hidden={!isActive}
              inert={!isActive}
              className={cn(
                "flex min-h-64 w-full shrink-0 flex-col justify-center gap-4 px-6 py-10 sm:min-h-72 sm:px-12",
                toneStyle.surface,
              )}
            >
              <h2 className="max-w-xl text-3xl leading-tight text-inherit sm:text-4xl">
                {slide.title}
              </h2>
              {slide.subtitle ? (
                <p className={cn("max-w-lg text-base sm:text-lg", toneStyle.subtitle)}>
                  {slide.subtitle}
                </p>
              ) : null}
              {slide.ctaLabel && slide.ctaHref ? (
                <div className="pt-2">
                  <Button asChild variant={toneStyle.ctaVariant} size="lg">
                    <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {hasMultipleSlides ? (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  "h-2 rounded-full bg-white/60 transition-all hover:bg-white",
                  index === activeIndex ? "w-6 bg-white" : "w-2",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsPausedByUser((isPaused) => !isPaused)}
              aria-label={isPausedByUser ? "Resume slideshow" : "Pause slideshow"}
              className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-ink hover:bg-surface"
            >
              {isPausedByUser ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex - NEXT_SLIDE_STEP)}
              aria-label="Previous slide"
              className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-ink hover:bg-surface"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(activeIndex + NEXT_SLIDE_STEP)}
              aria-label="Next slide"
              className="flex size-9 items-center justify-center rounded-full bg-surface/90 text-ink hover:bg-surface"
            >
              <ChevronRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
