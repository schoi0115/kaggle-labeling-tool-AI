import fs from "fs";
import axios from "axios";

const kaggle = JSON.parse(fs.readFileSync("../kaggle.json", "utf8"));

const username = kaggle.username;
const key = kaggle.key;

const dataset = "kazanova/sentiment140";
const url = `https://www.kaggle.com/api/v1/datasets/download/${dataset}`;

const download = async () => {
  const response = await axios({
    url,
    method: "GET",
    responseType: "arraybuffer",
    auth: {
      username,
      password: key,
    },
  });

  fs.writeFileSync("../data/sentiment140.zip", response.data);
  console.log("다운로드 완료!");
};

download();
