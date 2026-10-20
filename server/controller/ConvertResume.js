  const fs = require("fs-extra");
  const path = require("path");
  const mammoth = require("mammoth");
  const puppeteer = require("puppeteer");
  const { exec } = require("child_process");
  const controller = {
    async convertResume(req, res) {
      try {
        const file = req.file;

        if (!file) return res.status(400).send("No file uploaded");

        const ext = path.extname(file.originalname).toLowerCase();

        // If file is already PDF → return directly
        if (ext === ".pdf") {
          return res.sendFile(path.resolve(file.path));
        }

        // Convert DOCX / DOC → PDF
        const outputPath = file.path + ".pdf";

        exec(
          `libreoffice --headless --convert-to pdf --outdir uploads ${file.path}`,
          (error) => {
            if (error) {
              console.error("Conversion error:", error);
              return res.status(500).send("Conversion failed");
            }

            const convertedFile = file.path.replace(ext, ".pdf");
            return res.sendFile(path.resolve(convertedFile));
          }
        );
      } catch (error) {
        console.error("❌ Conversion error:", error);
        res.status(500).json({ error: "Error converting resume" });
      }
    },
  // async convertResume(req, res) {
  //   try {
  //     const file = req.file;
  //     const ext = path.extname(file.originalname).toLowerCase();
  //     const fileName = path.basename(file.originalname, ext);
  //     const uploadPath = file.path;
  //     const outputPdfPath = `uploads/${fileName}-${Date.now()}.pdf`;

  //     // ✅ Direct PDF passthrough
  //     if (ext === ".pdf") {
  //       return res.json({
  //         success: true,
  //         pdfUrl: `${process.env.SERVER_URL}/${uploadPath}`,
  //       });
  //     }

  //     // ❌ Reject unsupported formats
  //     if (ext !== ".docx" && ext !== ".doc") {
  //       return res.status(400).json({ error: "Unsupported file format" });
  //     }

  //     // 1️⃣ Read DOCX and convert to HTML
  //     const buffer = await fs.readFile(uploadPath);
  //     const { value: html } = await mammoth.convertToHtml({ buffer });

  //     // 2️⃣ Render HTML to PDF using Puppeteer
  //     const browser = await puppeteer.launch({
  //       headless: true,
  //       args: ["--no-sandbox", "--disable-setuid-sandbox"],
  //     });
  //     const page = await browser.newPage();

  //     // ✅ Wrap HTML properly
  //     const fullHtml = `
  //       <!DOCTYPE html>
  //       <html>
  //         <head>
  //           <meta charset="utf-8">
  //           <style>
  //             body { font-family: Arial, sans-serif; }
  //           </style>
  //         </head>
  //         <body>${html}</body>
  //       </html>
  //     `;

  //     await page.setContent(fullHtml, { waitUntil: "load" });
  //     await page.emulateMediaType("screen");

  //     await page.pdf({
  //       path: outputPdfPath,
  //       format: "A4",
  //       printBackground: true,
  //     });

  //     await browser.close();

  //     // ✅ Remove original upload safely
  //     if (await fs.pathExists(uploadPath)) {
  //       await fs.remove(uploadPath);
  //     }

  //     // ✅ Return absolute URL
  //     return res.json({
  //       success: true,
  //       pdfUrl: `${process.env.SERVER_URL}/${outputPdfPath}`,
  //     });
  //   } catch (error) {
  //     console.error("❌ Conversion error:", error);
  //     res.status(500).json({ error: "Error converting resume" });
  //   }
  // },
};

module.exports = controller;
