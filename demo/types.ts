import { VirtualItem } from "@tanstack/react-virtual";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PageViewport } from "pdfjs-dist//types/src/display/display_utils";

export interface PageChangeEvent {
  currentPage: number;
  doc: PDFDocumentProxy;
}

export interface ReaderProps {
  file: string;
  initialScale?: number;
  rotation?: number;
  onPageChange?: (e: PageChangeEvent) => void;
  setReaderAPI?: (readerAPI: ReaderAPI) => void;
  renderPage?: RenderPage;
}

export interface ReaderAPI {
  jumpToPage: (pageIndex: number) => void;
  jumpToHighlightArea: (area: HighlightArea) => void;
  jumpToOffset: (offset: number) => void;
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
  viewports: Array<PageViewport>;
  scale: number | undefined;
  rotation: number;
  pageObserver: IntersectionObserver | undefined;
  shouldRender: boolean;
  renderPage?: RenderPage;
}
