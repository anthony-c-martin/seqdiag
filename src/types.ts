export interface Message {
  timestamp: Date,
  message: string,
}

export interface NamedEndpoint {
  name: string,
}

export interface Communication {
  index: number,
  timestamp: Date,
  source: NamedEndpoint,
  dest: NamedEndpoint,
  label: string,
  isResponse: boolean,
  isFailure: boolean,
  isTimeout: boolean,
}

export interface RequestData {
  startTime: Date,
  endpoints: NamedEndpoint[],
  communications: Communication[],
}

export interface SequenceDiagramOptions {
  showErrors: boolean,
  showTraces: boolean,
  showTimestampOffset: boolean,
}