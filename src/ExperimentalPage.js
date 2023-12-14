import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';


function ExperimentalPage({ onPrevious, onNext, datasetNumber,addScatterplotData }) {
  const [data, setData] = useState([]); 

  const [currentClusterIndex, setCurrentClusterIndex] = useState(0); // Track the current cluster index
  const [undoStack, setUndoStack] = useState([]);
  const [selectedPointsDisplay, setSelectedPointsDisplay] = useState([]);
  const [clusterCount, setClusterCount] = useState(0);
  
  const buttonStyles = {
    backgroundColor: '#4CAF50', // Green color
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    marginTop: '1px',
    marginRight: '10px'
};

const NextStyles = {
  backgroundColor: '#000000', // Green color
  color: 'white',
  padding: '10px 20px',
  fontSize: '16px',
  borderRadius: '5px',
  cursor: 'pointer',
  border: 'none',
  marginTop: '1px',
  marginLeft: '30px'
};



  const [overallSizeFactor, setOverallSizeFactor] = useState(1); // Default to 1 (no scaling)

  let currentlyLassoedPoints = new Set();
  const captureScatterplot = async () => {
    const scatterplotElement = document.getElementById('scatterplot');
    const svgElement = scatterplotElement.querySelector('svg');
  
    if (!scatterplotElement || !svgElement) {
      console.error('Scatterplot or SVG element not found');
      return;
    }
  
    const svgRect = svgElement.getBoundingClientRect();
    const lassoableWidth = window.innerWidth * 0.8;
    const lassoableHeight = window.innerHeight * 0.8;
    const leftMargin = (window.innerWidth - lassoableWidth) / 2;
    const xMiddle = lassoableWidth / 2;
    const yMiddle = lassoableHeight / 2;
    
  
    const options = {
      scale: window.devicePixelRatio, // Adjust for high resolution screens
      useCORS: true,
      logging: false, // Set to false in production
      width: 1000, // Use the width from getBoundingClientRect
      height: svgRect.height+50, // Use the height from getBoundingClientRect
      x: svgRect.left+leftMargin-5,
      y: svgRect.top-5,// Use the top position from getBoundingClientRect
      // Ensure the capture area does not extend beyond the window's dimensions
      windowWidth: svgRect.width + svgRect.left,
      windowHeight: svgRect.height + svgRect.top
    };
  
    console.log('Element dimensions:', scatterplotElement.offsetWidth, scatterplotElement.offsetHeight);
    console.log('Computed options for html2canvas:', options);
    
    try {
      const canvas = await html2canvas(scatterplotElement, options);
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing the scatterplot:', error);
    }
  };
  
  


  const [xScaleFactor, setXScaleFactor] = useState(1); // Default x-scale factor
const [yScaleFactor, setYScaleFactor] = useState(1); // Default y-scale factor

const handleXScaleChange = (event) => {
  setXScaleFactor(+event.target.value);
};
const confirmAndProceed = async () => {
  const isConfirmed = window.confirm("If you proceed, you will not be able to go back. Do you confirm?");
  if (isConfirmed) {
    const image = await captureScatterplot();
    const clusteringData = getClusteringData();
    // Pass the captured data to the parent component for later download
    addScatterplotData({ 
      clusteringData, 
      image, 
      datasetNumber 
    });

    // Reset cluster count to 0 and reset color to first color in Tab20
    setClusterCount(0);
    setCurrentClusterIndex(0); // Reset the currentClusterIndex to start from the first Tab20 color

    onNext();
  }
};
const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadTextFile = (text, filename) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
};
const getClusteringData = () => {
  // Create an object to hold data for each cluster
  const clusteringData = {};

  // Iterate over each data point
  data.forEach((point, index) => {
    // Check the cluster property of each point
    if (point.cluster !== -1) {
      // If the cluster property is set, add the point to the corresponding cluster in clusteringData
      if (!clusteringData[point.cluster]) {
        clusteringData[point.cluster] = { points: [], clusterIndex: point.cluster };
      }
      clusteringData[point.cluster].points.push({ x: point[0], y: point[1], pointIndex: index });
    }
  });

  

  // Convert the clusteringData object into an array format, if desired
  const clusteringDataArray = Object.values(clusteringData);

  // Return the clustering data
  return clusteringDataArray;
};



