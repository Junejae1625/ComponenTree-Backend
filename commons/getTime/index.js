export const getTime = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const hh = date.getHours();
  const min = date.getMinutes();
  return `${yyyy}-${mm}-${dd}-${hh}-${min}`;
};
