import "./App.css";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { pdfjs } from "react-pdf";
import { Reader } from "../src/index";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { PageChangeEvent, ReaderAPI, RenderPageProps } from "../src/types";
import { Page } from "react-pdf";
import TestHighlightsLayer from "./TestHighlights";
import { highlightData } from "./highlightData";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const LoadingComponent = () => {
  return <div>Overidden Loading</div>;
};

function App() {
  const [pageNum, setPageNum] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(0.75);
  const [file, setFile] = useState<string>("hr2.pdf");
  const [wantPage, setWantPage] = useState<number | null>(null);
  const [readerAPI, setReaderAPI] = useState<ReaderAPI | null>(null);
  const [offset, setOffset] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const initialHighlight = useRef(false);

  const onPageChange = (e: PageChangeEvent) => {
    setPageNum(e.currentPage);
  };

  const handleScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setScale(isNaN(value) ? null : value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFile(e.target.value);
  };

  const handleWantPageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setWantPage(isNaN(value) ? null : value);
  };

  const handleOffsetChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setOffset(isNaN(value) ? null : value);
  };

  const renderPage = (props: RenderPageProps) => {
    return (
      <>
        <Page {...props}>
          <TestHighlightsLayer {...props} />
        </Page>
      </>
    );
  };

  const handlePageNumChange = (e: any) => {
    if (e.target.value === "") {
      setPageNum(null);
      return;
    }
    setPageNum(e.target.value);
  };

  // Virtualizer has set up the dimension
  const onViewportsMeasured = () => {
    setIsLoaded(true);
  };

  // PDF is ready
  const onDocumentLoaded = () => {
    // console.log("pdf ready");
    // debugger;
  };

  useEffect(() => {
    if (!readerAPI || initialHighlight.current) return;
    readerAPI?.jumpToHighlightArea(highlightData[0]);
    initialHighlight.current = true;
  }, [readerAPI]);

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex" }}>
          <div>Page:</div>
          <input
            type="number"
            value={!pageNum ? "" : pageNum}
            onChange={handlePageNumChange}
          />
        </div>
        {/* <div>
          initial scale
          <input
            type="number"
            value={scale !== null ? scale : ""}
            onChange={handleScaleChange}
          />
        </div> */}
        <div>
          File
          <select value={file} onChange={handleFileChange}>
            <option value="pdf-open-parameters.pdf">
              pdf-open-parameters.pdf
            </option>
            <option value="test-pdf.pdf">test-pdf.pdf</option>
            <option value="rai.pdf">rai.pdf</option>
          </select>
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              wantPage !== null && readerAPI?.jumpToPage(wantPage - 1);
            }}
          >
            jump to page
          </button>
          <input
            type="number"
            value={wantPage !== null ? wantPage : ""}
            onChange={handleWantPageChange}
          />
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              offset !== null && readerAPI?.jumpToOffset(offset);
            }}
          >
            jump to offset
          </button>
          <input
            type="number"
            value={offset !== null ? offset : ""}
            onChange={handleOffsetChange}
          />
        </div>
        <button
          onMouseDown={() => {
            readerAPI?.jumpToHighlightArea(highlightData[0]);
          }}
        >
          jump to highlight
        </button>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              readerAPI?.decreaseZoom();
            }}
          >
            zoom out
          </button>
          <button
            onClick={() => {
              readerAPI?.increaseZoom();
            }}
          >
            zoom in
          </button>
          <button
            onClick={() => {
              readerAPI?.zoomFitWidth();
            }}
          >
            zoom default
          </button>
          <div>{readerAPI?.scale?.toString().substring(0, 3)}</div>
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => {
              readerAPI?.rotateCounterClockwise();
            }}
          >
            rotate counter clock
          </button>
          <button
            onClick={() => {
              readerAPI?.rotateClockwise();
            }}
          >
            rotate clock
          </button>
          <div>{readerAPI?.rotation}</div>
        </div>
      </div>
      <div
        style={{
          width: "700px",
          height: "800px",
          borderColor: "gray",
          borderWidth: "1px",
          borderStyle: "solid",
        }}
      >
        <Reader
          file={file}
          onPageChange={onPageChange}
          onDocumentLoad={onDocumentLoaded}
          onViewportsMeasured={onViewportsMeasured}
          // initialScale={scale || undefined}
          initialRotation={0}
          setReaderAPI={(api: ReaderAPI) => setReaderAPI(api)}
          renderPage={renderPage}
          reactPDFDocumentProps={{ loading: LoadingComponent }}
        />
      </div>
    </div>
  );
}

export default App;
