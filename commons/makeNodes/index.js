function returnObj(obj, box) {
  if (obj.children !== undefined) {
    obj.children.map((a) => {
      return returnObj(a, box);
    });
  }
  for (let i = 0; i < box.length; i++) {
    if (box[i].componentName === obj.componentName) {
      box[i].count++;
      return box;
    }
  }

  box.push({
    componentName: obj.componentName,
    count: 1,
  });
  return box;
}

export function makeNodes(arr) {
  const result = [];
  arr.map((el) => {
    return returnObj(el, result);
  });
  return result;
}
