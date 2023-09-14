// globals.d.ts
declare module '*.css' {
    const content: { [className: string]: string };
    export default content;
  }
  declare namespace JSX {
    interface IntrinsicElements {
        div: React.HTMLProps<HTMLDivElement>;
        h1: React.HTMLProps<HTMLDivElement>;
        html: React.HTMLProps<HTMLDivElement>;
        body: React.HTMLProps<HTMLDivElement>;
    }
}