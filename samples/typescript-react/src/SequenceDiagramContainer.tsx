import React, { useEffect, useRef } from 'react';
import { renderSequenceDiagram, SequenceDiagramProps } from 'seqdiag';

type Props = {
  data: SequenceDiagramProps;
}

export const SequenceDiagramContainer: React.FC<Props> = (props) => {
  const containerRef = useRef<HTMLDivElement>();
  const { data } = props;

  // initial render
  useEffect(() => renderSequenceDiagram(containerRef.current, data), []);

  //subsequent renders
  if (containerRef.current) {
    renderSequenceDiagram(containerRef.current, data);
  }

  return (
    <>
      <div ref={containerRef}></div>
      <button onClick={() => downloadSvg(containerRef.current)}>Download</button>
    </>
  );
};

function downloadSvg(container: HTMLDivElement) {
  const svgData = '<?xml version="1.0" encoding="UTF-8"?>\r\n' + container.innerHTML;

  const data = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const csvURL = window.URL.createObjectURL(data);
  const tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', `diagram.svg`);
  tempLink.click();
}