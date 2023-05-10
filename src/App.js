import React, { useState } from 'react';
import * as d3 from 'd3';
import * as FileSaver from 'file-saver';
import "./App.css";

function App() {
  const [histogramData, setHistogramData] = useState(null);

  const handleSubmit = async () => {
    const response = await fetch('https://www.terriblytinytales.com/test.txt');
    const text = await response.text();

    const words = text.toLowerCase().match(/\b\w+\b/g);

    const wordCounts = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

    const sortedWordCounts = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const data = sortedWordCounts.map(([word, count]) => ({ word, count }));

    setHistogramData(data);
  };

  const handleExport = () => {
    const csvContent = `data:text/csv;charset=utf-8,${histogramData
      .map((item) => `${item.word},${item.count}`)
      .join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, 'histogram_data.csv');
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      {histogramData && (
        <div>
          <svg width={600} height={400}>
            <g transform="translate(50,50)">
              <g className="axis" ref={(el) => d3.select(el).call(d3.axisLeft(yScale))} />
              {histogramData.map((d, i) => (
                <rect
                  key={i}
                  x={0}
                  y={yScale(d.word)}
                  width={xScale(d.count)}
                  height={yScale.bandwidth()}
                />
              ))}
              {histogramData.map((d, i) => (
                <text
                  key={i}
                  x={xScale(d.count) + 10}
                  y={yScale(d.word) + yScale.bandwidth() / 2}
                  dominantBaseline="middle"
                >
                  {d.count}
                </text>
              ))}
            </g>
          </svg>
          <button onClick={handleExport}>Export</button>
        </div>
      )}
    </div>
  );
}

const yScale = d3
  .scaleBand()
  .padding(0.1)
  .domain(Array.from({ length: 20 }, (_, i) => i + 1).reverse().map(String))
  .range([50, 350]);

const xScale = d3.scaleLinear().range([0, 500]);

export default App;