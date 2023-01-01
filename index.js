import express from "express";
import { exec, execSync } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { getCloneRepoName } from "./commons/getCloneRepoName/index.js";
import { isCorrectUrl } from "./commons/validation/gitUrlValidation/index.js";
import { makeLinks } from "./commons/makeLinks/index.js";
import { makeNodes } from "./commons/makeNodes/index.js";
import cors from "cors";
import { calcPwd } from "./commons/calcPwd/index.js";

const app = express();
app.use(cors());
app.use(express.json());
app.post("/upload", async (req, res) => {
  const url = req.body.url;
  let type = req.body.type;
  // 1. 올바른 repo 주소인지 검증
  const isCorrect = isCorrectUrl(url);
  if (!isCorrect) return;

  // 2. 'repo' 폴더에 소스코드 저장
  const rootDir = await new Promise((resolve, reject) => {
    exec("pwd", (_, stdout) => {
      resolve(stdout.slice(0, stdout.length - 1));
    });
  });
  const repoName = getCloneRepoName(url);
  // 혹시나 동시에 여러 요청이 오거나 중복되는 폴더 이름이 올 수 있으니 uuid로 폴더 생성 후 해당 폴더 내부에서 gitclone 하기
  const UNIQUE = uuidv4();
  await new Promise((resolve, reject) => {
    exec(
      `cd repo && mkdir ${UNIQUE} && cd ${UNIQUE} && git clone ${url}`,
      (error, stdout) => {
        if (error) {
          throw new Error("github 주소를 확인해주세요");
        }
        resolve(stdout);
      }
    );
  });

  const extensionList = ["tsx", "js"];
  let curExtension = "js";
  const path = `${rootDir}/repo/${UNIQUE}/${repoName}`;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // next.js 일때
  if (type == "pages") {
    const pagesList = execSync(`tree -fa ${path}/${type}`, {
      encoding: "utf-8",
    })
      .split("├── ")
      .join("")
      .split("│")
      .join("")
      .split("└──")
      .join("")
      .split("\n")
      .filter((el) => el)
      .map((e) => {
        return e.trim();
      });

    const tempnodeData = pagesList.map((el) => {
      const temp = el.split(".");
      const isFile = temp[temp.length - 1];
      if (isFile === "tsx") {
        curExtension = "tsx";
      }
      // el = el.slice(1);
      if (extensionList.includes(isFile)) {
        return el;
      } else {
        return "";
      }
    });

    const nodeData = tempnodeData
      .filter((el) => el)
      .map((el) => {
        el = el.split("/");
        let index = el[el.length - 1];
        const tempIndex = index.split(".");
        index = tempIndex[0] + "." + curExtension;
        const folderPath = el.filter((_, i) => i < el.length - 1).join("/");
        return readFile({ path: folderPath, index });
      });

    function readFile({ path, index }) {
      ////////////////////////////////////////////////////////////////////////
      let componentName = "";

      let file = "";
      if (path === undefined) return undefined;
      path = path.replace("\n", "");
      file = execSync(`cd ${path} && cat ${path}/${index}`, {
        encoding: "utf-8",
      });

      ////////////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////////////
      const tempFileArr = file.split("\n");
      const importPaths = tempFileArr.map((el) => {
        if (el.includes("import")) {
          el = el.split("import ").join("").split(" from ");
          if (el.length > 1) {
            let [tempName, tempPath] = el;
            if (
              !tempName.includes("{") &&
              !tempName.includes("*") &&
              !tempName.includes("styled") &&
              !tempPath.includes("next") &&
              !tempPath.includes("@")
            ) {
              return calcPwd(
                rootDir,
                UNIQUE,
                repoName,
                path,
                tempPath,
                curExtension
              );
            }
          }
        }

        if (el.includes("export default ")) {
          if (el.includes("function")) {
            let tempName = el.split("export default function ");
            componentName = tempName[tempName.length - 1]
              .split("()")[0]
              .replace(" {", "")
              .replace(";", "");
          } else {
            let tempName = el.split("export default ");
            componentName = tempName[tempName.length - 1]
              .replace(" {", "")
              .replace(";", "");
          }
        }
        return "";
      });
      ////////////////////////////////////////////////////////////////////////

      const importPath = importPaths
        .filter((el) => el)
        .map((el) => el.resultPwd);

      const temp = importPaths
        .filter((el) => el)
        .map((el) => {
          return readFile({
            path: el.resultPwd,
            index: el.rest,
          });
        });

      const result = {
        componentName,
      };
      if (importPath.length) result.importPath = importPath;
      if (temp.length) result.children = temp;
      return result;
    }

    const resultNode = makeNodes(nodeData);
    const resultLink = makeLinks(nodeData, resultNode);

    console.log(JSON.stringify(nodeData, null, 2), resultNode, resultLink);
    ////////////////////////////////////////////////////////////////////////
    // clone 한 폴더 삭제
    exec(`rm -rf ${rootDir}/repo/${UNIQUE}`);
    res.send({ resultNode, resultLink });
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // react 일때
  else {
    const appList = execSync(`find ${path}/src -name App*`, {
      encoding: "utf-8",
    });

    const tempAppList = appList
      .split("\n")
      .filter((e) => e)
      .filter((el) => {
        const tempSplit = el.split("/");
        if (
          tempSplit[tempSplit.length - 1] === "App.js" ||
          tempSplit[tempSplit.length - 1] === "App.tsx"
        ) {
          const tempDot = tempSplit[tempSplit.length - 1].split(".");
          curExtension = tempDot[tempDot.length - 1];
          return el;
        }
      });

    const reactNodeData = tempAppList.map((el) => {
      el = el.split("/");
      let index = el[el.length - 1];
      const tempIndex = index.split(".");
      index = tempIndex[0] + "." + curExtension;
      const folderPath = el.filter((_, i) => i < el.length - 1).join("/");
      return readReactFile({ path: folderPath, index });
    });

    function readReactFile({ path, index }) {
      ////////////////////////////////////////////////////////////////////////
      let componentName = "";

      let file = "";
      if (path === undefined) return undefined;
      path = path.replace("\n", "");
      file = execSync(`cd ${path} && cat ${path}/${index}`, {
        encoding: "utf-8",
      });

      ////////////////////////////////////////////////////////////////////////

      ////////////////////////////////////////////////////////////////////////
      const tempFileArr = file.split("\n");
      const importPaths = tempFileArr.map((el) => {
        if (el.includes("import")) {
          el = el.split("import ").join("").split(" from ");
          if (el.length > 1) {
            let [tempName, tempPath] = el;
            if (
              !tempName.includes("{") &&
              !tempName.includes("*") &&
              !tempName.includes("styled") &&
              !tempPath.includes("next") &&
              !tempPath.includes("@")
            ) {
              return calcPwd(
                rootDir,
                UNIQUE,
                repoName,
                path,
                tempPath,
                curExtension
              );
            }
          }
        }

        if (el.includes("export default ")) {
          if (el.includes("function")) {
            let tempName = el.split("export default function ");
            componentName = tempName[tempName.length - 1]
              .split("()")[0]
              .replace(" {", "")
              .replace(";", "");
          } else {
            let tempName = el.split("export default ");
            componentName = tempName[tempName.length - 1]
              .replace(" {", "")
              .replace(";", "");
          }
        }
        return "";
      });
      ////////////////////////////////////////////////////////////////////////

      const importPath = importPaths
        .filter((el) => el)
        .map((el) => el.resultPwd);

      const temp = importPaths
        .filter((el) => el)
        .map((el) => {
          return readReactFile({
            path: el.resultPwd,
            index: el.rest,
          });
        });

      const result = {
        componentName,
      };
      if (importPath.length) result.importPath = importPath;
      if (temp.length) result.children = temp;
      return result;
    }

    const resultNode = makeNodes(reactNodeData);
    const resultLink = makeLinks(reactNodeData, resultNode);

    ////////////////////////////////////////////////////////////////////////
    // clone 한 폴더 삭제

    console.log(JSON.stringify(reactNodeData, null, 2), resultNode, resultLink);
    exec(`rm -rf ${rootDir}/repo/${UNIQUE}`);
    res.send({ resultNode, resultLink });
  }
});

console.log("연결");
app.listen(4000);
