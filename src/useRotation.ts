const useRotation = ({
  rotation,
  setRotation,
}: {
  rotation: number;
  setRotation: (newRotation: number) => void;
}) => {
  // Rotate clockwise by 90 degrees
  const rotateClockwise = () => {
    setRotation((rotation + 90) % 360);
  };

  // Rotate counter-clockwise by 90 degrees
  const rotateCounterClockwise = () => {
    setRotation((rotation + 270) % 360);
  };

  return {
    rotateClockwise,
    rotateCounterClockwise,
  };
};

export default useRotation;
