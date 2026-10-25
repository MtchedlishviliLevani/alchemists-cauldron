import type { IIngredient } from '../types/game';
import { el } from './dom';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ICON_BOX = '0 0 48 48';

const INGREDIENT_ART: Record<string, string> = {
  'dragon-tears': `
    <rect class="art__cork" x="20.5" y="3.5" width="7" height="5.5" rx="1"/>
    <path class="art__glass" d="M21 9h6v4.5c3 4.5 9 10.5 9 18.5a12 12 0 0 1-24 0c0-8 6-14 9-18.5z"/>
    <path class="art__main" d="M12.2 30q5.9-2.4 11.8 0t11.8 0a12 12 0 1 1-23.6 0z"/>
    <path class="art__detail" d="M17.5 36q2-2 4 0m3 0q2-2 4 0m-5.5 4q2-2 4 0"/>
    <path class="art__ink" d="M21 9h6v4.5c3 4.5 9 10.5 9 18.5a12 12 0 0 1-24 0c0-8 6-14 9-18.5z"/>
    <path class="art__shine" d="M16.8 26c-1.4 2.6-1.8 5.4-1 8"/>`,
  'fairy-dust': `
    <path class="art__main" d="M18 21l-3-8 5 3 4-6 4 6 5-3-3 8z"/>
    <path class="art__main" d="M15.5 21c-4.5 6-4.5 15 .5 19 4 3.2 12 3.2 16 0 5-4 5-13 .5-19z"/>
    <path class="art__cord" d="M15 21h18"/>
    <circle class="art__speck" cx="20" cy="30" r="1.1"/>
    <circle class="art__speck" cx="27" cy="27" r="0.9"/>
    <circle class="art__speck" cx="25" cy="35" r="1.2"/>
    <circle class="art__speck" cx="30.5" cy="33" r="0.8"/>
    <path class="art__accent" d="M38 5l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1z"/>
    <path class="art__accent" d="M8.5 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>
    <path class="art__accent" d="M41 21l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>`,
  'frost-lotus': `
    <ellipse class="art__pad" cx="24" cy="37" rx="18" ry="5"/>
    <path class="art__main" d="M24 33c-4-5-5-12 0-20 5 8 4 15 0 20z" transform="rotate(-64 24 33)"/>
    <path class="art__main" d="M24 33c-4-5-5-12 0-20 5 8 4 15 0 20z" transform="rotate(64 24 33)"/>
    <path class="art__main" d="M24 33c-4-5-5-12 0-20 5 8 4 15 0 20z" transform="rotate(-32 24 33)"/>
    <path class="art__main" d="M24 33c-4-5-5-12 0-20 5 8 4 15 0 20z" transform="rotate(32 24 33)"/>
    <path class="art__main" d="M24 33c-4.5-5.5-5.5-13 0-22 5.5 9 4.5 16.5 0 22z"/>
    <path class="art__detail" d="M24 30v-12"/>
    <circle class="art__accent" cx="24" cy="32" r="2.2"/>
    <path class="art__frost" d="M8 8v6m-3-3h6M40 6v4m-2-2h4"/>`,
  'mandrake-root': `
    <path class="art__leaf" d="M24 18c-6-2-10-7-10-14 6 2 9 7 10 14z"/>
    <path class="art__leaf" d="M24 18c5-3 10-4 14-2-3 5-8 6-14 2z"/>
    <path class="art__leaf" d="M24 18c0-6 2-11 6-15 2 6 0 11-6 15z"/>
    <path class="art__main" d="M19.5 17c-5 4-6 10-3 15-2 4-4 7-6 10 4-1 7-4 8.5-7 .5 3 1 7 .5 10 2.5-2 3.5-6 3.5-10 2 3 5 5 8 6-1.5-3-3.5-6-4-9.5 3-5 2.5-11-2.5-14.5z"/>
    <circle class="art__eye" cx="21.5" cy="23.5" r="0.9"/>
    <circle class="art__eye" cx="26.5" cy="23.5" r="0.9"/>
    <path class="art__detail" d="M22.5 27.5q1.5 1 3 0M16 33l-3 .5M29 31l3 .5"/>`,
  'caustic-acid': `
    <path class="art__glass" d="M21.5 6.5v11.5l-10 19.5c-1.2 2.6.5 4.5 3 4.5h19c2.5 0 4.2-1.9 3-4.5l-10-19.5v-11.5z"/>
    <path class="art__main" d="M15.9 29q4-2 8 0t8.2 0l4.4 8.5c1.2 2.6-.5 4.5-3 4.5h-19c-2.5 0-4.2-1.9-3-4.5z"/>
    <circle class="art__bubble" cx="20" cy="36" r="1.6"/>
    <circle class="art__bubble" cx="27.5" cy="33.5" r="1.1"/>
    <circle class="art__bubble" cx="24.5" cy="39" r="1"/>
    <circle class="art__bubble" cx="25" cy="22" r="1.2"/>
    <circle class="art__bubble" cx="23" cy="15" r="0.8"/>
    <path class="art__ink" d="M21.5 6.5v11.5l-10 19.5c-1.2 2.6.5 4.5 3 4.5h19c2.5 0 4.2-1.9 3-4.5l-10-19.5v-11.5z"/>
    <rect class="art__cork" x="19.5" y="4" width="9" height="3" rx="1"/>
    <path class="art__shine" d="M17.5 30l-3.5 6.5"/>`,
  'essence-of-the-void': `
    <ellipse class="art__ring" cx="24" cy="24" rx="20" ry="6" transform="rotate(-18 24 24)"/>
    <circle class="art__main" cx="24" cy="24" r="11"/>
    <path class="art__glow" d="M17.5 20a8 8 0 0 1 6-5"/>
    <path class="art__ring" d="M4 24a20 6 0 0 0 40 0" transform="rotate(-18 24 24)"/>
    <path class="art__accent" d="M8 8l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>
    <path class="art__accent" d="M40 37l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>`,
  'phoenix-feather': `
    <path class="art__main" d="M13 40c-2-10 2-22 12-30 5-4 10-5 12-5 0 3-1 8-5 13-7 9-13 15-19 22z"/>
    <path class="art__accent" d="M17 34c1-8 5-15 12-21 3-2 5-3 6-3-1 3-3 6-6 10-4 6-8 10-12 14z"/>
    <path class="art__ink" d="M10 44c6-9 14-21 25-36"/>
    <path class="art__detail" d="M19.5 28.5l-4.5 1m8.5-6.5-4.5.3m8.5-6-4 -.6"/>`,
  'toad-slime': `
    <path class="art__glass" d="M15 15.5h18v22.5c0 3-2 5-5 5h-8c-3 0-5-2-5-5z"/>
    <path class="art__main" d="M15 24c3-1.5 6 1.5 9 0s6-1.5 9 0v14c0 3-2 5-5 5h-8c-3 0-5-2-5-5z"/>
    <circle class="art__bubble" cx="20" cy="32" r="1.6"/>
    <circle class="art__bubble" cx="27" cy="36" r="1.1"/>
    <circle class="art__bubble" cx="24.5" cy="28.5" r="0.9"/>
    <path class="art__ink" d="M15 15.5h18v22.5c0 3-2 5-5 5h-8c-3 0-5-2-5-5z"/>
    <rect class="art__cork" x="13" y="10" width="22" height="5.5" rx="1.5"/>
    <path class="art__main" d="M26 15.5c0 2 .5 4.5 1.8 6.5 1.3-2 1.2-4.5 1.2-6.5z"/>
    <path class="art__shine" d="M18.5 19v4"/>`,
};

