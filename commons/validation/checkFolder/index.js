export function fileChecker(url) {
  const extension = ["tsx", "js"];
  const temp = url.split("/");
  const tempSplit = temp[temp.length - 1].split(".");
  const isFolder = tempSplit[tempSplit.length - 1];
  return extension.includes(isFolder);
}
