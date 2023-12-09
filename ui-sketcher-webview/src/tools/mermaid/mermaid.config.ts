import { MermaidConfig } from 'mermaid';
import mermaidStyles from "./mermaid.css?raw";

export const mermaidConfig: MermaidConfig = {
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
  themeCSS: mermaidStyles,
  fontFamily: "Fira Code",
}