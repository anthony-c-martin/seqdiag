import { Communication, NamedEndpoint, renderSequenceDiagram } from 'seqdiag';

const svgContainer = document.createElement('div');
renderSequenceDiagram(svgContainer, sampleSipCall());

const downloadButton = document.createElement('button');
downloadButton.onclick = () => downloadSvg();
downloadButton.innerText = 'Download';

document.body.appendChild(svgContainer);
document.body.appendChild(downloadButton);

function downloadSvg() {
  const svgData = '<?xml version="1.0" encoding="UTF-8"?>\r\n' + svgContainer.innerHTML;

  const data = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const csvURL = window.URL.createObjectURL(data);
  const tempLink = document.createElement('a');
  tempLink.href = csvURL;
  tempLink.setAttribute('download', `diagram.svg`);
  tempLink.click();
}

function sampleSipCall() {
  const startTime = new Date(2020, 10, 10, 10, 10, 10);
  const timeAt = (index: number) => {
    return new Date(startTime.getTime() + (20 * index));
  };

  const caller: NamedEndpoint = { name: 'Alice' };
  const redirect: NamedEndpoint = { name: 'Redirect Server' };
  const proxy: NamedEndpoint = { name: 'Proxy' };
  const callee: NamedEndpoint = { name: 'Bob' };

  const communications: Communication[] = [];
  const addCommunication = (index: number, source: NamedEndpoint, dest: NamedEndpoint, label: string, isResponse: boolean) => {
    communications.push({
      index,
      timestamp: timeAt(communications.length),
      source,
      dest,
      label,
      isResponse, 
      isFailure: false,
      isTimeout: false,
    });
  };

  addCommunication(0, caller, redirect, 'INVITE', false);
  addCommunication(0, redirect, caller, '302 Moved Temporarily', true);
  addCommunication(1, caller, redirect, 'ACK', false);
  addCommunication(2, caller, proxy, 'INVITE', false);
  addCommunication(3, proxy, callee, 'INVITE', false);
  addCommunication(2, proxy, caller, '100 Trying', true);
  addCommunication(3, callee, proxy, '180 Ringing', true);
  addCommunication(2, proxy, caller, '180 Ringing', true);
  addCommunication(3, callee, proxy, '200 OK', true);
  addCommunication(2, proxy, caller, '200 OK', true);
  addCommunication(4, caller, proxy, 'ACK', false);
  addCommunication(5, proxy, callee, 'ACK', false);
  addCommunication(6, callee, proxy, 'BYE', false);
  addCommunication(7, proxy, caller, 'BYE', false);
  addCommunication(7, caller, proxy, '200 OK', true);
  addCommunication(6, proxy, callee, '200 OK', true);

  return {
    errors: [],
    traces: [],
    options: {
      showErrors: true,
      showTraces: true,
      showTimestampOffset: true,
    },
    requestData: {
      startTime,
      endpoints: [caller, redirect, proxy, callee],
      communications,
    },
  };
}