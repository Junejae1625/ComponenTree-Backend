function returnLinkObj(obj, box, nodeList) {
  if (obj.children !== undefined) {
    obj.children.map((a) => {
      box.push({
        source: nodeList.indexOf(obj.componentName),
        target: nodeList.indexOf(a.componentName),
      });
      return returnLinkObj(a, box, nodeList);
    });
  }
}

export function makeLinks(arr, resultNode) {
  const result = [];
  const nodeList = resultNode.map((el) => el.componentName);
  arr.map((el) => {
    return returnLinkObj(el, result, nodeList);
  });
  return result;
}
