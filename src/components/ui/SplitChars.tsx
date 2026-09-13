interface SplitCharsProps {
  text: string;
}

/**
 * Character spans for per-char stagger animations.
 *
 * Shared by SplitTextHeadline and ChapterCard. Spaces become non-breaking so
 * words never collapse. No permanent `will-change` on the chars (FALHA-06):
 * the browser promotes layers by heuristics while the transform runs — a
 * permanent hint on ~143 small spans only costs compositor memory.
 */
export function SplitChars({ text }: SplitCharsProps) {
  return (
    <>
      {text.split('').map((char, i) => (
        <span key={i} className="char inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </>
  );
}
