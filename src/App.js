import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import './App.css';
import ExperimentalPage from './ExperimentalPage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {

  const [currentPage, setCurrentPage] = useState(0);
  const totalDatasets = 20; // Total number of datasets
  const [allScatterplotData, setAllScatterplotData] = useState([]);
const [allScatterplotImages, setAllScatterplotImages] = useState([]);

const addScatterplotData = (data) => {
  setAllScatterplotData(prevData => [...prevData, data]);
};

// ... rest of your component code



const downloadAllData = () => {
  const zip = new JSZip();

  // Add each scatterplot image and clustering data to the ZIP file
  allScatterplotData.forEach((data, index) => {
    // Add the image
    const imgData = data.image;
    if (imgData) {
      zip.file(`scatterplot_${index + 1}.png`, imgData.split(',')[1], {base64: true});
    }

    // Add the clustering data as a JSON file
    const clusteringDataStr = JSON.stringify(data.clusteringData, null, 2);
    zip.file(`clusteringData_${index + 1}.json`, clusteringDataStr);
  });

  // Generate the ZIP file and trigger the download
  zip.generateAsync({ type: "blob" }).then(content => {
    saveAs(content, "experiment_data.zip");
  });
};



  // Define the handleNext function if needed for navigation
  const handleNext = () => {
    setCurrentPage(currentPage + 1);
  };

  const WelcomePage = ({ onNext }) => (
    <div>
      <h1>Welcome to the Clustering Experiment Demo</h1>
      <p>Here you will be clustering scatterplots to judge which points seem to belong to a group and which points seem to be outliers. Keep in mind! This is an experiment based on the variability of human perception, so there is no absolute answer!</p>
      <button onClick={onNext}>Next</button>
    </div>
  );

  const ClusterOutlierInfoPage = ({ onNext }) => (
    <div>
      <h1>What is a cluster and an Outlier?</h1>
      <p>[Brief description of what a cluster is]</p>
      {/* Insert images for cluster examples */}
      <p>[Brief description of what an outlier is]</p>
      {/* Insert images for outlier examples */}
      <button onClick={onNext}>Next</button>
    </div>
  );

  const ClusteringInstructionsPage = ({ onNext }) => (
    <div>
      <h1>How should I cluster?</h1>
      <p>First you'll see a monochrome scatterplot, your task is to try to use your best estimate to lasso and select clusters...</p>
      {/* Further instructions */}
      <button onClick={onNext}>Start Experiment</button>
    </div>
  );

  const ThankYouPage = () => (
    <div>
      <h1>Thank You!</h1>
      <p>Thank you for participating in our clustering experiment.</p>
      <button onClick={downloadAllData}>Download Results</button>
    </div>
  );
  useEffect(() => {
    if (currentPage === 3 + totalDatasets) {
      downloadAllData();
    }
  }, [currentPage, totalDatasets]);
  useEffect(() => {
    const updateMarginContentWidth = () => {
      const experimentContent = document.querySelector('.experimentContent');
      if (experimentContent) {
        const offsetLeft = experimentContent.offsetLeft;
        const leftMarginContent = document.querySelector('.leftMarginContent');
        if (leftMarginContent) {
          leftMarginContent.style.width = `${offsetLeft-5}px`;
        }
      }
    };
  
    // Initial update
    updateMarginContentWidth();
  
    // Update on window resize
    window.addEventListener('resize', updateMarginContentWidth);
  
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateMarginContentWidth);
    };
  }, []);
  
  
  
  
  

  const pageStyles = {
    textAlign: 'center',
    marginTop: '50px',
    padding: '20px',
};

const paragraphStyles = {
    fontSize: '18px',
    lineHeight: '1.6',
    maxWidth: '800px',
    margin: 'auto',
    textAlign: 'justify',
};

const buttonStyles = {
    backgroundColor: '#4CAF50', // Green color
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    marginTop: '20px',
    marginRight: '10px'
};

// Page rendering based on currentPage state

