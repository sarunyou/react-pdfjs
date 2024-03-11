import { useEffect, useRef, useState } from "react";
import "./App.css";
import * as pdfjs from "./pdfjs/dist/build/pdf.mjs";
import {
  EventBus,
  PDFLinkService,
  PDFViewer,
} from "./pdfjs/components/pdf_viewer.mjs";
import type { PDFDocumentProxy, PDFPageProxy } from "./pdfjs/types/src/pdf.d.ts";
import "./pdfjs/dist/web/pdf_viewer.css";

type PDFRenderTask = ReturnType<PDFPageProxy["render"]>;

window.pdfjs = pdfjs;

pdfjs.GlobalWorkerOptions.workerSrc =  "src/pdfjs/dist/build/pdf.worker.mjs";
function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy>();
  const lastPageRequestedRenderRef = useRef<PDFPageProxy | null>(null);
  const renderTask = useRef<PDFRenderTask | null>(null);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>();
  const [viewer, setViewer] = useState<PDFViewer>();
  const eventBus = new EventBus();
  const linkService = new PDFLinkService({
    eventBus: eventBus,
    externalLinkTarget: 2,
  });

  const scale = 1,
    rotate = 0,
    page = 1;

  useEffect(() => {
    pdfjs
      .getDocument({
        url: "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf",
      })
      .promise.then((loadedPdfDocument) => {
        setPdfDocument(loadedPdfDocument);
      });
  }, []);

  // useEffect(() => {
  //   // draw a page of the pdf
  //   const drawPDF = (page: PDFPageProxy) => {
  //     // Because this page's rotation option overwrites pdf default rotation value,
  //     // calculating page rotation option value from pdf default and this component prop rotate.
  //     const rotation = rotate === 0 ? page.rotate : page.rotate + rotate;
  //     const viewport = page.getViewport({ scale, rotation });
  //     const canvasEl = canvasRef!.current;
  //     if (!canvasEl) {
  //       return;
  //     }
  //
  //     const canvasContext = canvasEl.getContext("2d");
  //     if (!canvasContext) {
  //       return;
  //     }
  //
  //     canvasEl.height = viewport.height * window.devicePixelRatio;
  //     canvasEl.width = viewport.width * window.devicePixelRatio;
  //
  //     canvasContext.scale(window.devicePixelRatio, window.devicePixelRatio);
  //
  //     // if previous render isn't done yet, we cancel it
  //     if (renderTask.current) {
  //       lastPageRequestedRenderRef.current = page;
  //       renderTask.current.cancel();
  //       return;
  //     }
  //
  //     renderTask.current = page.render({
  //       canvasContext,
  //       viewport,
  //     });
  //
  //     return renderTask.current.promise.then(
  //       () => {
  //         renderTask.current = null;
  //       },
  //       (reason: Error) => {
  //         renderTask.current = null;
  //
  //         if (reason && reason.name === "RenderingCancelledException") {
  //           const lastPageRequestedRender =
  //             lastPageRequestedRenderRef.current ?? page;
  //           lastPageRequestedRenderRef.current = null;
  //           drawPDF(lastPageRequestedRender);
  //         }
  //       },
  //     );
  //   };
  //
  //   if (pdfDocument) {
  //     pdfDocument.getPage(page).then((loadedPdfPage) => {
  //       setPdfPage(loadedPdfPage);
  //
  //       drawPDF(loadedPdfPage);
  //     });
  //   }
  // }, [canvasRef, page, pdfDocument, rotate, scale]);

  useEffect(() => {
    if (pdfDocument && containerNodeRef.current) {
      const _viewer =
        viewer ||
        new PDFViewer({
          container: containerNodeRef.current,
          eventBus: eventBus,
          // enhanceTextSelection: true, // deprecated. https://github.com/mozilla/pdf.js/issues/9943#issuecomment-409369485
          textLayerMode: 2,
          removePageBorders: true,
          linkService: linkService,
        });

      linkService.setDocument(pdfDocument);
      linkService.setViewer(_viewer);
      _viewer.setDocument(pdfDocument);
      // debug
      (window as any).PdfViewer = viewer;
      setViewer(_viewer);
    }
  }, [pdfDocument]);

  console.log("pdfpage", pdfPage);
  return (
    <>
      {!pdfDocument && <span>Loading...</span>}
      <div ref={containerNodeRef} style={{ position: "absolute" }}>
        <div className="pdfViewer" />
      </div>
    </>
  );
}

export default App;
