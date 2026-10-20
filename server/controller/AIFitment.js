const axios = require("axios");
const { ObjectId } = require("mongodb");
const formidable = require("formidable");
const fs = require("fs");
const FormData = require("form-data");
const aiRequestModel = require("../models/AIRequests");

function formatTimeTaken(ms) {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds} sec`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remSeconds = seconds % 60;
    return remSeconds ? `${minutes} min ${remSeconds} sec` : `${minutes} min`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remMinutes = Math.floor((seconds % 3600) / 60);
    return remMinutes ? `${hours} hr ${remMinutes} min` : `${hours} hr`;
  }
}
const controller = {
  async analyseCandidate(req, res) {
    try {
      // const { userId, jobId, candidateId } = req.params;
      const requestTime = new Date();

      const form = formidable({
        multiples: true,
        keepExtensions: true,
        useTempFiles: true,
      });
      await form.parse(req, async (err, fields, files) => {
        if (!files.file) {
          res.status(400).json({ message: "No file uploaded", status: false });
          return; // Return early to avoid further processing
        } else if (err) {
          console.error(err); // Log the error for debugging purposes
          res
            .status(500)
            .json({ message: "Internal Server Error", status: false });
          return; // Return early on error
        } else {
          const { jobDetails } = fields;
          console.log(fields);

          //application/msword
          //application/vnd.openxmlformats-officedocument.wordprocessingml.document
          try {
            let formData = new FormData();
            formData.append("file", fs.createReadStream(files.file.filepath));
            const { data } = await axios.post(
              `${process.env.AI_URL}/parse_resume`,
              formData,
              { headers: { ...formData.getHeaders() } }
            );
            // console.log(data);
            const parsedData = data;
            const responseTime1 = new Date();
            const timeTaken1 = responseTime1 - requestTime;
            const storeResponse = await aiRequestModel.create({
              apiRoute: req.originalUrl,
              aiRoute: "/parse_resume",
              request: files.file.filepath,
              response: data,
              version: "1.1.0",
              requestTime,
              responseTime: responseTime1,
              timeTaken: formatTimeTaken(timeTaken1),
            });
            // console.log(parsedData);
            // console.log(data);
            const userDetails = {
              basic_info: {
                full_name: parsedData?.basic_info?.full_name,
                email: parsedData?.basic_info?.email,
                // City: parsedData?.basic_info?.Country,
                Country: parsedData?.basic_info?.Country,
                // Province: applicant.state,
                Experience_in_Years:
                  parsedData?.basic_info?.Experience_in_Years,
                Experience_level: parsedData?.basic_info?.Experience_level,
                Job_Title: parsedData?.basic_info?.Job_Title,
              },
              education: parsedData?.Education,
              work_experience: parsedData?.work_experience,
              skills: parsedData?.skills,
            };
            let body = {
              job_description: jobDetails,
              candidate_info: userDetails,
            };
            // console.log(body);
            const requestTime2 = new Date();
            let requestbody = {
              job_description: JSON.parse(jobDetails),
              candidate_info: userDetails,
            };
            const response = await axios.post(
              `${process.env.AI_URL}/fitment_analysis`,
              body
            );

            // console.log(response.data);
            const responseTime2 = new Date();
            const timeTaken2 = responseTime2 - requestTime2;
            const storeResponse2 = await aiRequestModel.create({
              apiRoute: req.originalUrl,
              aiRoute: "/fitment_analysis",
              request: requestbody,
              response: response.data,
              version: "1.1.0",
              requestTime: requestTime2,
              responseTime: responseTime2,
              timeTaken: formatTimeTaken(timeTaken2),
            });
            res.status(200).json({
              message: "Fitment Analysis Completed",
              status: true,
              data: response.data,
            });
          } catch (axiosError) {
            console.log("Error in resumeParserAI function:", axiosError);
            res
              .status(500)
              .json({ message: "Internal Server Error", status: false });
          }
        }
      });
      // let body = {
      //   job_description: jobDetails,
      //   candidate_info: userDetails,
      // };
      // console.log(body);

      // const { data } = await axios.post(
      //   `${process.env.AI_URL}/fitment_analysis`,
      //   body
      // );
      // console.log(data);
      // res
      //   .status(200)
      //   .json({ message: "Fitment Analysis Completed", status: true, data });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ message: "Internal Server Error", error, status: false });
    }
  },
};
module.exports = controller;