const renderPage = () => {
  if (currentPage >= 3 && currentPage < 3 + totalDatasets) {
      const taskType = currentPage % 2 === 1 ? " Fine-grained " : " Coarse-grained ";
      return (
        <div className="experimentLayout">
        <div className="leftMarginContent">
            <h3>Scatterplot #{Math.ceil((currentPage - 2) / 2)}</h3>
            
            <h4>Definitions:</h4>
            <p><strong>Fine-grained:</strong> Clearly distinguished clusters and outliers, higher number of clusters.</p>
            <p><strong>Coarse-grained:</strong> More spread out and less defined clusters, fewer distinct groupings.</p>
            <h4>Additional Instructions:</h4>
            
                <li>
                  If you believe a point is an <strong>outlier</strong>, exclude them from any clusters and leave them <strong>black</strong>.
                </li>
                <p> </p>
                <li>
                  If you believe the <strong>entire scatterplot</strong> is a coarse-grained cluster, feel free to select the entire scatterplot.
                </li>
                <p> </p>
                <li>
                  Remember, once you select <strong>'Next'</strong> and confirm moving to the next scatterplot, <strong>you will not be able to go back</strong>.
                </li>
                <p> </p>
                <li>
                  Keep in mind that human perception of clusters is <strong>subjective</strong>, your judgment is as good as any!
                </li>
            
        </div>
              <div className="experimentContent">
              <h2 className="taskDescription">
  Task:   
  <strong style={{ color: taskType === " Fine-grained " ? "#007bff" : "#28a745" }}>
    {taskType}
  </strong> 
  clusters 
  (<strong style={{ color: taskType === " Fine-grained " ? "#007bff" : "#28a745" }}>
    {taskType === " Fine-grained " ? "High" : "Low"}
  </strong> Granularity)
</h2>

        
            <ExperimentalPage 
                datasetNumber={currentPage - 2} 
                onPrevious={() => setCurrentPage(currentPage - 1)} 
                onNext={() => setCurrentPage(currentPage + 1)}
                addScatterplotData={addScatterplotData} 
            />
        
    </div>
</div>
    );
  }
    switch (currentPage) {
        case 0:
            return (
              <div style={pageStyles}>
              <h1>Welcome to the Cluster Granularity Experiment</h1>
              <p style={paragraphStyles}>
                  In this experiment, we delve into the perceptions of cluster granularity within scatterplots. Your task involves clustering the same scatterplot twice: once identifying clusters that you perceive as fine-grained, and then again for those you see as coarse-grained. This dual approach will provide insights into varying interpretations of cluster granularity.
              </p>
              <button style={buttonStyles} onClick={() => setCurrentPage(1)}>Next</button>
          </div>
          
            );

            case 1:
              return (
                  <div style={pageStyles}>
                      <h1>So, What is Cluster Granularity?</h1>
                      <p style={paragraphStyles}>
                          <b>Cluster Granularity</b> can be defined as the degree of distinctiveness and resolution 
                          in the grouping of data points within a visualization. In other words, higher granularity 
                          indicates a greater number of <b>finely divided</b> and <b>clearly distinguishable clusters and outliers</b>.
                      </p>
                      <div>
                          <img src="Image A.png" alt="Scatterplot A" style={{ width: '50%', height: 'auto' }} />
                      </div>
                      <p style={paragraphStyles}>In this example, most people will claim that scatterplot A is more fine-grained than scatterplot B because the clusters are <b>clearly distinguishable</b>.</p>
                      <div>
                      <img src="Image B.png" alt="Scatterplot B" style={{ width: '50%', height: 'auto' }} />
                      </div>
                      <p style={paragraphStyles}>And in this example, most people will claim that scatterplot B is more fine-grained than scatterplot A because there are <b>more numbers</b> of finely divided clusters!</p>
                      <button style={buttonStyles} onClick={() => setCurrentPage(0)}>Previous</button>
                      <button style={buttonStyles} onClick={() => setCurrentPage(2)}>Next</button>
                  </div>
              );
              case 2:
                return (
                    <div style={pageStyles}>
                        <h1>Task Instruction</h1>
                        <p style={paragraphStyles}>
                            In this experiment, you will be shown a <strong>single scatterplot</strong> twice. Your task is to cluster the scatterplot in two ways: <strong>fine-grained (high granularity)</strong> and <strong>coarse-grained (low granularity)</strong>.
                        </p>
                        <p style={paragraphStyles}>
                            A <strong>high granularity (fine-grained) scatterplot</strong> typically exhibits:
                            <ol>
                                <li><strong>Clearly distinguished clusters and outliers.</strong></li>
                                <li><strong>A higher number of these clusters.</strong></li>
                            </ol>
                        </p>
                        <p style={paragraphStyles}>
                            Conversely, a <strong>low granularity (coarse-grained) scatterplot</strong> usually has:
                            <ol>
                                <li><strong>More spread out and less defined Clusters.</strong></li>
                                <li><strong>Fewer distinct groupings.</strong></li>
                            </ol>
                        </p>
                        <p style={paragraphStyles}>
                            Here is an example of a single scatterplot clustered in both a <strong>high granular (fine-grained)</strong> and <strong>low granular (coarse-grained)</strong> manner:
                            {/* Insert example image here */}
                        </p>
                        <div>
                      <img src="Image D.png" alt="Scatterplot B" style={{ width: '50%', height: 'auto' }} />
                      </div>
                     
                        <button style={buttonStyles} onClick={() => setCurrentPage(1)}>Previous</button>
                        <button style={buttonStyles} onClick={() => setCurrentPage(2.5)}>Next</button>
                    </div>
                );       
                case 2.5:
                  return (
                      <div style={pageStyles}>
                          <h1>Clustering Instruction</h1>

                          <p style={paragraphStyles}>
                              You will be clustering using the <strong>lasso tool</strong>. Feel free to use the <strong>'Clear'</strong> button, which clears all selections, and the <strong>'Undo'</strong> button, which undoes the last selection.
                          </p>
                          <div>
                      <img src="Image E.png" alt="Scatterplot B" style={{ width: '30%', height: 'auto' }} />
                      </div>
                      <h2>Additional Information for Clustering</h2>
  <ul style={paragraphStyles}>
    <li>
      If you believe a point is an <strong>outlier</strong>, exclude them from any clusters and leave them <strong>black</strong>.
    </li>
    <li>
      If you believe the <strong>entire scatterplot</strong> is a coarse-grained cluster, then feel free to select the entire scatterplot.
    </li>
  <li>
    Remember, once you select <strong>'Next'</strong> and confirm moving to the next scatterplot, <strong>you will not be able to go back</strong>.
  </li>
  <li>
  Keep in mind that human perception of clusters is subjective, so there is no absolute answer!
  </li>
  </ul>
  <p style={paragraphStyles}>
    Good luck!
  </p>
                          <button style={buttonStyles} onClick={() => setCurrentPage(2)}>Previous</button>
                          <button style={buttonStyles} onClick={() => setCurrentPage(3)}>Start Experiment</button>
                      </div>
                  );        
        

      case currentPage === 3 + totalDatasets:
       
      default:
        return <ThankYouPage />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;