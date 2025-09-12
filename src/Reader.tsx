import {
  VirtualizerOptions,
  elementScroll,
  useVirtualizer,
} from "@tanstack/react-virtual";
import { PageViewport } from "pdfjs-dist//types/src/display/display_utils";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document } from "react-pdf";
import { HighlightArea, ReaderProps } from "./types";

import Page, { EXTRA_WIDTH } from "./Page";
import usePageObserver from "./usePageObserver";
import useRotation from "./useRotation";
import useVirtualizerVelocity from "./useVirtualizerVelocity";
import useZoom from "./useZoom";
import {
  easeOutQuint,
  getOffsetForHighlight,
  getOffsetForIndexAndPercentage,
} from "./util";

export const VIRTUAL_ITEM_GAP = 10;
export const RESERVE_WIDTH = 50;
export const DEFAULT_HEIGHT = 600;

const determineScale = (parentElement: HTMLElement, width: number): number => {
  const scaleWidth = (parentElement.clientWidth - RESERVE_WIDTH) / width;
  return scaleWidth;
};

export interface ZoomState {
  currentScale: number | null;
  nextScale: number | null;
}

const Reader = ({
  file,
  initialScale,
  initialRotation = 0,
  onPageChange,
  onDocumentLoad,
  onViewportsMeasured,
  setReaderAPI,
  renderPage,
  classes,
  reactPDFDocumentProps,
  virtualizerOptions = { overscan: 0 },
}: ReaderProps) => {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const scrollingRef = useRef<number | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [viewports, setPageViewports] = useState<Array<PageViewport> | null>(
    null,
  );
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState<number | undefined>(initialScale);
  const [defaultScale, setDefaultScale] = useState<number | null>(null);
  const [rotation, setRotation] = useState<number>(initialRotation);
  const [defaultRotations, setDefaultRotations] = useState<number[] | null>();

  const [scrollAnchor, setScrollAnchor] = useState<{
    index: number;
    percentageOffsetY: number;
    percentageOffsetX: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState<number | null>(null);
  const [viewportsReady, setViewportsReady] = useState<boolean>(false);
  const [_, setTargetScrollIndex] = useState<number | null>(null);
  const [__, setZoomState] = useState<ZoomState>({
    currentScale: null,
    nextScale: null,
  });

  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback(
    (offset, canSmooth, instance) => {
      const duration = 400;
      const start = parentRef.current?.scrollTop || 0;
      const startTime = (scrollingRef.current = Date.now());

      // if we are in auto scroll mode, then immediately scroll
      // to the offset and not display any animation. For example if scroll
      // immediately to a rescaled offset if zoom/scale has just been changed
      if (canSmooth.behavior === "auto") {
        elementScroll(offset, canSmooth, instance);
        return;
      }

      // if we are in smooth mode then we scroll auto using our ease out schedule
      const run = () => {
        if (scrollingRef.current !== startTime) return;
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = easeOutQuint(Math.min(elapsed / duration, 1));
        const interpolated = start + (offset - start) * progress;

        if (elapsed < duration) {
          elementScroll(interpolated, { behavior: "auto" }, instance);
          requestAnimationFrame(run);
        } else {
          elementScroll(interpolated, { behavior: "auto" }, instance);
        }
      };

      requestAnimationFrame(run);
    },
    [parentRef],
  );

  const onDocumentLoadSuccess = async (newPdf: PDFDocumentProxy) => {
    setPdf(newPdf);
    setNumPages(newPdf.numPages);

    // user defined callback
    onDocumentLoad && onDocumentLoad(newPdf);
  };

  const getRotationAdjustment = useCallback(
    (index: number) => {
      const defaultRotation =
        (defaultRotations && defaultRotations[index]) || 0;

      return defaultRotation;
    },
    [defaultRotations],
  );

  const estimateSize = useCallback(
    (index: number) => {
      if (!viewports || !viewports[index]) return DEFAULT_HEIGHT;
      return viewports[index].height;
    },
    [viewports],
  );

  const virtualizer = useVirtualizer({
    count: numPages || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize,
    overscan: virtualizerOptions?.overscan ?? 0,
    scrollToFn,
    gap: VIRTUAL_ITEM_GAP,
    paddingStart: 10,
  });

  const { pageObserver } = usePageObserver({
    parentRef,
    setCurrentPage,
    numPages,
  });

  const {
    increaseZoom: baseIncreaseZoom,
    decreaseZoom: baseDecreaseZoom,
    zoomFitWidth: baseZoomFitWidth,
  } = useZoom({
    scale,
    defaultScale,
    setScale,
    setZoomState,
  });

  const { rotateClockwise, rotateCounterClockwise } = useRotation({
    rotation,
    setRotation,
    setTargetScrollIndex,
    currentPage,
  });

  // viewportTop is the pixel offset from the top of the VISIBLE part of the reader
  // if we pass 0 then it is saying "which page is at the very top of what I can currently see on my screen"
  const getVirtualItemAndOffsetAt = useCallback(
    (point?: { top?: number; left?: number }) => {
      if (!parentRef.current || !viewports) {
        return null;
      }

      // Default to the center of the viewport if no specific point is provided
      const viewportTop = point?.top ?? parentRef.current.clientHeight / 2;
      const scrollOffset = parentRef.current.scrollTop + viewportTop;

      const virtualItem = virtualizer.getVirtualItemForOffset(scrollOffset);

      if (!virtualItem) {
        return null;
      }

      const offsetInItem = scrollOffset - virtualItem.start;
      const percentageOffsetY = (offsetInItem / virtualItem.size) * 100;

      const viewportLeft = point?.left ?? parentRef.current.clientWidth / 2;
      const pageViewport = viewports[virtualItem.index];

      if (!pageViewport) {
        return null;
      }

      const pageInnerBoxWidth = pageViewport.width + EXTRA_WIDTH;
      const containerWidth = parentRef.current.clientWidth;

      const pageLeftOffsetInContainer =
        (containerWidth - pageInnerBoxWidth) / 2;

      const absoluteX = parentRef.current.scrollLeft + viewportLeft;

      const offsetX = absoluteX - pageLeftOffsetInContainer;

      const percentageOffsetX = (offsetX / pageInnerBoxWidth) * 100;

      return { index: virtualItem.index, percentageOffsetY, percentageOffsetX };
    },
    [virtualizer, viewports],
  );

  const increaseZoom = () => {
    const anchor = getVirtualItemAndOffsetAt();
    if (anchor) {
      setScrollAnchor(anchor);
    }
    baseIncreaseZoom();
  };

  const decreaseZoom = () => {
    const anchor = getVirtualItemAndOffsetAt();
    if (anchor) {
      setScrollAnchor(anchor);
    }
    baseDecreaseZoom();
  };

  const zoomFitWidth = () => {
    const anchor = getVirtualItemAndOffsetAt();
    if (anchor) {
      setScrollAnchor(anchor);
    }
    baseZoomFitWidth();
  };

  useEffect(() => {
    const calculateViewports = async () => {
      if (!pdf || scale === undefined) return;

      const viewports = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          // sometimes there is information about the default rotation of the document
          // stored in page.rotate. we need to always add that additional rotaton offset
          const deltaRotate = page.rotate || 0;
          const viewport = page.getViewport({
            scale: scale,
            rotation: rotation + deltaRotate,
          });
          return viewport;
        }),
      );

      const rotations = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, index) => {
          const page = await pdf.getPage(index + 1);
          return page.rotate || 0; // Default to 0 if no rotation metadata
        }),
      );
      setDefaultRotations(rotations);
      setPageViewports(viewports);
      setViewportsReady(true);
    };

    setViewportsReady(false);
    calculateViewports();
  }, [pdf, scale, rotation]);

  useEffect(() => {
    if (!pdf) return;
    const fetchPageAndSetScale = async ({
      initialScale,
    }: {
      initialScale: number | undefined;
    }) => {
      const firstPage = await pdf.getPage(1);
      const firstPageDefaultRotation = firstPage.rotate || 0;
      const firstViewPort = firstPage.getViewport({
        scale: 1,
        rotation: firstPageDefaultRotation,
      });
      const newScale = determineScale(parentRef.current!, firstViewPort.width);
      if (!initialScale) setScale(newScale);
      if (initialScale) setScale(initialScale);
      setDefaultScale(newScale);
    };

    fetchPageAndSetScale({ initialScale });
  }, [pdf, initialScale, initialRotation]);

  useEffect(() => {
    if (!currentPage) return;
    onPageChange && pdf && onPageChange({ currentPage, doc: pdf });
  }, [currentPage]);

  useEffect(() => {
    if (!viewports || !viewportsReady) return;
    if (scale === undefined) return;
    virtualizer.measure();
    onViewportsMeasured && onViewportsMeasured();

    if (scrollAnchor) {
      const startOffset = virtualizer.getOffsetForIndex(
        scrollAnchor.index,
        "start",
      )?.[0];

      if (startOffset != null) {
        const itemHeight = estimateSize(scrollAnchor.index);
        const offset = getOffsetForIndexAndPercentage({
          itemHeight: itemHeight,
          percentage: scrollAnchor.percentageOffsetY,
          startOffset: startOffset,
        });

        virtualizer.scrollToOffset(offset, {
          align: "center",
          behavior: "auto",
        });
      }
      setScrollAnchor(null);
    }

    const jumpToPage = (
      pageIndex: number,
      options?: {
        align?: "start" | "center" | "end" | "auto";
        behavior?: "auto" | "smooth";
      },
    ) => {
      // Define default options
      const defaultOptions = {
        align: "start",
        behavior: "smooth",
      };

      // Merge default options with any provided options
      const finalOptions = { ...defaultOptions, ...options };
      // @ts-ignore
      virtualizer.scrollToIndex(pageIndex, finalOptions);
    };

    const jumpToOffset = (offset: number) => {
      virtualizer.scrollToOffset(offset, {
        align: "start",
        behavior: "smooth",
      });
    };

    const jumpToHighlightArea = (area: HighlightArea) => {
      const startOffset = virtualizer.getOffsetForIndex?.(
        area.pageIndex,
        "start",
      )?.[0];

      if (startOffset == null) return;

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

    setReaderAPI &&
      setReaderAPI({
        jumpToPage,
        jumpToHighlightArea,
        jumpToOffset,
        increaseZoom,
        decreaseZoom,
        zoomFitWidth,
        rotateClockwise,
        rotateCounterClockwise,
        scale,
        rotation,
        getVirtualItemAndOffsetAt,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewports, scale, viewportsReady]);

  // scale changes >> recalc viewports >> viewports ready >> zoom

  const { normalizedVelocity } = useVirtualizerVelocity({
    virtualizer,
    estimateSize,
  });

  const isScrollingFast = Math.abs(normalizedVelocity) > 1;
  const shouldRender = !isScrollingFast || !viewportsReady;

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
      <Document
        {...reactPDFDocumentProps}
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
      >
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
                  rotationAdjustment={getRotationAdjustment(virtualItem.index)}
                  rotation={rotation + getRotationAdjustment(virtualItem.index)}
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
