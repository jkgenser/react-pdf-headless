import { Page as ReactPdfPage } from "react-pdf";
import { useEffect, useRef } from "react";
import { ReaderPageProps, RenderPage, RenderPageProps } from "./types";

const EXTRA_WIDTH = 5;

const Page = ({
  virtualItem,
  viewports,
  scale = 1,
  rotation,
  pageObserver,
  shouldRender,
  renderPage,
  classes,
}: ReaderPageProps) => {
  const pageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    pageObserver && pageRef.current && pageObserver.observe(pageRef.current);
  }, [pageObserver]);

  const defaultPageRenderer: RenderPage = (props: RenderPageProps) => {
    return (
      <ReactPdfPage
        pageIndex={props.pageIndex}
        scale={props.scale}
        rotate={props.rotate}
      />
    );
  };

  const renderPageLayer = renderPage || defaultPageRenderer;

  const innerBoxWidth =
    viewports && viewports[virtualItem.index]
      ? viewports[virtualItem.index].width + EXTRA_WIDTH
      : 0;

  return (
    <div
      ref={pageRef}
      id="page-outer-box"
      data-index={virtualItem.index}
      style={{
        position: "absolute",
        height: `${virtualItem.size}px`,
        transform: `translateY(${virtualItem.start}px)`,
        display: "flex",
        justifyContent: "center",
        minWidth: "100%",
      }}
      className={classes?.pageOuterBox}
    >
      <div
        id="page-inner-box"
        style={{
          boxShadow: "2px 2px 8px 0 rgba(0, 0, 0, 0.1)",
          width: `${innerBoxWidth}px`,
          padding: "0px",
          margin: "5px",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "center",
          height: `${shouldRender ? "fit-content" : `${virtualItem.size}px`}`,
          minHeight: `${virtualItem.size - 100}px`,
        }}
        className={classes?.pageInnerBox}
      >
        {shouldRender && (
          <div
            style={{
              position: "relative",
              height: "fit-content",
              width: "fit-content",
            }}
            className={classes?.pageWrapper}
          >
            {renderPageLayer({
              pageIndex: virtualItem.index,
              scale,
              rotate: rotation,
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
