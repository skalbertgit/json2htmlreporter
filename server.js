const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const reporter = require("cucumber-html-reporter");

const app = express();
const PORT = 3000;

// Middleware for file uploads
app.use(fileUpload());
app.use(express.static("public"));

// Endpoint to handle file upload
app.post("/upload", (req, res) => {
  if (!req.files || !req.files.cucumberResults) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Save uploaded file to disk i.e.: jsonResultFile/cucumberResults.json
  const uploadPath = path.join(__dirname, "cucumberResults.json");
  req.files.cucumberResults.mv(uploadPath, (err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    // Generate the HTML report
    const options = {
      theme: "bootstrap",
      jsonFile: uploadPath,
      output: "./public/cucumber_report.html",
      reportSuiteAsScenarios: true,
      launchReport: false,
    };

    reporter.generate(options);

    // Send success response to open report in a new window
    res.json({ success: true });
  });
});

// Serve generated report
app.get("/report", (req, res) => {
  const reportPath = path.join(__dirname, "public", "cucumber_report.html");
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).send("Report not found");
  }
});

app.listen(PORT, () => {
  console.log(`Report Server running at http://localhost:${PORT}`);
});
