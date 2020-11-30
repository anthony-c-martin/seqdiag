import { FONT_SIZE } from "./constants";
import { Communication, RequestData } from "./types";

export function calcTextLength(text: string, fontSize: number) {
  return (text.length * 8 * fontSize) / FONT_SIZE;
}

export function truncate(input: string, length: number) {
  if (input.length < length) {
    return input;
  }

  return input.substr(0, length - 1) + '…';
}

export function wrapText(input: string, length: number) {
  const maxWordLength = 20;
  const output = [];

  let maxLines = 10;
  while (input.length > 0 && --maxLines > 0) {
    const nextBreak = input.indexOf(' ', length);
    if (nextBreak > -1 && nextBreak < length + maxWordLength) {
      output.push(input.substr(0, nextBreak));
      input = input.substr(nextBreak + 1);
    } else {
      const line = input.substr(0, length);
      output.push(line);
      input = input.substr(line.length);
    }
  }

  if (input.length > 0) {
    output.push(truncate(input, length));
  }
  
  return output;
}

export function formatTimestamp(timestamp: Date, startTime: Date, showTimestampOffset: boolean) {
  if (!showTimestampOffset) {
    const date = timestamp.toISOString().substr(0, 10);
    const time = timestamp.toISOString().substr(11);
    return `${date} ${time}`;
  }

  const offsetMs = timestamp.getTime() - startTime.getTime();
  return `${offsetMs.toLocaleString()}ms`;
}

export function orderCommunications(communications: Communication[])
{
  // if timestamps exactly equal, order lower-index requests first, then higher-index responses - e.g. so you end up with ordering like req1, req2 resp2, resp1
  return communications.sort((a, b) => {
    if (a.timestamp !== b.timestamp)
    {
      return a.timestamp.getTime() - b.timestamp.getTime();
    }
    if (a.index !== b.index)
    {
      return a.index - b.index;
    }

    return (a.isResponse ? 1 : 0) - (b.isResponse ? 1 : 0);
  });
}