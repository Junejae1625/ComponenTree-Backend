export function fileChecker(url, curEx) {
  const extension = ["tsx", "ts", "js"];
  const temp = url.split("/");
  const tempSplit = temp[temp.length - 1].split(".");
  const isFolder = tempSplit[tempSplit.length - 1];
  curEx = extension[extension.indexOf(isFolder)];
  return { isFolder: extension.includes(isFolder), curEx };
}
