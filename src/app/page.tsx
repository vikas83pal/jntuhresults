"use client";

import readXlsxFile from "read-excel-file";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function Home() {
  const [results, setResults] = useState({});

  const handleFileChange = (event: any) => { //function
    const file = event.target.files[0];
    readXlsxFile(file).then((fileRows) => { //function
      const students_results = fileRows.slice(3);
      const resultsDictionary = students_results.reduce(
        (acc: any, student: any) => { //function
          const htno: string = student[0];
          const result = {
            subject_code: student[1],
            subject_name: student[2],
            internal_marks: student[3],
            external_marks: student[4],
            total_marks: student[5],
            grade: student[6],
            grade_points: student[7],
            credits: student[8],
          };

          if (acc[htno]) {  //function
            acc[htno].results.push(result); // Append the result to existing results array
          } else {
            acc[htno] = { htno, results: [result] }; // Create a new entry in the dictionary
          }
          return acc;
        },
        {},
      );

      setResults(resultsDictionary);
    });
  };

  return (
    <>
      <h1 className="text-center font-bold text-xl my-4">JNTUH UCES RESULTS ANALYZIER</h1>
      <div className="w-full flex justify-center mb-8">
        <div
          className={`md:w-[1000px]  text-center items-center gap-1.5 py-12 border border-white  rounded flex justify-center ${Object.keys(results).length == 0 ? "" : "hidden"}`}
        >
          <label htmlFor="files">
            Please Select or Drag the Excel file here
          </label>
          <Input
            type="file"
            className="text-center h-[100px] items-center hidden"
            onChange={handleFileChange}
            placeholder="Please Select the Excel file here"
            id="files"
          />
        </div>
      </div>
      {Object.values(results).map((detail: any, index: number) => {
        const htno = detail["htno"];
        const results = detail["results"];
        return (
          <div key={index} className="mb-4 border-2 border-white">
            <table className="w-full border border-white">
              <tbody>
                <tr className="w-full">
                  <th className="w-[75%]">Hall Ticket No</th>
                  <th>{htno}</th>
                </tr>
              </tbody>
            </table>
            <table className="border border-white ">
              <tbody>
                <tr>
                  <th className="dark:border-white px-1 ">SUBJECT_CODE</th>
                  <th className="dark:border-white px-1">SUBJECT_NAME</th>
                  <th className="dark:border-white px-1">INTERNAL</th>
                  <th className="dark:border-white px-1">EXTERNAL</th>
                  <th className="dark:border-white px-1">TOTAL</th>
                  <th className="dark:border-white px-1">GRADE</th>
                  <th className="dark:border-white px-1">CREDITS</th>
                </tr>
                {results.map((result: any, index: number) => {
                  return (
                    <tr key={index}>
                      <th>{result["subject_code"]}</th>
                      <th>{result["subject_name"]}</th>
                      <th>{result["internal_marks"]}</th>
                      <th>{result["external_marks"]}</th>
                      <th>{result["total_marks"]}</th>
                      <th>{result["grade"]}</th>
                      <th>{result["credits"]}</th>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
          </div>
        );
      })}
        <footer className="text-center font-bold text-xl my-4">
        <p>&copy; 2024 JNTUH UCES RESULTS ANALYZER. All rights reserved.</p>
        <p className="mt-4 block text-left mx-[18%] text-center mb-4 text-[75%] sm:text-[100%]">
                Made with ❤ by &nbsp;

                <a target="_blank" rel="noreferrer" href="https://github.com/vikas83pal/" className=" underline	underline-offset-1" >
                    Vikas Pal
                </a>

            </p>
            <p className="mt-4 block text-left mx-[18%] text-center mb-4 text-[75%] sm:text-[100%]">
                Collabrates: Aravind &nbsp;

                {/* <a target="_blank" rel="noreferrer" href="https://github.com/vikas83pal/" className=" underline	underline-offset-1" >
                    Aravind
                </a> */}

            </p>
            
            <p className="mt-4 block text-left mx-[18%] text-center mb-4 text-[75%] sm:text-[100%]">
               Vishnu &nbsp;

                {/* <a target="_blank" rel="noreferrer" href="https://github.com/vikas83pal/" className=" underline	underline-offset-1" >
                   Prasad
                </a> */}

            </p>
            <p className="mt-4 block text-left mx-[18%] text-center mb-4 text-[75%] sm:text-[100%]">
               Prasad &nbsp;

                {/* <a target="_blank" rel="noreferrer" href="https://github.com/vikas83pal/" className=" underline	underline-offset-1" >
                   Prasad
                </a> */}

            </p>
           
      </footer>
    </>
  );
}
