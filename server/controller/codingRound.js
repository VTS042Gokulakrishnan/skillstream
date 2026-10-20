const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const controller = {
  async CodingExecution(req, res) {
    try {
      const { code, language } = req.body;
      // console.log(req.body);
      const langConfig = {
        javascript: { file: "main.js", run: (f) => `node ${f}` },
        python: { file: "main.py", run: (f) => `python3 ${f}` },
        cpp: { file: "main.cpp", run: (f) => `g++ ${f} -o main && ./main` },
        java: { file: "Main.java", run: (f) => `javac ${f} && java Main` },
        // ➕ Added languages
        c: { file: "main.c", run: (f) => `gcc ${f} -o main && ./main` },
        go: { file: "main.go", run: (f) => `go run ${f}` },
        php: { file: "main.php", run: (f) => `php ${f}` },
        ruby: { file: "main.rb", run: (f) => `ruby ${f}` },
        cs: { file: "main.cs", run: (f) => `mcs ${f} && mono main.exe` },
        ts: { file: "main.ts", run: (f) => `ts-node ${f}` },
        kotlin: {
          file: "main.kt",
          run: (f) =>
            `kotlinc ${f} -include-runtime -d main.jar && java -jar main.jar`,
        },
        rust: { file: "main.rs", run: (f) => `rustc ${f} -o main && ./main` },
        swift: { file: "main.swift", run: (f) => `swift ${f}` },
        r: { file: "main.R", run: (f) => `Rscript ${f}` },
      };

      if (!langConfig[language]) {
        return res.status(400).json({ error: "Unsupported language" });
      }

      const filePath = `/tmp/${langConfig[language].file}`;
      require("fs").writeFileSync(filePath, code);

      exec(
        langConfig[language].run(filePath),
        { cwd: "/tmp", timeout: 5000 },
        (err, stdout, stderr) => {
          if (err) return res.json({ output: stderr || err.message });
          console.log(stdout);
          res.json({ output: stdout });
        }
      );
    } catch (error) {
      console.error("Error in executing the code", error);
      return res
        .status(500)
        .json({ error: "Internal Server Error", status: false });
    }
  },
};
module.exports = controller;