const handleYScaleChange = (event) => {
  setYScaleFactor(+event.target.value);
};

  const [pointSize, setPointSize] = useState(4); // Default point size


const handlePointSizeChange = (event) => {
  setPointSize(+event.target.value);
};



const fetchData = async () => {
  const filename = `pickedpoints/${datasetNumber}.json`;
  const response = await fetch(`${process.env.PUBLIC_URL}/${filename}`);
  const data = await response.json();
  return data.map(d => ({ ...d, cluster: -1 })); // Initialize with no cluster (-1)
};

useEffect(() => {
  fetchData().then(data => {
    setData(data);
  });
}, [datasetNumber]); 

useEffect(() => {
  renderScatterplot();
}, [data, pointSize, xScaleFactor, yScaleFactor, overallSizeFactor]);

  
  const renderScatterplot = () => {
    d3.select("#scatterplot").selectAll("*").remove();

    // Define the lassoable area dimensions as 80% of the screen
    const lassoableWidth = 800
    const lassoableHeight =600;
    const leftMargin = (window.innerWidth - lassoableWidth) / 2;
    const xMiddle = lassoableWidth / 2;
    const yMiddle = lassoableHeight / 2;

    // SVG container matching the lassoable area dimensions
    const svgWidth = lassoableWidth;
    const windowWidth = window.innerWidth;
    
    const svg = d3.select("#scatterplot")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", lassoableHeight)
      .style("position", "center")
      

    // Add a border to the lassoable area
    svg.append("rect")
     .attr("width", lassoableWidth)
     .attr("height", lassoableHeight)
     .attr("stroke", "black")
     .attr("stroke-width", 2)
     .attr("fill", "none");


  
    const xExtent = d3.extent(data, d => d[0]);
    const yExtent = d3.extent(data, d => d[1]);

    const xRange = xExtent[1] - xExtent[0];
    const yRange = yExtent[1] - yExtent[0];

    const xPadding = xRange * 0.1; // 10% of the range
    const yPadding = yRange * 0.1; // 10% of the range

    const xDomain = [xExtent[0] - xPadding, xExtent[1] + xPadding];
    const yDomain = [yExtent[0] - yPadding, yExtent[1] + yPadding];

 // Scale adjustments for the lassoable area
 const xScale = d3.scaleLinear()
                     .domain(xDomain)
                     .range([xMiddle - (lassoableWidth / 2) * xScaleFactor, xMiddle + (lassoableWidth / 2) * xScaleFactor]);
    const yScale = d3.scaleLinear()
                     .domain(yDomain)
                     .range([yMiddle - (lassoableHeight / 2) * yScaleFactor, yMiddle + (lassoableHeight / 2) * yScaleFactor]);

    let lassoPath = [];
    let isLassoing = false;
    let lassoArea = svg.append("polygon")
                        .attr("fill", "blue")
                        .attr("fill-opacity", 0.3)
                        .attr("stroke", "blue")
                        .attr("stroke-width", 1.5);
    const updateLasso = (path) => {
      lassoArea.attr("points", path.join(" "));
      highlightPoints(path);
    };

    const updateLassoSelection = (lassoPath) => {
      data.forEach((d, i) => {
        if (isPointInsidePolygon([xScale(d[0]), yScale(d[1])], lassoPath)) {
          currentlyLassoedPoints.add(i);
        }
      });
    };
    
    const highlightPoints = () => {
      svg.selectAll("circle")
        .attr("fill", (d, i) => {
          if (d.cluster !== -1) return getPointColor(d);
          return currentlyLassoedPoints.has(i) ? "red" : "black";
        });
    };
    
    

    svg.on("mousedown", function(event) {
      isLassoing = true;
      lassoPath = [d3.pointer(event)];
      updateLasso(lassoPath);
    });

    svg.on("mousemove", function(event) {
      if (!isLassoing) return;
      lassoPath.push(d3.pointer(event));
      updateLasso(lassoPath);
      updateLassoSelection(lassoPath);
      highlightPoints(); // Call highlightPoints here to update the color
    });
    
    svg.on("mouseup", function() {
      isLassoing = false;
      let addedToCluster = false;
    
      // Update the data to assign clusters based on the currentlyLassoedPoints set
      const updatedData = data.map((d, i) => {
        // Assign to the new cluster if the point is in currentlyLassoedPoints and not already clustered
        if (currentlyLassoedPoints.has(i) && d.cluster === -1) {
          addedToCluster = true;
          return { ...d, cluster: currentClusterIndex };
        }
        return d;
      });
    
      if (addedToCluster) {
        setData(updatedData);
        setCurrentClusterIndex(currentClusterIndex + 1); // Increment cluster index for next selection
        setUndoStack([...undoStack, data]);
        setSelectedPointsDisplay(updatedData.filter(d => d.cluster === currentClusterIndex));
        setClusterCount(clusterCount + 1);
      }
    
      lassoPath = [];
      lassoArea.attr("points", "");
      currentlyLassoedPoints.clear(); // Clear the set for the next lasso operation
      renderScatterplot(); // Re-render scatterplot to update colors
    });
    
    const tab10Colors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
    ];
    const getPointColor = (point) => {
      return point.cluster === -1 ? "black" : tab10Colors[point.cluster % tab10Colors.length];
    };
