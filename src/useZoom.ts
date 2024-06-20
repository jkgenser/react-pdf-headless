const ZOOM_LEVELS = [50, 70, 80, 90, 100, 110, 130, 150, 170, 200, 300, 400];

const useZoom = ({
  scale,
  setScale,
}: {
  scale: number | undefined;
  setScale: (newScale: number) => void;
}) => {
  const increaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const nextIndex =
      currentIndex + 1 < ZOOM_LEVELS.length ? currentIndex + 1 : currentIndex;
    setScale(ZOOM_LEVELS[nextIndex]);
  };

  const decreaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    setScale(ZOOM_LEVELS[prevIndex]);
  };

  return { increaseZoom, decreaseZoom };
};

export default useZoom;
