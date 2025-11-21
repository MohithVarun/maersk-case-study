import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './App.css';

// Point to the worker in public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/worker.js';

// --- DATA CONFIGURATION ---
// Matches the [1], [2], [3] citations to specific PDF locations
const CITATION_DATA = {
  1: {
    pageNumber: 3,
    highlightArea: { top: '21.5%', left: '10%', width: '80%', height: '5%' }
  },
  2: {
    pageNumber: 5,
    highlightArea: { top: '25%', left: '10%', width: '80%', height: '5%' }
  },
  3: {
    pageNumber: 15,
    // Coordinates specific to "Gain on sale of non-current assets" row
    highlightArea: { top: '29.8%', left: '8%', width: '84%', height: '2.2%' }
  }
};

function App() {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Start on Page 1
  const [activeCitation, setActiveCitation] = useState(null);
  
  // Refs for sizing and scrolling
  const highlightRef = useRef(null);
  const pdfWrapperRef = useRef(null);
  const [pdfWidth, setPdfWidth] = useState(null);

  // Responsive Width Logic
  useEffect(() => {
    const updateWidth = () => {
      if (pdfWrapperRef.current) {
        setPdfWidth(pdfWrapperRef.current.getBoundingClientRect().width);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // The Interaction Handler
  const handleCitationClick = (id) => {
    const citation = CITATION_DATA[id];
    if (citation) {
      setCurrentPage(citation.pageNumber); // Jump to page
      setActiveCitation(citation);         // Draw highlight
    }
  };

  // Auto-scroll to highlight when it appears
  useEffect(() => {
    if (activeCitation && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeCitation, currentPage]);

  // Reusable component for the clickable citation buttons like [1]
  const CiteBtn = ({ id }) => (
    <span 
      className={`citation-btn ${activeCitation === CITATION_DATA[id] ? 'active' : ''}`} 
      onClick={() => handleCitationClick(id)}
    >
      [{id}]
    </span>
  );

  return (
    <div className="app-container">
      
      {/* --- LEFT COLUMN: PDF --- */}
      <div className="pdf-column">
        {/* Navigation Toolbar */}
        <div className="pdf-toolbar">
          <div className="pagination-controls">
            <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>&larr; Prev</button>
            <span>Page <strong>{currentPage}</strong> of {numPages || '--'}</span>
            <button disabled={currentPage >= numPages} onClick={() => setCurrentPage(p => p + 1)}>Next &rarr;</button>
          </div>
        </div>

        {/* PDF Canvas */}
        <div className="pdf-viewer-container" ref={pdfWrapperRef}>
          <Document
            file="/report.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="loading">Loading Report...</div>}
            onLoadError={(e) => console.error("Error:", e)}
          >
            <Page 
              pageNumber={currentPage} 
              width={pdfWidth} 
              className="pdf-page"
              renderTextLayer={false}
              renderAnnotationLayer={false}
            >
              {/* The Yellow Highlight Overlay */}
              {activeCitation && activeCitation.pageNumber === currentPage && (
                <div 
                  ref={highlightRef}
                  className="highlight-overlay"
                  style={{
                    top: activeCitation.highlightArea.top,
                    left: activeCitation.highlightArea.left,
                    width: activeCitation.highlightArea.width,
                    height: activeCitation.highlightArea.height,
                  }}
                />
              )}
            </Page>
          </Document>
        </div>
      </div>

      {/* --- RIGHT COLUMN: ANALYSIS CONTENT --- */}
      <div className="sidebar-column">
        <div className="sidebar-content">
          
          {/* SECTION 1: ANALYSIS */}
          <div className="text-section">
            <h2>Analysis</h2>
            <p>
              No extraordinary or one-off items affecting EBITDA were reported in Maersk’s Q2 2025 results.
            </p>
            <p>
              The report explicitly notes that EBITDA improvements stemmed from operational performance—
              including volume growth, cost control, and margin improvement across Ocean, Logistics &
              Services, and Terminals segments <CiteBtn id={1} /><CiteBtn id={2} />. Gains or losses from asset sales, which could qualify as
              extraordinary items, are shown separately under EBIT and not included in EBITDA. 
            </p>
            <p>
              The gain on
              sale of non-current assets was USD 25 m in Q2 2025, significantly lower than USD 208 m in Q2
              2024, but these affect EBIT, not EBITDA <CiteBtn id={3} />. Hence, Q2 2025 EBITDA reflects core operating
              activities without one-off extraordinary adjustments.
            </p>
          </div>

          <hr className="divider" />

          {/* SECTION 2: FINDINGS */}
          <div className="text-section">
            <h2>Findings</h2>
            
            <div className="finding-block">
              <h4>Page 3 — Highlights Q2 2025</h4>
              <p>
                EBITDA increase (USD 2.3 bn vs USD 2.1 bn prior year) attributed to operational improvements; no
                mention of extraordinary or one-off items. <CiteBtn id={1} />
              </p>
            </div>

            <div className="finding-block">
              <h4>Page 5 — Review Q2 2025</h4>
              <p>
                EBITDA rise driven by higher revenue and cost control across all segments; no extraordinary gains
                or losses included. <CiteBtn id={2} />
              </p>
            </div>

            <div className="finding-block">
              <h4>Page 15 — Condensed Income Statement</h4>
              <p>
                Gain on sale of non-current assets USD 25 m (vs USD 208 m prior year) reported separately below
                EBITDA; therefore, not part of EBITDA. <CiteBtn id={3} />
              </p>
            </div>
          </div>

          <hr className="divider" />

          {/* SECTION 3: SUPPORTING EVIDENCE */}
          <div className="text-section evidence-section">
            <h2>Supporting Evidence</h2>
            
            <div className="evidence-item">
              <span className="evidence-meta">[1] A.P. Moller – Maersk Q2 2025 Interim Report (7 Aug 2025) — Page 3 →</span>
              <p className="quote">
                “Maersk’s results continued to improve year-on-year ... EBITDA of USD 2.3 bn (USD 2.1 bn) ...
                driven by volume and other revenue growth in Ocean, margin improvements in Logistics &
                Services and significant top line growth in Terminals.”
              </p>
            </div>

            <div className="evidence-item">
              <span className="evidence-meta">[2] A.P. Moller – Maersk Q2 2025 Interim Report (7 Aug 2025) — Page 5 →</span>
              <p className="quote">
                “EBITDA increased to USD 2.3 bn (USD 2.1 bn) ... driven by higher revenue and cost management
                ... Ocean’s EBITDA ... slightly increased by USD 36 m ... Logistics & Services contributed
                significantly with a USD 71 m increase ... Terminals’ EBITDA increased by USD 50 m.”
              </p>
            </div>

            <div className="evidence-item">
              <span className="evidence-meta">[3] A.P. Moller – Maersk Q2 2025 Interim Report (7 Aug 2025) — Page 15 →</span>
              <p className="quote">
                “Gain on sale of non-current assets, etc., net 25 (208) ... Profit before depreciation, amortisation
                and impairment losses, etc. (EBITDA) 2,298”
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;