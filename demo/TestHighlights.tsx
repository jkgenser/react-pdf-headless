import { highlightData } from "./highlightData";
import { RenderPageProps } from "./types";
import { transformHighlightProps } from "./util";

const Highlight = ({
  top,
  left,
  height,
  width,
  rotation,
}: {
  top: number;
  left: number;
  height: number;
  width: number;
  rotation: number;
}) => {
  return (
    <div
      className="highlight-on-page"
      style={{
        zIndex: 5,
        ...transformHighlightProps({ top, left, height, width, rotation }),
        position: "absolute",
        backgroundColor: "yellow",
        opacity: 0.5,
      }}
    ></div>
  );
};

const TestHighlightsLayer = (props: RenderPageProps) => {
  const pageHighlights = highlightData.filter(
    (highlight) => highlight.pageIndex === props.pageIndex
  );
  return (
    <div className="text-highlights-layer">
      {pageHighlights.map((highlight, index) => (
        <Highlight key={index} {...highlight} rotation={props.rotate} />
      ))}
    </div>
  );
};

export default TestHighlightsLayer;
