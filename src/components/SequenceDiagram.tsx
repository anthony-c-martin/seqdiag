import React, { Fragment, RefObject } from 'react';
import { Message, RequestData, Communication, SequenceDiagramOptions } from '../types';
import { ARROW_SPACING, BOX_MARGIN, BOX_PADDING, FONT_SIZE, FONT_SIZE_LABEL, MAX_LABEL_LEGNTH, SVG_PADDING } from '../constants';
import { calcTextLength, formatTimestamp, orderCommunications, truncate, wrapText } from '../helpers';
import { Endpoint } from './Endpoint';

interface BoundedElement {
  height: number;
  width: number;
  content: JSX.Element;
}

interface TimedBoundedElement extends BoundedElement {
  timestamp: Date;
}

interface DiagramContext {
  height: number;
  width: number;
  marginX: number;
  marginY: number;
}

interface SequenceDiagramProps {
  traces: Message[];
  errors: Message[];
  options: SequenceDiagramOptions;
  requestData: RequestData;
  svgContainerRef?: RefObject<SVGSVGElement>
}

function renderTiming(element: TimedBoundedElement, requestData: RequestData, options: SequenceDiagramOptions): BoundedElement {
  const timestampString = formatTimestamp(element.timestamp, requestData.startTime, options.showTimestampOffset);
  const content = (
    <Fragment>
      <text
        dy={FONT_SIZE_LABEL}
        fontSize={FONT_SIZE_LABEL}
        fontFamily="monospace"
        fill="blue"
      >
        {timestampString}
      </text>
    </Fragment>
  );

  return {
    height: FONT_SIZE_LABEL,
    width: calcTextLength(timestampString, FONT_SIZE_LABEL),
    content,
  }
}

function renderRequestLine(centers: { [endpoint: string]: number }, comm: Communication, options: SequenceDiagramOptions, context: DiagramContext): TimedBoundedElement {
  const sourceX = centers[comm.source.name];
  const destX = centers[comm.dest.name];

  const color = comm.isFailure ? 'red' : 'black';
  const isLoopback = comm.source.name === comm.dest.name;

  const dashArray = comm.isResponse ? '5 5' : undefined;

  let arrow;
  if (!isLoopback) {
    arrow = (
      <line
        x1={sourceX}
        x2={destX}
        y1={ARROW_SPACING}
        y2={ARROW_SPACING}
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
        markerEnd={`url(#end-${color})`}
      />
    );
  } else {
    const height = ARROW_SPACING / 2;
    const curveWidth = ARROW_SPACING * 4;
    arrow = (
      <path
        d={`M ${sourceX},${ARROW_SPACING} C ${sourceX + curveWidth},${ARROW_SPACING - height} ${sourceX +
          curveWidth},${ARROW_SPACING + height + height} ${sourceX},${ARROW_SPACING + height}`}
        fill="transparent"
        stroke={color}
        strokeWidth={1}
        strokeDasharray={dashArray}
        markerEnd={`url(#end-${color})`}
      />
    );
  }

  let timeout = null;
  if (comm.isTimeout) {
    const midpointX = (destX + sourceX) / 2;
    timeout = (
      <Fragment>
        <line x1={midpointX - (FONT_SIZE_LABEL / 2)} x2={midpointX + (FONT_SIZE_LABEL / 2)} y1={ARROW_SPACING - (FONT_SIZE_LABEL / 2)} y2={ARROW_SPACING + (FONT_SIZE_LABEL / 2)} stroke={color} />
        <line x1={midpointX - (FONT_SIZE_LABEL / 2)} x2={midpointX + (FONT_SIZE_LABEL / 2)} y1={ARROW_SPACING + (FONT_SIZE_LABEL / 2)} y2={ARROW_SPACING - (FONT_SIZE_LABEL / 2)} stroke={color} />
      </Fragment>
    )
  }

  const indexText = comm.index.toString();
  const labelText = truncate(comm.label, MAX_LABEL_LEGNTH);
  const indexTextWidth = calcTextLength(indexText, FONT_SIZE_LABEL);
  const descWidth = calcTextLength(labelText, FONT_SIZE_LABEL);
  const width = descWidth + indexTextWidth;

  let arrowDescX = (destX + sourceX - width) / 2;
  if (isLoopback) {
    arrowDescX += ARROW_SPACING * 2;
  }

  // adjust text to fit inside svg
  if (arrowDescX < 0) {
    arrowDescX = 0;
  } else if (arrowDescX + width > context.width) {
    arrowDescX = context.width - width;
  }

  const content = (
    <Fragment>
      <text
        x={arrowDescX}
        dy={FONT_SIZE_LABEL}
        fontSize={FONT_SIZE_LABEL}
        fontFamily={'monospace'}
        fill={color}
        textLength={descWidth}
      >
        {labelText}
      </text>
      <rect
        x={arrowDescX + descWidth + BOX_PADDING}
        height={FONT_SIZE_LABEL + (BOX_PADDING * 2)}
        width={indexTextWidth + (BOX_PADDING * 2)}
        rx={BOX_PADDING}
        fill={'lightblue'}
      />
      <text
        x={arrowDescX + descWidth + (BOX_PADDING * 2)}
        dy={FONT_SIZE_LABEL}
        fontSize={FONT_SIZE_LABEL}
        fontFamily={'monospace'}
        fill={'black'}
        textLength={indexTextWidth}
      >
        {indexText}
      </text>
      {arrow}
      {timeout}
    </Fragment>
  );

  return {
    timestamp: comm.timestamp,
    width,
    height: ARROW_SPACING * 2,
    content,
  };
}