const containerCenterX = window.innerWidth * 0.8 / 2;
const containerCenterY = window.innerHeight * 0.8 / 2;


svg.selectAll("circle")
   .data(data)
   .enter()
   .append("circle")
   .attr("cx", d => (xScale(d[0]) - containerCenterX) * overallSizeFactor + containerCenterX)
   .attr("cy", d => (yScale(d[1]) - containerCenterY) * overallSizeFactor + containerCenterY)
   .attr("r", pointSize * overallSizeFactor) // Scale the point size as well
   .attr("fill", d => getPointColor(d));

};



function isPointInsidePolygon(point, poly) {
  const containerCenterX = window.innerWidth * 0.8 / 2;
  const containerCenterY = window.innerHeight * 0.8 / 2;
  let scaledPoint = [
    (point[0] - containerCenterX) / overallSizeFactor + containerCenterX,
    (point[1] - containerCenterY) / overallSizeFactor + containerCenterY
  ];

  let x = scaledPoint[0], y = scaledPoint[1];
  
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    let xi = poly[i][0], yi = poly[i][1];
    let xj = poly[j][0], yj = poly[j][1];

    let intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
const undoLastSelection = () => {
  if (undoStack.length > 0) {
    const previousState = undoStack.pop();
    setData(previousState);
    setClusterCount(Math.max(0, clusterCount - 1)); // Decrease cluster count, ensuring it doesn't go below 0
    if (previousState.length > 0) {
      setCurrentClusterIndex(Math.max(...previousState.map(d => d.cluster)) + 1);
    } else {
      setCurrentClusterIndex(0);
    }
  }
};

const clearSelection = () => {
  const resetData = data.map(d => ({ ...d, cluster: -1 }));
  setData(resetData);
  setClusterCount(0);
  setCurrentClusterIndex(0);
  setUndoStack([]);
  setSelectedPointsDisplay([]);
};
return (
  <div>
    
    <div id="scatterplot"></div>
  {/*<div className="slider-controls">
    <label>
      Point Size:
      <input type="range" min="1" max="30" value={pointSize} onChange={handlePointSizeChange} />
    </label>
    <label>
  Overall Size:
  <input type="range" min="0.1" max="2" step="0.1" value={overallSizeFactor} onChange={e => setOverallSizeFactor(+e.target.value)} />
</label>

    <label>
  X Scale Factor:
  <input type="range" min="0.1" max="1" step="0.05" value={xScaleFactor} onChange={handleXScaleChange} />
</label>
<label>
  Y Scale Factor:
  <input type="range" min="0.1" max="1" step="0.05" value={yScaleFactor} onChange={handleYScaleChange} />
</label>

</div>*/}
    <div className="bottom-controls">
       <button style={buttonStyles} onClick={undoLastSelection} disabled={undoStack.length === 0}>Undo</button>
        <button style={buttonStyles} onClick={clearSelection}>Clear</button>
        <button style={NextStyles} onClick={confirmAndProceed}>Next</button>
        {/*<button onClick={onPrevious}>Previous</button>*/}
        <p>Number of Clusters: {clusterCount}</p>
      </div>
    </div>
  );
}


export default ExperimentalPage;