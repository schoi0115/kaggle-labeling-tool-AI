import express from "express";
import cors from "cors";
import fs from "fs";
import axios from "axios";   // 🔥 반드시 필요

const app = express();
app.use(cors());
app.use(express.json());

// 데이터 로드
let data = JSON.parse(fs.readFileSync("../data/data.json", "utf8"));

// 문장 하나 가져오기
app.get("/api/item/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!data[id]) return res.status(404).json({ error: "Not found" });
  res.json({ id, text: data[id].text, label: data[id].label || null });
});

// 라벨 저장
app.post("/api/label/:id", (req, res) => {
  const id = Number(req.params.id);
  const { label } = req.body;

  if (!data[id]) return res.status(404).json({ error: "Not found" });

  data[id].label = label;
  fs.writeFileSync("../data/data.json", JSON.stringify(data, null, 2));

  res.json({ success: true });
});

// 🔥 번역 API (Google)
app.post("/api/translate", async (req, res) => {
  const { text } = req.body;

  try {
    // 1) 문장 분리
    const sentences = text
      .split(/(?<=[.!?])\s+/)   // 문장 끝 기준으로 분리
      .filter(s => s.trim().length > 0);

    const translatedSentences = [];

    // 2) 각 문장 개별 번역
    for (const sentence of sentences) {
      const response = await axios.get(
        "https://translate.googleapis.com/translate_a/single",
        {
          params: {
            client: "gtx",
            sl: "en",
            tl: "ko",
            dt: "t",
            q: sentence,
          },
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept-Language": "en",
          },
        }
      );

      translatedSentences.push(response.data[0][0][0]);
    }

    // 3) 번역된 문장 합치기
    const finalTranslation = translatedSentences.join(" ");

    res.json({ translated: finalTranslation });
  } catch (err) {
    console.log("번역 에러:", err.message);
    res.json({ translated: "번역 실패" });
  }
});

app.get("/api/total", (req, res) => {
  res.json({ total: data.length });
});

app.post("/api/undo/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!data[id]) return res.status(404).json({ error: "Not found" });

  data[id].label = null;
  fs.writeFileSync("../data/data.json", JSON.stringify(data, null, 2));

  res.json({ success: true });
});


app.listen(4000, () => console.log("Server running on port 4000"));
