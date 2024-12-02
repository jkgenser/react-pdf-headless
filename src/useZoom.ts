import { Virtualizer } from "@tanstack/react-virtual";
import { VIRTUAL_ITEM_GAP, ZoomState } from "./Reader";

const ZOOM_LEVELS = [
  50, 70, 80, 90, 100, 110, 120, 130, 150, 170, 200, 300, 400,
].map((level) => level / 100);

export const calculateAfterZoomOffset = (
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  currentScale: number,
  nextScale: number,
): number | null => {
  if (!currentScale || !virtualizer || virtualizer.scrollOffset == null) {
    return null;
  }

  const offsetScaleFactor = nextScale / currentScale;

  // Calculate the offset from the current virtual item start
  const currentVirtualItem = virtualizer.getVirtualItemForOffset(
    virtualizer.scrollOffset,
  );

  if (!currentVirtualItem) return null;

  // Subtract off gaps from the current total offset
  const currentOffsetWithoutGap =
    virtualizer.scrollOffset - currentVirtualItem.index * VIRTUAL_ITEM_GAP;

  // Apply the scaling factor to the offset without the gap
  const newScaledOffsetWithoutGap = currentOffsetWithoutGap * offsetScaleFactor;

  // Add back the gap after scaling
  const newScaledOffsetWithGap =
    newScaledOffsetWithoutGap + currentVirtualItem.index * VIRTUAL_ITEM_GAP;

  // Return the newly calculated offset
  return newScaledOffsetWithGap;
};
const useZoom = ({
  scale,
  defaultScale,
  setScale,
  setZoomState,
}: {
  scale: number | undefined;
  defaultScale: number | null;
  setScale: (newScale: number) => void;
  setZoomState: (zoomState: ZoomState) => void;
}) => {
  const increaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const nextIndex =
      currentIndex + 1 < ZOOM_LEVELS.length ? currentIndex + 1 : currentIndex;
    const nextScale = ZOOM_LEVELS[nextIndex];

    setScale(nextScale);
    setZoomState({
      currentScale: scale,
      nextScale: nextScale,
    });
  };

  const decreaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    const nextScale = ZOOM_LEVELS[prevIndex];
    setScale(nextScale);
    setZoomState({
      currentScale: scale,
      nextScale: nextScale,
    });
  };

  const zoomFitWidth = () => {
    if (!defaultScale) return;
    setScale(defaultScale);
  };

  return { increaseZoom, decreaseZoom, zoomFitWidth };
};

export default useZoom;
