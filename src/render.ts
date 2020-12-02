import { ComponentChild, render } from "preact";
import { SequenceDiagramProps } from "./components/SequenceDiagram";
import { SequenceDiagram } from "./components/SequenceDiagram";

export function renderSequenceDiagram(container: HTMLElement, props: SequenceDiagramProps) {
  const element = SequenceDiagram(props);
  render(element, container);
}