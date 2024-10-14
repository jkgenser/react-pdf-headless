import { Virtualizer } from "@tanstack/react-virtual";
import { VIRTUAL_ITEM_GAP } from "./Reader";

const ZOOM_LEVELS = [
  50, 70, 80, 90, 100, 110, 120, 130, 150, 170, 200, 300, 400,
].map((level) => level / 100);

export const calculateNewOffset = (
  virtualizer: Virtualizer<HTMLDivElement, Element>,
  currentScale: number,
  nextScale: number,
): number | null => {
  if (!currentScale || !virtualizer) return null;

  const offsetScaleFactor = nextScale / currentScale;

  // Calculate the offset from the current virtual item start
  const currentVirtualItem = virtualizer.getVirtualItemForOffset(
    virtualizer.scrollOffset,
  );

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
  virtualizer,
}: {
  scale: number | undefined;
  defaultScale: number | null;
  setScale: (newScale: number) => void;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}) => {
  const increaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const nextIndex =
      currentIndex + 1 < ZOOM_LEVELS.length ? currentIndex + 1 : currentIndex;
    const nextScale = ZOOM_LEVELS[nextIndex];

    setScale(ZOOM_LEVELS[nextIndex]);

    const newScaledOffsetWithGap =
      calculateNewOffset(virtualizer, scale, nextScale) ||
      virtualizer.scrollOffset;

    virtualizer.scrollToOffset(newScaledOffsetWithGap, {
      align: "start",
      behavior: "auto",
    });
  };

  const decreaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    const nextScale = ZOOM_LEVELS[prevIndex];
    setScale(ZOOM_LEVELS[prevIndex]);

    const newScaledOffsetWithGap =
      calculateNewOffset(virtualizer, scale, nextScale) ||
      virtualizer.scrollOffset;

    virtualizer.scrollToOffset(newScaledOffsetWithGap, {
      align: "start",
      behavior: "auto",
    });
  };

  const zoomFitWidth = () => {
    if (!defaultScale) return;
    setScale(defaultScale);
  };

  return { increaseZoom, decreaseZoom, zoomFitWidth };
};

export default useZoom;
