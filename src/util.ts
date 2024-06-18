export const transformHighlightProps = ({
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
  const defaultProps = {
    top: `${top}%`,
    left: `${left}%`,
    height: `${height}%`,
    width: `${width}%`,
  };

  switch (rotation) {
    case 0:
      return {
        top: `${top}%`,
        left: `${left}%`,
        height: `${height}%`,
        width: `${width}%`,
      };
    case 90:
      return {
        top: `${left}%`,
        right: `${top}%`,
        height: `${width}%`,
        width: `${height}%`,
      };
    case 180:
      return {
        bottom: `${top}%`,
        right: `${left}%`,
        height: `${height}%`,
        width: `${width}%`,
      };
    case 270:
      return {
        bottom: `${left}%`,
        left: `${top}%`,
        height: `${width}%`,
        width: `${height}%`,
      };
    default:
      return defaultProps;
  }
};

export const getOffsetForHighlight = ({
  top,
  left,
  height,
  width,
  itemHeight,
  rotation,
  startOffset,
}: {
  top: number;
  left: number;
  height: number;
  width: number;
  rotation: number;
  itemHeight: number;
  startOffset: number;
}) => {
  const bottomOffset = startOffset + itemHeight;
  const topP = top * itemHeight * 0.01;
  const leftP = left * itemHeight * 0.01;
  const heightP = height * itemHeight * 0.01;
  const widthP = width * itemHeight * 0.01;

  let extraOffset;
  switch (rotation) {
    case 0:
      extraOffset = (top * itemHeight) / 100;
      break;

    case 90:
      extraOffset = (left * itemHeight) / 100;
      break;

    case 180:
      extraOffset = itemHeight - topP - heightP;
      break;

    case 270:
      extraOffset = itemHeight - leftP - widthP;
      break;

    default:
      extraOffset = (top * itemHeight) / 100;
  }

  console.log({
    top,
    left,
    height,
    width,
    startOffset,
    extraOffset,
    rotation,
    itemHeight,
    bottomOffset,
  });

  return startOffset + extraOffset;
};
