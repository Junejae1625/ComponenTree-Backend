function aaa(obj) {
  if (obj.children) {
    obj.children.map((a) => {
      return aaa(a);
    });
  } else {
    return "";
  }

  return { source: obj.componentName };
}

export function makeLinks(arr) {
  const links = arr.map((e) => {
    return aaa(e);
  });
  console.log(links);
}
