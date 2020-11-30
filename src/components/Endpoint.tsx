import React from 'react';
import { BOX_PADDING, FONT_SIZE } from '../constants';
import { calcTextLength } from '../helpers';

interface EndpointProps {
  text: string;
  transform: string;
  diagHeight: number;
}

export const Endpoint: React.FC<EndpointProps> = (props) => {
  const { text, transform, diagHeight } = props;

  const headingHeight = FONT_SIZE + BOX_PADDING * 2;
  const width = calcTextLength(text, FONT_SIZE);
  const boxColor = 'lightgrey'

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
        fontSize={FONT_SIZE}
        fontFamily={'monospace'}
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
        strokeWidth={1}
      />
    </g>
  );
};