const CAULDRON_ART = `
  <g class="cauldron-art__fire">
    <path class="cauldron-art__log" d="M72 198l96 8M72 206l96-8"/>
    <path class="cauldron-art__flame cauldron-art__flame--1" d="M98 200c-9-8-7-20 2-28 0 7 6 9 6 17 0 6-3 9-8 11z"/>
    <path class="cauldron-art__flame cauldron-art__flame--2" d="M120 202c-11-9-9-25 2-36 0 9 8 12 8 22 0 8-4 12-10 14z"/>
    <path class="cauldron-art__flame cauldron-art__flame--3" d="M140 200c-8-7-6-18 2-25 0 6 5 8 5 15 0 5-3 8-7 10z"/>
  </g>
  <path class="cauldron-art__leg" d="M68 154l-12 34h14l12-28z"/>
  <path class="cauldron-art__leg" d="M172 154l12 34h-14l-12-28z"/>
  <circle class="cauldron-art__ear" cx="28" cy="84" r="10"/>
  <circle class="cauldron-art__ear" cx="212" cy="84" r="10"/>
  <ellipse class="cauldron-art__inside" cx="120" cy="60" rx="86" ry="18"/>
  <g class="cauldron-art__brew">
    <ellipse class="cauldron-art__liquid cauldron-art__liquid--back" cx="120" cy="64" rx="80" ry="13"/>
    <ellipse class="cauldron-art__liquid cauldron-art__liquid--front" cx="120" cy="68" rx="66" ry="9"/>
  </g>
  <path class="cauldron-art__body" d="M34 60a86 18 0 0 0 172 0c6 50-14 108-86 108S28 110 34 60z"/>
  <path class="cauldron-art__sheen" d="M56 86c-4 22 4 44 22 60"/>
  <path class="cauldron-art__band" d="M38 104c42 18 122 18 164 0"/>
  <ellipse class="cauldron-art__rim" cx="120" cy="60" rx="88" ry="19"/>
  <path class="cauldron-art__rim-shine" d="M62 46c30-8 86-8 116 0"/>`;

