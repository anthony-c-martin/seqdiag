import { BOX_PADDING, FONT_SIZE } from '../constants';
import { calcTextLength } from '../helpers';

type EndpointProps = {
  text: string;
  transform: string;
  diagHeight: number;
};

export function Endpoint({ text, transform, diagHeight }: EndpointProps) {
  const headingHeight = FONT_SIZE + BOX_PADDING * 2;
  const width = calcTextLength(text, FONT_SIZE);
  const boxColor = 'lightgrey';

  return (
    <g transform={transform}>
      <rect
        fill={boxColor}
        height={headingHeight}
        width={width + BOX_PADDING * 2}
      />
      <text
        x={BOX_PADDING}
        dy={FONT_SIZE}
        font-size={FONT_SIZE}
        font-family={'monospace'}
        textLength={width}
      >
        {text}
      </text>
      <line
        x1={width / 2}
        x2={width / 2}
        y1={headingHeight}
        y2={diagHeight}
        stroke={boxColor}
        stroke-width={1}
      />
    </g>
  );
}