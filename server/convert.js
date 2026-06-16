import fs from "fs";
import csv from "csv-parser";

const results = [];

fs.createReadStream("../data/sentiment.csv")
  .pipe(csv({
    headers: ["target", "id", "date", "flag", "user", "text"],
    skipLines: 0
  }))
  .on("data", (row) => {
    results.push({
      text: row.text,   // 트윗 내용
      label: null       // 라벨은 나중에 붙임
    });
  })
  .on("end", () => {
    fs.writeFileSync("../data/data.json", JSON.stringify(results, null, 2));
    console.log("변환 완료!");
  });
