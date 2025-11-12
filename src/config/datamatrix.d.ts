export interface DATAMatrixOptions {
  msg?: string;
  rct?: boolean;
  pal?: string[];
  dim?: number;
  pad?: number;
  vrb?: boolean;
}

declare function DATAMatrix(options: string | DATAMatrixOptions): SVGSVGElement;

export default DATAMatrix;


