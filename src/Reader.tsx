import { useState, useRef, useEffect, useCallback } from "react";
import { Document } from "react-pdf";
import { useVirtualizer } from "@tanstack/react-virtual";
import { HighlightArea, ReaderProps } from "./types";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PageViewport } from "pdfjs-dist//types/src/display/display_utils";

import Page from "./Page";
import usePageObserver from "./usePageObserver";
import useVirtualizerVelocity from "./useVirtualizerVelocity";
import { getOffsetForHighlight } from "./util";

const EXTRA_HEIGHT = 10;
const RESERVE_WIDTH = 50;

const determineScale = (parentElement: HTMLElement, width: number): number => {
  const scaleWidth = (parentElement.clientWidth - RESERVE_WIDTH) / width;
  return scaleWidth;
};

const Reader = ({
  file,
  initialScale,
  rotation = 0,
  onPageChange,
  onDocumentLoad,
  setReaderAPI,
  renderPage,
  classes,
}: ReaderProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [viewports, setPageViewports] = useState<Array<PageViewport>>([]);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState<number | undefined>(initialScale);
  const [currentPage, setCurrentPage] = useState<number | null>(null);

  const onDocumentLoadSuccess = async (newPdf: PDFDocumentProxy) => {
    setPdf(newPdf);
    setNumPages(newPdf.numPages);

    // user defined callback
    onDocumentLoad && onDocumentLoad()
  };

  const estimateSize = useCallback(
    (index: number) => {
      if (!viewports) return 0;
      return viewports[index].height + EXTRA_HEIGHT;
    },
    [viewports]
  );

  const virtualizer = useVirtualizer({
    count: numPages || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize,
    overscan: 0,
  });

  const { pageObserver } = usePageObserver({
    parentRef,
    setCurrentPage,
    numPages,
  });

  useEffect(() => {
    const calculateViewports = async () => {
      if (!pdf) return;

      const viewports = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          const viewport = page.getViewport({
            scale: scale as number,
            rotation,
          });
          return viewport;
        })
      );

      setPageViewports(viewports);
    };

    calculateViewports();
  }, [pdf, scale, rotation]);

  useEffect(() => {
    if (!pdf) return;
    if (initialScale) {
      setScale(initialScale);
      return;
    }
    const fetchPageAndSetScale = async () => {
      const firstPage = await pdf.getPage(1);
      const firstViewPort = firstPage.getViewport({ scale: 1, rotation });
      const newScale = determineScale(parentRef.current!, firstViewPort.width);
      setScale(newScale);
    };

    fetchPageAndSetScale();
  }, [pdf, initialScale, rotation]);

  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, viewports]);

  useEffect(() => {
    if (!currentPage) return;
    onPageChange && pdf && onPageChange({ currentPage, doc: pdf });
  }, [currentPage]);

  useEffect(() => {
    if (!setReaderAPI) return;

    const jumpToPage = (pageIndex: number) => {
      virtualizer.scrollToIndex(pageIndex, {
        align: "start",
        behavior: "smooth",
      });
    };

    const jumpToOffset = (offset: number) => {
      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    const jumpToHighlightArea = (area: HighlightArea) => {
      const startOffset = virtualizer.getOffsetForIndex(
        area.pageIndex,
        "start"
      )[0];
      const itemHeight = estimateSize(area.pageIndex);
      const offset = getOffsetForHighlight({
        ...area,
        rotation,
        itemHeight: itemHeight - 10, // accounts for padding top and bottom
        startOffset: startOffset - 5, // accounts for padding on top
      });

      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    setReaderAPI({
      jumpToPage,
      jumpToHighlightArea,
      jumpToOffset,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewports]);

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
    estimateSize,
  });
  const isScrollingFast = Math.abs(normalizedVelocity) > 1;
  const shouldRender = !isScrollingFast;

  return (
    <div
      id="reader-parent"
      ref={parentRef}
      style={{
        height: "100%",
        overflow: "auto",
        width: "100%",
      }}
    >
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        <div
          id="pages-container"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
          className={classes?.pagesContainer}
        >
          {pdf ? (
            virtualizer
              .getVirtualItems()
              .map((virtualItem) => (
                <Page
                  key={virtualItem.key}
                  virtualItem={virtualItem}
                  viewports={viewports}
                  scale={scale}
                  rotation={rotation}
                  pageObserver={pageObserver}
                  shouldRender={shouldRender}
                  renderPage={renderPage}
                  classes={classes}
                />
              ))
          ) : (
            <div />
          )}
        </div>
      </Document>
    </div>
  );
};
export default Reader;
