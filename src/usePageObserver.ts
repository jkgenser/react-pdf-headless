// Track how much of each page is inside the current viewport
// this way we can accurately track whenever the page is changed
// by the most amount of visibility

import React, { MutableRefObject, useEffect, useMemo, useState } from "react";

const THRESHOLD = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

const INDEX_ATTRIBUTE = "data-index";
const usePageObserver = ({
  parentRef,
  setCurrentPage,
  numPages,
}: {
  setCurrentPage: React.Dispatch<React.SetStateAction<number | null>>;
  parentRef: MutableRefObject<HTMLDivElement | null>;
  numPages: number;
}) => {
  const [visibilities, setVisibilities] = useState<number[]>(() =>
    Array(numPages).fill(-1)
  );

  useEffect(() => {
    if (!numPages) return;

    setVisibilities(Array(numPages).fill(-1));
  }, [numPages]);

  useEffect(() => {
    // Update currentPage based on visibility
    const maxVisibilityIndex = visibilities.indexOf(Math.max(...visibilities));

    if (maxVisibilityIndex !== -1) {
      setCurrentPage(maxVisibilityIndex + 1); // Pages are 1-indexed
    }
  }, [visibilities, setCurrentPage]);

  const pageObserver = useMemo(() => {
    const io = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          const ratio = entry.isIntersecting ? entry.intersectionRatio : -1;
          const target = entry.target;
          const indexAttribute = target.getAttribute(INDEX_ATTRIBUTE);
          if (!indexAttribute) {
            return;
          }
          const index = parseInt(indexAttribute, 10);
          if (0 <= index && index < numPages) {
            // onVisibilityChanged(index, ratio);
            setVisibilities((old) => {
              old[index] = ratio;
              return [...old];
            });
          }
        });
      },
      {
        root: parentRef.current,
        threshold: THRESHOLD,
      }
    );
    return io;
  }, [parentRef, numPages]);

  // cleanup
  useEffect(() => {
    return () => pageObserver?.disconnect();
  }, []);

  return { pageObserver };
};

export default usePageObserver;
