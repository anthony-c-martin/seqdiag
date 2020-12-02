import React from 'react';
import { renderSequenceDiagram, SequenceDiagramProps } from 'seqdiag';

export class SequenceDiagramContainer extends React.Component<{data: SequenceDiagramProps}, {}> {
  containerRef: React.RefObject<HTMLDivElement>;
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    renderSequenceDiagram(this.containerRef.current, this.props.data);
  }

  downloadSvg() {
    const svgData = '<?xml version="1.0" encoding="UTF-8"?>\r\n' + this.containerRef.current.innerHTML;
  
    const data = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `diagram.svg`);
    tempLink.click();
  }

  render() {
    return (
      <>
        <div ref={this.containerRef}></div>
        <button onClick={this.downloadSvg.bind(this)}>Download</button>
      </>
    );
  }
}