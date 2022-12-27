import { execSync } from "child_process";
import { fileChecker } from "../validation/checkFolder/index.js";
export function calcPwd(curPwd, importPwd) {
  importPwd = importPwd
    .replace(";", "")
    .split('"')
    .join("")
    .split("'")
    .join("");

  const tempImportPwdSplit = importPwd.split("/");
  const isFolder = tempImportPwdSplit[tempImportPwdSplit.length - 1];
  let resultPwd = "";
  let rest = "index.tsx";
  const checkList = execSync(
    `find /Users/byeonjaejun/Desktop/componentree-backend/repo -name ${isFolder}*`,
    { encoding: "utf-8" }
  );
  const checkListArr = checkList
    .split("\n")
    .filter((el) => el)
    .map((el) => {
      return fileChecker(el);
    });

  if (checkListArr.includes(true)) {
    // 파일일 경우
    const importPwdSplit = importPwd.split("/");
    rest = importPwdSplit[importPwdSplit.length - 1] + ".tsx";
    importPwd = importPwdSplit
      .filter((el, i) => i < importPwdSplit.length - 1)
      .join("/");
    resultPwd = execSync(`cd ${curPwd} && cd ${importPwd} && pwd`, {
      encoding: "utf-8",
    });
  } else {
    // 폴더일 경우
    resultPwd = execSync(`cd ${curPwd} && cd ${importPwd} && pwd`, {
      encoding: "utf-8",
    });
  }

  resultPwd = resultPwd.split("\n").join("");

  return { resultPwd, rest };
}
