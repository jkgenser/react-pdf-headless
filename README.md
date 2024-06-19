# react-pdf-headless

`react-pdf-headless` is a React component for efficiently rendering and navigating PDF documents. There is some styling that is applied in order for the basic functionality to work, but styling can be overridden by passing in a class override.

It leverages virtualization to handle large documents smoothly and provides APIs for client-side interactions such as jumping to specific pages or highlighted areas.

## Installation

```bash
npm install react-pdf-headless
```

## API Methods
The setReaderAPI prop allows access to the following methods:

jumpToPage(pageIndex: number)
Scrolls to the specified page index.

jumpToOffset(offset: number)
Scrolls to the specified vertical offset.

jumpToHighlightArea(area: HighlightArea)
Scrolls to the specified highlight area within the document.