function renderMessageLine(error: Message, color: string): TimedBoundedElement {
  const lines = wrapText(error.message, MAX_LABEL_LEGNTH);
  const longestLine = lines.sort((a, b) => a.length - b.length)[0];
  
  const width = calcTextLength(longestLine, FONT_SIZE_LABEL);
  const content = (
    <Fragment>
      <rect
        fill={color}
        opacity={'75%'}
        y={BOX_PADDING}
        height={lines.length * FONT_SIZE_LABEL + (BOX_PADDING * 2)}
        width={width + BOX_PADDING * 2}
      />
      {lines.map((line, i) => (
        <text
          key={i}
          y={i * FONT_SIZE_LABEL}
          x={BOX_PADDING}
          dy={FONT_SIZE_LABEL + BOX_PADDING}
          fontSize={FONT_SIZE_LABEL}
          fontFamily={'monospace'}
          fill={'black'}
          textLength={calcTextLength(line, FONT_SIZE_LABEL)}
        >
          {line}
        </text>
      ))}
    </Fragment>
  );

  return {
    timestamp: error.timestamp,
    width: width + (BOX_PADDING * 2),
    height: (lines.length * FONT_SIZE_LABEL) + (BOX_PADDING * 2),
    content,
  };
}

export const SequenceDiagram: React.FC<SequenceDiagramProps> = props => {
  if (props.requestData.communications.length === 0) {
    return null;
  }

  const { requestData, errors, traces, options, svgContainerRef } = props;

  const orderedComms = orderCommunications(requestData.communications);
  const lineHeight = ARROW_SPACING * 2;

  // upate context in a series of steps before returning the SVG element - to ensure we calculate the bounding box size in advance.
  const context: DiagramContext = {
    height: 0,
    width: 0,
    marginX: 0,
    marginY: 0,
  };

  const offsets: number[] = [];
  const centers: { [endpoint: string]: number } = {};
  for (let i = 0; i < requestData.endpoints.length; i++) {
    const endpoint = requestData.endpoints[i];
    const textLength = calcTextLength(endpoint.name, FONT_SIZE);

    offsets[i] = context.width;
    centers[endpoint.name] = context.width + textLength / 2;
    context.width += textLength + BOX_PADDING * 2 + BOX_MARGIN * 2;
  }
  context.marginY = lineHeight;

  const renderedLines = [];
  for (const comm of orderedComms) {
    const line = renderRequestLine(centers, comm, options, context);
    context.width = Math.max(context.width, line.width);
    renderedLines.push(line);
  }

  if (options.showErrors) {
    for (const error of errors) {
      const line = renderMessageLine(error, 'orangered');
      context.width = Math.max(context.width, line.width);
      renderedLines.push(line);
    }
  }

  if (options.showTraces) {
    for (const trace of traces) {
      const line = renderMessageLine(trace, 'lightgreen');
      context.width = Math.max(context.width, line.width);
      renderedLines.push(line);
    }
  }

  const sortedRenderedLines = renderedLines.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  const renderedTimestamps = [];
  for (const line of sortedRenderedLines) {
    const timestampBox = renderTiming(line, requestData, options);
    context.marginX = Math.max(context.marginX, timestampBox.width);
    renderedTimestamps.push(timestampBox);
  }

  const timestampElements = [];
  const lineElements = [];

  for (let i = 0; i < renderedTimestamps.length; i++) {
    const timestamp = renderedTimestamps[i];
    const line = sortedRenderedLines[i];

    timestampElements.push(
      <g key={i} transform={`translate(${context.marginX - timestamp.width}, ${context.height + BOX_PADDING})`}>
        {timestamp.content}
      </g>
    );
    lineElements.push(
      <g key={i} transform={`translate(0, ${context.height})`}>
        {line.content}
      </g>
    );

    context.height += Math.max(timestamp.height, line.height) + BOX_PADDING;
  }

  context.marginX += (BOX_PADDING * 4);
  const endpoints = requestData.endpoints.map((endpoint, i) => 
    <Endpoint key={i} text={endpoint.name} transform={`translate(${offsets[i]}, 0)`} diagHeight={context.height + context.marginY} />);

  return (
    <svg
      width={context.marginX + context.width + (SVG_PADDING * 2)}
      height={context.marginY + context.height + (SVG_PADDING * 2)}
      xmlns="http://www.w3.org/2000/svg"
      ref={svgContainerRef}
    >
      <rect
        width={context.marginX + context.width + (SVG_PADDING * 2)}
        height={context.marginY + context.height + (SVG_PADDING * 2)}
        fill={'white'}
      />
      <g transform={`translate(${SVG_PADDING}, ${SVG_PADDING})`}>
        <g key="timings" transform={`translate(0, ${context.marginY})`}>
          {timestampElements}
        </g>
        <g key="endpoints" transform={`translate(${context.marginX}, 0)`}>
          {endpoints}
        </g>
        <g key="lines" transform={`translate(${context.marginX}, ${context.marginY})`}>
          {lineElements}
        </g>
      </g>
      <defs>
        <marker
          id="end-black"
          viewBox="0 -5 10 10"
          refX="10"
          refY="0"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M0,-5L10,0L0,5" fill="black" />
        </marker>
        <marker id="end-red" viewBox="0 -5 10 10" refX="10" refY="0" markerWidth="10" markerHeight="10" orient="auto">
          <path d="M0,-5L10,0L0,5" fill="red" />
        </marker>
      </defs>
    </svg>
  );
}