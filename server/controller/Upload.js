const candidateModel = require("../models/candidateModel");
const employerModel = require("../models/employerModel");
const Aws = require("aws-sdk");
const formidable = require("formidable");

const fs = require("fs");
const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // accessKeyId that is stored in .env file
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET, // secretAccessKey is also store in .env file
});

const controller = {
  async candidateImageUpload(req, res) {
    try {
      const { userId } = req.params;
      const isUserCheck = await candidateModel.findOne({ userId });
      if (isUserCheck) {
        const form = formidable({
          multiples: true,
          keepExtensions: true,
          useTempFiles: true,
        });
        await form.parse(req, async (err, fields, files) => {
          if (!files.file) {
            res
              .status(400)
              .json({ message: "No file uploaded", status: false });
            return; // Return early to avoid further processing
          } else if (err) {
            console.error(err); // Log the error for debugging purposes
            res
              .status(500)
              .json({ message: "Internal Server Error", status: false });
            return; // Return early on error
          } else {
            const fileBuffer = files.file;
            console.log(files.file);
            console.log(files.file.filepath);
            // const filePath = files.file.filepath;
            // const buffer= fs.readFile(files.file.filepath);
            // console.log(buffer);

            const fileStream = fs.createReadStream(files.file.filepath);
            // console.log();

            const params = {
              Bucket: `${process.env.AWS_BUCKET_NAME_IMAGE}/candidates-image`, // bucket that we made earlier
              Key: files.file.originalFilename, // Name of the image
              Body: fileStream, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            s3.upload(params, async (error, data) => {
              if (error) {
                console.log(error);
                res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
              } else {
                console.log(data);
                const updateDetails = await candidateModel.updateOne(
                  { userId },
                  { $set: { image: data.Location } }
                );
                console.log(updateDetails);
                if (updateDetails.acknowledged) {
                  res.status(201).json({
                    message: "Successfully updated profile",
                    status: true,
                  });
                } else {
                  res.status(400).json({
                    message: "Error in updating the details",
                    status: false,
                  });
                }
              }
            });
          }
        });
      } else {
        res.status(404).json({ message: "userid  not found ", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async employerImageUpload(req, res) {
    try {
      const { userId } = req.params;
      const isUserCheck = await employerModel.findOne({ userId });
      if (isUserCheck) {
        const form = formidable({
          multiples: true,
          keepExtensions: true,
          useTempFiles: true,
        });
        await form.parse(req, async (err, fields, files) => {
          if (!files.file) {
            res
              .status(400)
              .json({ message: "No file uploaded", status: false });
            return; // Return early to avoid further processing
          } else if (err) {
            console.error(err); // Log the error for debugging purposes
            res
              .status(500)
              .json({ message: "Internal Server Error", status: false });
            return; // Return early on error
          } else {
            const fileBuffer = files.file;
            // console.log(files.file.newFilename);
            // console.log(files.file.filepath);
            // const filePath = files.file.filepath;
            // const buffer= fs.readFile(files.file.filepath);
            // console.log(buffer);

            const fileStream = fs.createReadStream(files.file.filepath);
            console.log(fileStream);

            const params = {
              Bucket: `${process.env.AWS_BUCKET_NAME_IMAGE}/employer-image`, // bucket that we made earlier
              Key: files.file.originalFilename, // Name of the image
              Body: fileStream, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "image/png", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            s3.upload(params, async (error, data) => {
              if (error) {
                console.log(error);
                res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
              } else {
                console.log(data);
                const updateDetails = await employerModel.updateOne(
                  { userId },
                  { $set: { image: data.Location } }
                );
                console.log(updateDetails);
                if (updateDetails.acknowledged) {
                  res.status(201).json({
                    message: "Successfully updated profile",
                    status: true,
                  });
                } else {
                  res.status(400).json({
                    message: "Error in updating the details",
                    status: false,
                  });
                }
              }
            });
          }
        });
      } else {
        res.status(404).json({ message: "userid  not found ", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async candidateResumeUpload(req, res) {
    try {
      const { userId } = req.params;
      const isUserCheck = await candidateModel.findOne({ userId });

      if (isUserCheck) {
        const form = formidable({
          multiples: true,
          keepExtensions: true,
          useTempFiles: true,
        });
        await form.parse(req, async (err, fields, files) => {
          if (!files.file) {
            res
              .status(400)
              .json({ message: "No file uploaded", status: false });
            return; // Return early to avoid further processing
          } else if (err) {
            console.error(err); // Log the error for debugging purposes
            res
              .status(500)
              .json({ message: "Internal Server Error", status: false });
            return; // Return early on error
          } else {
            const fileBuffer = files.file;
            console.log(files.file.newFilename);
            console.log(files.file.filepath);
            // const filePath = files.file.filepath;
            // const buffer= fs.readFile(files.file.filepath);
            // console.log(buffer);

            const fileStream = fs.createReadStream(files.file.filepath);
            console.log(fileStream);

            const params = {
              Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
              Key: `${isUserCheck.name}.pdf`, // Name of the image
              Body: fileStream, // Body which will contain the image in buffer format
              ACL: "public-read-write", // defining the permissions to get the public link
              ContentType: "application/pdf", // Necessary to define the image content-type to view the photo in the browser with the link
            };
            s3.upload(params, async (error, data) => {
              if (error) {
                console.log(error);
                res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
              } else {
                console.log(data);
                const updateDetails = await candidateModel.updateOne(
                  { userId },
                  { $set: { resume: data.Location, isResumeUploaded: true } }
                );
                console.log(updateDetails);
                if (updateDetails.acknowledged) {
                  res.status(201).json({
                    message: "Successfully updated profile",
                    status: true,
                  });
                } else {
                  res.status(400).json({
                    message: "Error in updating the details",
                    status: false,
                  });
                }
              }
            });
          }
        });
      } else {
        res.status(404).json({ message: "userid  not found ", status: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error, status: false });
    }
  },
  async addPrimaryResume(req, res) {
    try {
      const form = formidable({
        multiples: false,
        keepExtensions: true,
        useTempFiles: true,
        fileWriteStreamHandler: (file) => {
          // 🔥 Prevent PDF corruption — force binary stream
          return fs.createWriteStream(file.filepath, { encoding: "binary" });
        },
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.log("Formidable parse error:", err);
          return res
            .status(500)
            .json({ message: "Upload failed", status: false });
        }

        if (!files.file) {
          return res
            .status(400)
            .json({ message: "No file uploaded", status: false });
        }

        const { userId } = req.params;
        const findUser = await candidateModel.findOne({ userId });

        if (!findUser) {
          return res
            .status(404)
            .json({ message: "User not found", status: false });
        }

        // 🔥 Read file as correct BINARY BUFFER (fixes PDF corruption)
        const fileBuffer = fs.readFileSync(files.file.filepath);

        // Generate safe file name
        const nextSequence = (findUser.resumeSequence || 0) + 1;
        const padded = String(nextSequence).padStart(3, "0");

        // const originalName = files.file.originalFilename || "resume.pdf";
        // const ext = originalName.split(".").pop();
        // const fileKey = `${userId}_${padded}.${ext}`;
        const originalName = files.file.originalFilename || "resume.pdf";
        const ext = originalName.split(".").pop();

        const fileKey = `${userId}_resume_${padded}.${ext}`;
        // Upload to S3
        const params = {
          Bucket: process.env.AWS_BUCKET_NAME_IMAGE,
          Key: fileKey,
          Body: fileBuffer,
          ACL: "public-read",
          ContentType: files.file.mimetype,
        };

        s3.upload(params, async (error, data) => {
          if (error) {
            console.log("S3 upload error:", error);
            return res.status(500).send({ message: "Upload failed", error });
          }

          // Build new resume entry
          const newResumeEntry = {
            type: "Primary",

            resumeUrl: data.Location,
            dateAdded: new Date(),
          };

          let updatedList = [];
 
         if (!findUser.allResumes || findUser.allResumes.length === 0) {
            // First ever resume
            updatedList.push(newResumeEntry);

            if (findUser.resume) {
              updatedList.push({
                type: "Secondary",
                resumeUrl: findUser.resume,
                dateAdded: new Date(),
              });
            }
          } else {
            // Convert old primary → secondary
            // updatedList = findUser.allResumes.map((r) =>
            //   r.type === "Primary" ? { ...r, type: "Secondary" } : r
            // );

            // // add new primary on top
            // updatedList.unshift(newResumeEntry);
            updatedList = findUser.allResumes.map((r) => {
              const obj = r.toObject();
              if (obj.type === "Primary") {
                obj.type = "Secondary";
              }
              return obj;
            });

            // Add new primary on top
            updatedList.unshift(newResumeEntry);
          }

          // Save result
          await candidateModel.updateOne(
            { userId },
            {
              $set: {
                resume: data.Location,
                allResumes: updatedList,
              },

              $inc: {
                resumeSequence: 1, // 🔥 guarantees uniqueness
              },
            }
          );

          return res.status(200).json({
            success: true,
            message: "Primary resume updated successfully",
            allResumes: updatedList,
          });
        });
      });
    } catch (error) {
      console.log("API error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  },
  async changePrimaryResume(req, res) {
    try {
      const { userId } = req.params;
      const { resumeId } = req.body; // subdocument _id

      if (!userId || !resumeId) {
        return res.status(400).json({
          success: false,
          message: "userId and resumeId are required",
        });
      }

      const findUser = await candidateModel.findOne({ userId });

      if (!findUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!findUser.allResumes || findUser.allResumes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No resumes found to change primary",
        });
      }

      // 🔍 Check resume exists
      const exists = findUser.allResumes.some(
        (r) => r._id.toString() === resumeId
      );

      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      // 🔁 Update primary/secondary flags
      const updatedResumes = findUser.allResumes.map((r) => ({
        ...r.toObject(),
        type: r._id.toString() === resumeId ? "Primary" : "Secondary",
      }));

      const newPrimary = updatedResumes.find((r) => r.type === "Primary");

      // Save changes
      await candidateModel.updateOne(
        { userId },
        {
          $set: {
            resume: newPrimary.resumeUrl,
            allResumes: updatedResumes,
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Primary resume updated successfully",
        allResumes: updatedResumes,
        primaryResume: newPrimary.resumeUrl,
      });
    } catch (error) {
      console.error("Error updating primary resume:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  // async changePrimaryResume(req, res) {
  //   try {
  //     const { userId } = req.params;
  //     const { resumeId } = req.body;

  //     if (!userId || !resumeId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "userId and resumeUrl are required",
  //       });
  //     }

  //     const findUser = await candidateModel.findOne({ userId });

  //     if (!findUser) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "User not found",
  //       });
  //     }

  //     if (!findUser.allResumes || findUser.allResumes.length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "No resumes found to change primary",
  //       });
  //     }

  //     // -----------------------------
  //     // Create updated resume array
  //     // -----------------------------
  //     let updatedResumes = findUser.allResumes.map((r) => {
  //       // Selected resume becomes primary
  //       if (r.resumeUrl === resumeUrl) {
  //         return { ...r, type: "Primary" };
  //       }

  //       // Everything else becomes secondary
  //       return { ...r, type: "Secondary" };
  //     });

  //     // Get new primary entry
  //     const newPrimary = updatedResumes.find((r) => r.type === "Primary");

  //     // Update in DB
  //     await candidateModel.updateOne(
  //       { userId },
  //       {
  //         $set: {
  //           resume: newPrimary.resumeUrl, // update main resume
  //           allResumes: updatedResumes,
  //         },
  //       }
  //     );

  //     return res.status(200).json({
  //       success: true,
  //       message: "Primary resume updated successfully",
  //       allResumes: updatedResumes,
  //       primaryResume: newPrimary.resumeUrl,
  //     });
  //   } catch (error) {
  //     console.error("Error updating primary resume:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Internal server error",
  //     });
  //   }
  // },
  async DeleteResume(req, res) {
    try {
      const { userId } = req.params;
      const { resumeId } = req.body; // subdocument _id

      if (!resumeId) {
        return res.status(400).json({
          success: false,
          message: "resumeId is required",
        });
      }

      const user = await candidateModel.findOne({ userId });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      if (!user.allResumes || user.allResumes.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No resumes stored",
        });
      }

      // 🔍 Find resume by _id
      const deletedResume = user.allResumes.find(
        (r) => r._id.toString() === resumeId
      );

      if (!deletedResume) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      const remaining = user.allResumes.filter(
        (r) => r._id.toString() !== resumeId
      );

      const deletedWasPrimary = deletedResume.type === "Primary";

      // 🔥 CASE 1: Deleted PRIMARY → promote next latest
      if (deletedWasPrimary && remaining.length > 0) {
        // newest first
        remaining.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

        remaining.forEach((r) => (r.type = "Secondary"));

        remaining[0].type = "Primary";
        user.resume = remaining[0].resumeUrl;
        user.allResumes = remaining;
      }
      // 🔥 CASE 2: No resumes left
      else if (remaining.length === 0) {
        user.allResumes = [];
        user.resume = null;
      }
      // 🔥 CASE 3: Deleted SECONDARY
      else {
        user.allResumes = remaining;
      }

      await user.save();

      return res.json({
        success: true,
        message: "Resume deleted successfully",
        allResumes: user.allResumes,
      });
    } catch (err) {
      console.error("DeleteResume error:", err);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  // async DeleteResume(req, res) {
  //   try {
  //     const { userId } = req.params;
  //     const { key } = req.body; // key = resumeUrl

  //     const user = await candidateModel.findOne({ userId });
  //     if (!user)
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "User not found" });

  //     if (!user.allResumes || user.allResumes.length === 0) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "No resumes stored",
  //       });
  //     }

  //     const allResumes = user.allResumes;

  //     // Find the deleted resume object
  //     const deletedResume = allResumes.find((r) => r.resumeUrl === key);

  //     const remaining = allResumes.filter((r) => r.resumeUrl !== key);

  //     const deletedWasPrimary = deletedResume?.type === "Primary";

  //     // 🔥 CASE: Deleted resume was PRIMARY → Promote next latest resume
  //     if (deletedWasPrimary && remaining.length > 0) {
  //       // Sort remaining by newest first
  //       const sorted = [...remaining].sort(
  //         (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)
  //       );

  //       // Reset all types
  //       sorted.forEach((r) => (r.type = "Secondary"));

  //       // Pick next latest (first in sorted)
  //       const nextPrimary = sorted[0];
  //       nextPrimary.type = "Primary";

  //       user.resume = nextPrimary.resumeUrl;
  //       user.allResumes = sorted;
  //     }
  //     // 🔥 CASE: No resumes left
  //     else if (remaining.length === 0) {
  //       user.allResumes = [];
  //     }
  //     // 🔥 Deleted a SECONDARY → keep list unchanged except the removal
  //     else {
  //       user.allResumes = remaining;
  //     }

  //     await user.save();

  //     return res.json({
  //       success: true,
  //       message: "Resume deleted successfully",
  //       allResumes: user.allResumes,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     return res.status(500).json({ success: false, message: "Server error" });
  //   }
  // },
};
module.exports = controller;

// async addPrimaryResume(req, res) {
//   try {
//     const form = formidable({
//       multiples: true,
//       keepExtensions: true,
//       useTempFiles: true,
//     });
//     await form.parse(req, async (err, fields, files) => {
//       console.log(files.file);

//       if (!files.file) {
//         // console.log(files.file)
//         res.status(400).json({ message: "No file uploaded", status: false });
//         return; // Return early to avoid further processing
//       } else if (err) {
//         console.error(err); // Log the error for debugging purposes
//         res
//           .status(500)
//           .json({ message: "Internal Server Error", status: false });
//         return; // Return early on error
//       } else {
//         const { userId } = req.params;
//         const findUser = await candidateModel.findOne({ userId: userId });
//         if (findUser) {
//           const fileStream = fs.createReadStream(files.file.filepath);
//           const resumeCount = findUser.allResumes?.length || 0;
//           const nextNumber = String(resumeCount + 1).padStart(3, "0");

//           const fileWithName = `${files.file.newFilename}${nextNumber}`;
//           const extfile = files.file.newFilename.split(".")[1];
//           const params = {
//             Bucket: process.env.AWS_BUCKET_NAME_IMAGE, // bucket that we made earlier
//             Key: `${fileWithName}.${extfile}`, // Name of the image
//             Body: fileStream, // Body which will contain the image in buffer format
//             ACL: "public-read-write", // defining the permissions to get the public link
//             ContentType: files.file.mimetype, // Necessary to define the image content-type to view the photo in the browser with the link
//           };
//           s3.upload(params, async (error, data) => {
//             if (error) {
//               console.log(error);
//               res.status(500).send({ err: error }); // if we get any error while uploading error message will be returned.
//             } else {
//               console.log(data);
//               let updates = {};
//               let newResumeEntry = {
//                 type: "Primary",
//                 resumeUrl: data.Location,
//                 dateAdded: new Date(),
//               };
//               let finalAllResumes = [];

//               if (!findUser.allResumes || findUser.allResumes.length === 0) {
//                 // ------------------------------------
//                 // CASE 1: No allResumes exists yet
//                 // ------------------------------------
//                 finalAllResumes.push(newResumeEntry);

//                 // Add old single resume (if exists)
//                 if (findUser.resume) {
//                   finalAllResumes.push({
//                     type: "Secondary",
//                     resumeUrl: findUser.resume,
//                   });
//                 }

//                 updates = {
//                   $set: {
//                     resume: data.Location,
//                     allResumes: finalAllResumes,
//                   },
//                 };
//               } else {
//                 // ------------------------------------
//                 // CASE 2: allResumes exists
//                 // ------------------------------------
//                 finalAllResumes = findUser.allResumes.map((item) => {
//                   if (item.type === "Primary") {
//                     return { ...item, type: "Secondary" };
//                   }
//                   return item;
//                 });

//                 // Add new primary at top
//                 finalAllResumes.unshift(newResumeEntry);

//                 updates = {
//                   $set: {
//                     resume: data.Location,
//                     allResumes: finalAllResumes,
//                   },
//                 };
//               }

//               // Save
//               await candidateModel.updateOne({ userId }, updates);

//               // Return updated array in response
//               return res.status(200).json({
//                 success: true,
//                 message: "Resume updated successfully",
//                 allResumes: finalAllResumes,
//               });
//             }
//           });
//         } else {
//           res.status(404).json({
//             message: "User not found",
//             status: false,
//           });
//         }
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error, status: false });
//   }
// },
