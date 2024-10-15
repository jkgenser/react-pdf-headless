import { Virtualizer } from "@tanstack/react-virtual";

const useRotation = ({
  rotation,
  setRotation,
  virtualizer,
  setTargetScrollIndex,
  currentPage,
}: {
  rotation: number;
  setRotation: (newRotation: number) => void;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  setTargetScrollIndex: (scrollOffset: number) => void;
  currentPage: number | null;
}) => {
  console.log("currentPage", currentPage);
  // Rotate clockwise by 90 degrees
  const rotateClockwise = () => {
    if (currentPage === null) return;
    setRotation((rotation + 90) % 360);
    const currentVirtualItem = virtualizer.getVirtualItemForOffset(
      virtualizer.scrollOffset,
    );
    console.log("currentPage", currentPage);
    // once we are done scrolling, send an event to scroll to
    // the top of the current element
    setTargetScrollIndex(currentPage - 1);
    console.log("setting target scroll index", currentPage - 1);
  };

  // Rotate counter-clockwise by 90 degrees
  const rotateCounterClockwise = () => {
    if (currentPage === null) return;
    setRotation((rotation + 270) % 360);
    const currentVirtualItem = virtualizer.getVirtualItemForOffset(
      virtualizer.scrollOffset,
    );
    // once we are done scrolling, send an event to scroll to
    // the top of the current element
    setTargetScrollIndex(currentPage - 1);
    // setTargetScrollIndex(currentVirtualItem.index);
  };

  return {
    rotateClockwise,
    rotateCounterClockwise,
  };
};

export default useRotation;
