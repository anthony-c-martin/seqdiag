import React, { useRef } from 'react';
import { SequenceDiagram, NamedEndpoint, RequestData, Message, SequenceDiagramOptions } from 'seqdiag';

const Sample: React.FC = props => {
  const svgRef = useRef<SVGSVGElement>();
  const { errors, traces, options, requestData } = getSampleData();

  const downloadSvg = () => {
    const svgData = '<?xml version="1.0" encoding="UTF-8"?>\r\n' + svgRef.current.outerHTML;
  
    const data = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const csvURL = window.URL.createObjectURL(data);
    const tempLink = document.createElement('a');
    tempLink.href = csvURL;
    tempLink.setAttribute('download', `diagram.svg`);
    tempLink.click();
  }

  return (
    <>
      <SequenceDiagram errors={errors} traces={traces} options={options} requestData={requestData} svgContainerRef={svgRef}/>
      <button onClick={downloadSvg}>Download</button>
    </>
  );
};

export default Sample;

function getSampleData() {
  const startTime = new Date(2020, 10, 10, 10, 10, 10);
  const timeAt = (index: number) => {
    return new Date(startTime.getTime() + (1000 * index));
  };

  const endpointA: NamedEndpoint = {
    name: 'abc',
  };
  const endpointB: NamedEndpoint = {
    name: 'def',
  };
  const endpointC: NamedEndpoint = {
    name: 'ghi',
  };

  const requestData: RequestData = {
    startTime,
    endpoints: [endpointA, endpointB, endpointC],
    communications: [
      {
        index: 0,
        timestamp: timeAt(0),
        source: endpointA,
        dest: endpointB,
        label: 'hello!',
        isResponse: false,
        isFailure: false,
        isTimeout: false,
      },
      {
        index: 0,
        timestamp: timeAt(1),
        source: endpointB,
        dest: endpointA,
        label: 'hello!',
        isResponse: true,
        isFailure: false,
        isTimeout: false,
      },
      {
        index: 1,
        timestamp: timeAt(0.25),
        source: endpointB,
        dest: endpointC,
        label: 'hello!',
        isResponse: false,
        isFailure: false,
        isTimeout: false,
      },
      {
        index: 1,
        timestamp: timeAt(0.75),
        source: endpointC,
        dest: endpointB,
        label: 'hello!',
        isResponse: false,
        isFailure: false,
        isTimeout: false,
      },
      {
        index: 2,
        timestamp: timeAt(0.4),
        source: endpointC,
        dest: endpointC,
        label: 'hello!',
        isResponse: false,
        isFailure: false,
        isTimeout: false,
      },
    ]
  };
  const errors: Message[] = [{
    timestamp: timeAt(0.5),
    message: 'testing!',
  }];
  const traces: Message[] = [];
  const options: SequenceDiagramOptions = {
    showErrors: true,
    showTraces: true,
    showTimestampOffset: true,
  };

  return {
    errors,
    traces,
    options,
    requestData,
  };
}