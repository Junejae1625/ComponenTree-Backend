export const getCloneRepoName = (url) => {
  const splitUrl = url.split("/");
  const repoName = splitUrl[splitUrl.length - 1].split(".git")[0];
  return repoName;
};