const HEART_ART = `
  <path class="heart__shape" d="M12 20.5s-8-5.3-8-10.8a4.4 4.4 0 0 1 8-2.6 4.4 4.4 0 0 1 8 2.6c0 5.5-8 10.8-8 10.8z"/>
  <path class="heart__crack" d="M12 7.4l-1.6 4 2.6 2-1.8 4.2"/>`;

const SPARKLE_ART = `
  <path class="sparkle__ray" d="M32 2l5 25 25 5-25 5-5 25-5-25-25-5 25-5z"/>
  <path class="sparkle__ray sparkle__ray--small" d="M32 14l2.5 15.5 15.5 2.5-15.5 2.5-2.5 15.5-2.5-15.5-15.5-2.5 15.5-2.5z" transform="rotate(45 32 32)"/>`;

const SMOKE_ART = `
  <circle class="smoke__puff" cx="22" cy="38" r="14"/>
  <circle class="smoke__puff" cx="40" cy="34" r="16"/>
  <circle class="smoke__puff" cx="32" cy="22" r="13"/>
  <path class="smoke__spark" d="M12 12l6 6M52 10l-6 7M54 50l-7-5M10 52l7-6"/>`;

function svg(markup: string, viewBox: string, className: string): SVGSVGElement {
  const node = document.createElementNS(SVG_NS, 'svg');
  node.setAttribute('viewBox', viewBox);
  node.setAttribute('class', className);
  node.setAttribute('aria-hidden', 'true');
  node.setAttribute('focusable', 'false');
  node.innerHTML = markup.replace(/>\s+</g, '><').trim();
  return node;
}

export function IngredientArt(ingredient: IIngredient): Element {
  const markup = INGREDIENT_ART[ingredient.id];
  if (markup === undefined) {
    return el('span', {
      className: 'art art--text',
      attrs: { 'aria-hidden': 'true' },
      text: ingredient.icon,
    });
  }
  return svg(markup, ICON_BOX, `art art--${ingredient.id}`);
}

export function CauldronArt(): SVGSVGElement {
  return svg(CAULDRON_ART, '0 0 240 210', 'cauldron-art');
}

export function HeartArt(): SVGSVGElement {
  return svg(HEART_ART, '0 0 24 24', 'heart');
}

export function SparkleArt(): SVGSVGElement {
  return svg(SPARKLE_ART, '0 0 64 64', 'sparkle');
}

export function SmokeArt(): SVGSVGElement {
  return svg(SMOKE_ART, '0 0 64 64', 'smoke');
}
