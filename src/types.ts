import { VirtualItem } from "@tanstack/react-virtual";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PageViewport } from "pdfjs-dist//types/src/display/display_utils";

export interface PageChangeEvent {
  currentPage: number;
  doc: PDFDocumentProxy;
}

export interface Classes {
  pagesContainer?: string;
  pageOuterBox?: string;
  pageInnerBox?: string;
  pageWrapper?: string;
}

export interface ReaderProps {
  file: string;
  initialScale?: number;
  initialRotation?: number;
  onPageChange?: (e: PageChangeEvent) => void;
  onDocumentLoad?: () => void;
  setReaderAPI?: (readerAPI: ReaderAPI) => void;
  renderPage?: RenderPage;
  classes?: Classes;
}

export interface ReaderAPI {
  jumpToPage: (pageIndex: number) => void;
  jumpToHighlightArea: (area: HighlightArea) => void;
  jumpToOffset: (offset: number) => void;
  increaseZoom: () => void;
  decreaseZoom: () => void;
  zoomDefault: () => void;
  rotateClockwise: () => void;
  rotateCounterClockwise: () => void;
  scale: number | undefined;
  rotation: number;
}

// height, left, top, width are 0-100% values
export interface HighlightArea {
  height: number;
  left: number;
  top: number;
  width: number;
  pageIndex: number;
}

export interface RenderPageProps {
  pageIndex: number;
  scale: number;
  rotate: number;
}

export type RenderPage = (props: RenderPageProps) => React.ReactNode;

export interface ReaderPageProps {
  virtualItem: VirtualItem;
  viewports: Array<PageViewport> | null;
  scale: number | undefined;
  rotation: number;
  pageObserver: IntersectionObserver | undefined;
  shouldRender: boolean;
  renderPage?: RenderPage;
  classes?: Classes;
}
