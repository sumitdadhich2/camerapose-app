import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

/**
 * Local SVG Pose Outline Registry
 *
 * Every outline is a hand-authored, scalable vector body silhouette drawn
 * with `react-native-svg`. Outlines are pure line art (transparent fill,
 * stroked path) so they render crisply above the live camera preview at
 * any size with zero pixelation.
 *
 * To add a new pose outline: draw the path, register a component below,
 * and add its key to `SVG_OUTLINES`. Pose JSON templates reference an
 * outline purely by string key (`svgOutline`), so 10,000+ templates can
 * share a much smaller set of outline vectors — keeping the bundle light.
 */

export type SvgOutlineProps = {
  width: number;
  height: number;
  color: string;
};

const STROKE_WIDTH = 1.5;

export const StandingOutline: React.FC<SvgOutlineProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} viewBox="0 0 200 400" fill="none">
    <Circle cx="100" cy="45" r="30" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M100 75 L100 220 M100 100 L55 170 M100 100 L145 170 M100 220 L70 340 M100 220 L130 340 M65 345 L80 345 M120 345 L135 345"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M100 100 C70 105 60 140 55 170 M100 100 C130 105 140 140 145 170"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
    />
  </Svg>
);

export const WalkingOutline: React.FC<SvgOutlineProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} viewBox="0 0 200 400" fill="none">
    <Circle cx="95" cy="45" r="28" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M95 73 L100 210 M100 95 L60 150 M100 95 L150 130 M100 210 L60 330 M100 210 L150 300 M50 335 L75 335 M135 305 L165 305"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HugOutline: React.FC<SvgOutlineProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} viewBox="0 0 260 400" fill="none">
    <Circle cx="90" cy="50" r="27" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Circle cx="170" cy="50" r="27" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M90 77 L95 220 M170 77 L165 220 M95 220 L75 340 M95 220 L115 340 M165 220 L145 340 M165 220 L185 340"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M95 110 C120 130 140 130 165 110 M95 170 C120 190 140 190 165 170"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
    />
  </Svg>
);

export const JumpOutline: React.FC<SvgOutlineProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} viewBox="0 0 320 300" fill="none">
    <Circle cx="70" cy="55" r="24" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M70 79 L70 170 M70 100 L35 70 M70 100 L105 70 M70 170 L40 230 M70 170 L100 230"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="240" cy="55" r="24" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M240 79 L240 170 M240 100 L205 70 M240 100 L275 70 M240 170 L210 230 M240 170 L270 230"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DefaultOutline: React.FC<SvgOutlineProps> = ({ width, height, color }) => (
  <Svg width={width} height={height} viewBox="0 0 200 400" fill="none">
    <Circle cx="100" cy="50" r="30" stroke={color} strokeWidth={STROKE_WIDTH} />
    <Path
      d="M100 80 L100 230 M100 105 L55 180 M100 105 L145 180 M100 230 L70 350 M100 230 L130 350"
      stroke={color}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Ellipse cx="100" cy="155" rx="45" ry="6" stroke={color} strokeWidth={1.5} opacity={0.4} />
  </Svg>
);

export const SVG_OUTLINES: Record<string, React.FC<SvgOutlineProps>> = {
  standing: StandingOutline,
  walking: WalkingOutline,
  hug: HugOutline,
  jump: JumpOutline,
  placeholder: DefaultOutline,
};

export function getSvgOutline(key: string): React.FC<SvgOutlineProps> {
  return SVG_OUTLINES[key] ?? DefaultOutline;
}
