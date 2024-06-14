'use client';

import readXlsxFile from "read-excel-file";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Chart from "chart.js/auto";

export default function Home() {
  const [results, setResults] = useState({});
  const [searchedHTNO, setSearchedHTNO] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null); // State to store analysis result
  const [subjectWiseAnalysis, setSubjectWiseAnalysis] = useState({}); // State to store subject-wise analysis

  useEffect(() => {
    // Create chart when analysisResult changes
    if (analysisResult) {
      const ctx = document.getElementById("resultChart");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Passed", "Failed"],
          datasets: [
            {
              label: "Number of Students",
              data: [analysisResult.passedCount, analysisResult.failedCount],
              backgroundColor: ["green", "red"],
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [analysisResult]);

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    Promise.all(
      Array.from(fileList).map((file) => readXlsxFile(file))
    ).then((fileRowsList) => {
      const allResults = {};
      fileRowsList.forEach((fileRows, index) => {
        const studentsResults = fileRows.slice(3);
        const resultsDictionary = studentsResults.reduce((acc, student) => {
          const htno = student[0];
          const result = {
            subject_code: student[1],
            subject_name: student[2],
            internal_marks: student[3],
            external_marks: student[4],
            total_marks: student[5],
            grade: student[6],
            grade_points: student[7], // Make sure grade_points are included
            credits: student[8],
          };

          if (acc[htno]) {
            acc[htno].push(result); // Push the result to the existing array for the roll number
          } else {
            acc[htno] = [result]; // Create a new array for the roll number
          }
          return acc;
        }, {});

        // Merge the current results with the existing results
        Object.entries(resultsDictionary).forEach(([htno, studentResults]) => {
          if (allResults[htno]) {
            allResults[htno] = [...allResults[htno], ...studentResults];
          } else {
            allResults[htno] = studentResults;
          }
        });
      });

      setResults(allResults);
    });
  };

  const handleSearch = () => {
    if (searchedHTNO && results[searchedHTNO]) {
      setResults({ [searchedHTNO]: results[searchedHTNO] });
    } else {
      alert("Result not found for the entered Hall Ticket Number.");
    }
  };

  // Function to calculate SGPA
  function calculateSGPA(studentResults) {
    let totalGradePoints = 0;
    let totalCredits = 0;

    studentResults.forEach((result) => {
      // Check if the grade is not "F" before calculating SGPA
      if (result.grade !== "F") {
        const gradePoints = parseFloat(result.grade_points);
        const credits = parseInt(result.credits);

        totalGradePoints += gradePoints * credits; //0*1
        totalCredits += credits; //1
      }
    });

    // Calculate SGPA only if totalCredits is greater than 0
    if (totalCredits > 0) {
      const SGPA = totalGradePoints / totalCredits;
      return SGPA.toFixed(2); // Round to 2 decimal places
    } else {
      return "N/A"; // Return "N/A" if totalCredits is 0
    }
  }

  // Function to handle editing marks
  const handleEditMarks = (htno, index, field, newValue) => {
    const updatedResults = { ...results };
    updatedResults[htno][index][field] = newValue;
    setResults(updatedResults);
  };

  // Function to perform result analysis
  const handleResultAnalysis = () => {
    // Initialize an object to store subject-wise analysis
    const subjectWiseAnalysis = {};

    // Iterate over each student's results
    Object.values(results).forEach((studentResults) => {
      studentResults.forEach((result) => {
        // Get the subject code
        const subjectCode = result.subject_code;

        // Check if the subject code exists in the analysis object, if not, initialize it
        if (!subjectWiseAnalysis[subjectCode]) {
          subjectWiseAnalysis[subjectCode] = {
            passedCount: 0,
            failedCount: 0,
            totalCount: 0,
          };
        }

        // Increment the total count for the subject
        subjectWiseAnalysis[subjectCode].totalCount++;

        // Check if the student passed or failed
        if (result.grade !== "F") {
          subjectWiseAnalysis[subjectCode].passedCount++;
        } else {
          subjectWiseAnalysis[subjectCode].failedCount++;
        }
      });
    });

    // Update the subject-wise analysis state
    setSubjectWiseAnalysis(subjectWiseAnalysis);

    // Calculate overall analysis result
    const passedCount = Object.values(results).filter(studentResults =>
      studentResults.every(result => result.grade !== "F")
    ).length;
    const totalCount = Object.keys(results).length;
    const failedCount = totalCount - passedCount;

    // Update the overall analysis result state
    setAnalysisResult({ passedCount, failedCount });
  };

  return (
    <>
      <h1 className="text-center font-bold text-xl my-4">JNTUH UCES RESULTS ANALYZER</h1>
      <div className="w-full flex justify-center mb-8">
        <div className={`md:w-[1000px] text-center items-center gap-1.5 py-12 border border-white rounded flex justify-center ${Object.keys(results).length == 0 ? "" : "hidden"}`}>
          <label htmlFor="files">Please Select or Drag the Excel file(s) here</label>
          <input
            type="file"
            className="text-center h-[100px] items-center hidden"
            onChange={handleFileChange}
            placeholder="Please Select the Excel file(s) here"
            id="files"
            multiple // Allow multiple files to be selected
          />
        </div>
      </div>
      <div className="w-full flex justify-center mb-4">
        <div className="md:w-[1000px] text-center items-center gap-1.5 py-2 border border-white rounded flex justify-center">
          <Input
            type="text"
            className="h-10 w-[300px] px-3"
            placeholder="Enter Hall Ticket Number"
            value={searchedHTNO}
            onChange={(e) => setSearchedHTNO(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      {/* Button for result analysis */}
      <div className="flex justify-center mt-4">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleResultAnalysis}
        >
          Perform Result Analysis
        </button>
      </div>

      {/* Render results for each student */}
      {Object.entries(results).map(([htno, studentResults], index) => (
        <div key={index} className="mb-4 border-2 border-white">
          <table className="w-full border border-white">
            <tbody>
              <tr className="w-full">
                <th className="w-[75%]">Hall Ticket No</th>
                <th>{htno}</th>
              </tr>
            </tbody>
          </table>
          <table className="border border-white">
            <tbody>
              <tr>
                <th className="dark:border-white px-1">SUBJECT_CODE</th>
                <th className="dark:border-white px-1">SUBJECT_NAME</th>
                <th className="dark:border-white px-1">INTERNAL</th>
                <th className="dark:border-white px-1">EXTERNAL</th>
                <th className="dark:border-white px-1">TOTAL</th>
                <th className="dark:border-white px-1">GRADE</th>
                <th className="dark:border-white px-1">GRADE_POINTS</th>
                <th className="dark:border-white px-1">CREDITS</th>
              </tr>
              {studentResults.map((result, index) => (
                <tr key={index}>
                  <th>{result["subject_code"]}</th>
                  <th>{result["subject_name"]}</th>
                  <th>
                    <Input
                      type="text"
                      value={result["internal_marks"]}
                      readOnly
                    />
                  </th>
                  <th>
                    <Input
                      type="text"
                      value={result["external_marks"]}
                      readOnly
                    />
                  </th>
                  <th>
                    <Input
                      type="text"
                      value={result["total_marks"]}
                      onChange={(e) =>
                        handleEditMarks(
                          htno,
                          index,
                          "total_marks",
                          e.target.value
                        )
                      }
                    />
                  </th>
                      <th>
              <Input
                type="text"
                value={result["grade"]}
                onChange={(e) =>
                  handleEditMarks(
                    htno,
                    index,
                    "grade",
                    e.target.value
                  )
                }
              />
            </th>
                  <th>
                    <Input
                      type="text"
                      value={result["grade_points"]}
                      onChange={(e) =>
                        handleEditMarks(
                          htno,
                          index,
                          "grade_points",
                          e.target.value
                        )
                      }
                    />
                  </th>
                  <th>
                    <Input
                      type="text"
                      value={result["credits"]}
                      readOnly
                    />
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {studentResults.every((result) => result.grade !== "F") && ( // Check if all grades are not "F"
              <div>
                <Label className="dark:border-white">SGPA:</Label>
                <span>{calculateSGPA(studentResults)}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Display subject-wise analysis */}
      <div className="text-center mt-4">
        <h2 className="text-lg font-bold mb-2">Subject-wise Analysis</h2>
        <table className="border border-white mx-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Subject Code</th>
              <th className="px-4 py-2">Passed</th>
              <th className="px-4 py-2">Failed</th>
              <th className="px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(subjectWiseAnalysis).map(([subjectCode, analysis], index) => (
              <tr key={index}>
                <td className="border border-white px-4 py-2">{subjectCode}</td>
                <td className="border border-white px-4 py-2">{analysis.passedCount}</td>
                <td className="border border-white px-4 py-2">{analysis.failedCount}</td>
                <td className="border border-white px-4 py-2">{analysis.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Display analysis result */}
      <div className="text-center mt-4">
        <canvas id="resultChart" width="200" height="200"></canvas>
      </div>

      <footer className="text-center font-bold text-xl my-4">
        <p>&copy; 2024 JNTUH UCES RESULTS ANALYZER. All rights reserved.</p>
        <p className="mt-4 block text-left mx-[18%] text-center mb-4 text-[75%] sm:text-[100%]">
          Made with ❤ by &nbsp;
          <a target="_blank" rel="noreferrer" href="https://github.com/vikas83pal/" className="underline underline-offset-1">Vikas Pal</a>
        </p>
        
      </footer>
    </>
  );
}
