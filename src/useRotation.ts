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
  const rotateClockwise = () => {
    if (currentPage === null) return;
    setRotation((rotation + 90) % 360);
    setTargetScrollIndex(currentPage - 1);
  };

  // Rotate counter-clockwise by 90 degrees
  const rotateCounterClockwise = () => {
    if (currentPage === null) return;
    setRotation((rotation + 270) % 360);
    setTargetScrollIndex(currentPage - 1);
  };

  return {
    rotateClockwise,
    rotateCounterClockwise,
  };
};

export default useRotation;
