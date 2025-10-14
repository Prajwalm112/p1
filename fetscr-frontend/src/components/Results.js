// src/components/Results.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Results.css";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const [results, setResults] = useState({});
  const [query, setQuery] = useState("");

  // ------------------ LOAD RESULTS ------------------
  useEffect(() => {
    const s = location.state;
    if (s?.results) {
      setResults(s.results);
      setQuery(s.query || "");
      sessionStorage.setItem(
        "fetscr_results",
        JSON.stringify({ results: s.results, query: s.query })
      );
    } else {
      const stored = sessionStorage.getItem("fetscr_results");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setResults(parsed.results || {});
          setQuery(parsed.query || "");
        } catch {
          setResults({});
        }
      }
    }
  }, [location.state]);

  const keywordList = Object.keys(results || {});

  // ------------------ CSV DOWNLOAD ------------------
  const downloadCSV = () => {
    if (!keywordList.length) return alert("No data available.");

    const header = ["#"].concat(keywordList);
    const maxRows = Math.max(...keywordList.map(k => results[k].length || 0));

    const rows = Array.from({ length: maxRows }).map((_, i) => {
      const row = [i + 1];
      for (const kw of keywordList) {
        const item = results[kw][i];
        if (item)
          row.push(
            `${item.title || ""} - ${item.snippet || ""} (${item.link || ""})`
          );
        else row.push("");
      }
      return row;
    });

    const csv = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fetscr_results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ------------------ PDF DOWNLOAD ------------------
  const downloadPDF = () => {
    if (!keywordList.length) return alert("No data available.");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(12);

    doc.text(`FetScr Results ${query ? `for: "${query}"` : ""}`, 14, 15);

    const tableColumn = ["#"].concat(keywordList);
    const maxRows = Math.max(...keywordList.map(k => results[k].length || 0));
    const tableRows = [];

    for (let i = 0; i < maxRows; i++) {
      const row = [i + 1];
      for (const kw of keywordList) {
        const item = results[kw][i];
        if (item)
          row.push(`${item.title || ""}\n${item.link || ""}`);
        else row.push("-");
      }
      tableRows.push(row);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save("fetscr_results.pdf");
  };

  // ------------------ RENDER ------------------
  if (!keywordList.length) {
    return (
      <div className="results-page">
        <p>No results to show. Try a new search.</p>
        <button onClick={() => navigate("/")}>Back to search</button>
      </div>
    );
  }

  // ------------------ TABLE DISPLAY ------------------
  return (
    <div className="results-page">
      <div className="results-header">
        <h2>
          Results {query ? `for: "${query}"` : ""} ({keywordList.length} keywords)
        </h2>
        <div className="results-actions-row">
          <button className="results-btn" onClick={downloadCSV}>
            Download CSV
          </button>
          <button className="results-btn recommended" onClick={downloadPDF}>
            Download PDF <span className="pdf-recommended-label">(Recommended)</span>
          </button>
          <button className="results-btn" onClick={() => navigate("/home")}>
            New Search
          </button>
        </div>
      </div>

      <div ref={tableRef} className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              {keywordList.map((kw, i) => (
                <th key={i}>{kw}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({
              length: Math.max(...keywordList.map(k => results[k].length)),
            }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                <td>{rowIdx + 1}</td>
                {keywordList.map((kw, colIdx) => {
                  const item = results[kw][rowIdx];
                  return (
                    <td key={colIdx}>
                      {item ? (
                        <>
                          <div><strong>{item.title}</strong></div>
                          <div className="snippet">{item.snippet}</div>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer">
                              Visit
                            </a>
                          )}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
