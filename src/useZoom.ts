import { Virtualizer } from "@tanstack/react-virtual";
import { VIRTUAL_ITEM_GAP } from "./Reader";

const ZOOM_LEVELS = [
  50, 70, 80, 90, 100, 110, 120, 130, 150, 170, 200, 300, 400,
].map((level) => level / 100);
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
    const offsetScaleFactor = nextScale / scale;
    setScale(ZOOM_LEVELS[nextIndex]);

    // calculate our offset from item start
    const currentVirtualItem = virtualizer.getVirtualItemForOffset(
      virtualizer.scrollOffset,
    );

    // subtract off gaps from the current total offset
    const currentOffsetWithoutGap =
      virtualizer.scrollOffset - currentVirtualItem.index * VIRTUAL_ITEM_GAP;

    // apply scaling factor to the offset amount without gap
    const newScaledOffsetWithoutGap =
      currentOffsetWithoutGap * offsetScaleFactor;

    // add back the gap amount
    const newScaledOffsetWithGap =
      newScaledOffsetWithoutGap + currentVirtualItem.index * VIRTUAL_ITEM_GAP;

    virtualizer.scrollToOffset(newScaledOffsetWithGap, {
      align: "start",
      behavior: "auto",
    });
  };

  const decreaseZoom = () => {
    if (!scale) return;
    const currentIndex = ZOOM_LEVELS.findIndex((level) => level >= scale);
    const prevIndex = currentIndex - 1 >= 0 ? currentIndex - 1 : 0;
    setScale(ZOOM_LEVELS[prevIndex]);
  };

  const zoomFitWidth = () => {
    if (!defaultScale) return;
    setScale(defaultScale);
  };

  return { increaseZoom, decreaseZoom, zoomFitWidth };
};

export default useZoom;

// from current offset, determine what percentage of item we are rendered down
// form the current item index
// then calculate the new target offset by summing the gap heights
// and page heights for the new page start
