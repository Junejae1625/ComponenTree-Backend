import express from "express";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { getCloneRepoName } from "./commons/getCloneRepoName/index.js";
import { isCorrectUrl } from "./commons/validation/gitUrlValidation/index.js";

const app = express();

app.post("/upload", async (req, res) => {
  // 1. 올바른 repo 주소인지 검증
  const isCorrect = isCorrectUrl(
    "https://github.com/Junejae1625/Numble_reference.git"
  );
  if (!isCorrect) return;
  // 2. 'repo' 폴더에 소스코드 저장
  // 혹시나 동시에 여러 요청이 오거나 중복되는 폴더 이름이 올 수 있으니 uuid로 폴더 생성 후 해당 폴더 내부에서 gitclone 하기
  const rootDir = await new Promise((resolve, reject) => {
    exec("pwd", (_, stdout) => {
      resolve(stdout.slice(0, stdout.length - 1));
    });
  });
  const repoName = getCloneRepoName(
    "https://github.com/Junejae1625/Numble_reference.git"
  );

  const UNIQUE = uuidv4();

  await new Promise((resolve, reject) => {
    exec(
      `cd repo && mkdir ${UNIQUE} && cd ${UNIQUE} && git clone https://github.com/Junejae1625/Numble_reference.git`,
      (error, stdout) => {
        if (error) {
          throw new Error("github 주소를 확인해주세요");
        }
        resolve(stdout);
      }
    );
  });

  const index = ["_app.tsx", "_app.js", "index.js", "index.tsx"];
  const pagesData = [];
  const path = `${rootDir}/repo/${UNIQUE}/${repoName}/pages`;

  const pages = await new Promise((resovle, reject) => {
    exec(
      `cd ${rootDir}/repo/${UNIQUE}/${repoName}/pages && ls`,
      (_, stdout) => {
        resovle(stdout.split("\n"));
      }
    );
  });
  pages
    .filter((el) => el)
    .forEach((el) => {
      if (index.includes(el)) {
        exec(`cat ${path}/${el}`, (_, stdout) => {
          console.log(stdout);
        });
      } else {
        exec(`cat ${path}/${el}/index.tsx`, (_, stdout) => {
          console.log(stdout);
        });
      }
    });
  // git clone 한 폴더명 뽑아온 후 repo담기

  // 3. 파일열기

  // exec(`cd ${path} && ls`, (a, stdout) => {
  //   // const results = stdout.split("\n");
  //   console.log(stdout);

  //   // results.forEach((el) => {
  //   //   exec(`cat ${path}/pages/${el}/index.tsx`, (_, stdout) => {
  //   //     // console.log(stdout);
  //   //     exec(`echo ${stdout} > qqq.txt`);
  //   //   });
  //   // });
  //   // console.log(stdout);
  // });

  // exec("cat mydownload/index.html", (_, stdout) => {
  //   const result = stdout;
  //   const splittedResult = result.split("\n");
  //   console.log(splittedResult);
  // });

  exec(`cd repo && rm -rf ${UNIQUE}`);
  res.send({ name: "끄읕~" });
  res.sendHtml;
});

console.log("연결");
app.listen(3000);
