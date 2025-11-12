import DATAMatrix from '../config/datamatrix';

export const generateDataMatrixDataUrl = (data: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.warn('El entorno actual no soporta la generación de Data Matrix.');
    return '';
  }

  try {
    const svgElement = DATAMatrix({ msg: data });
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const encoded = window.btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (error) {
    console.error('Error generando el código Data Matrix', error);
    return '';
  }
};

