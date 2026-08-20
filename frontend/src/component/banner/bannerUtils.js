export const getCategoryColor = (name) => {
  const lowerName = name ? name.toLowerCase() : "";
  if (lowerName.includes("cổ trang") || lowerName.includes("hiện đại")) {
    return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20";
  }
  if (
    lowerName.includes("đô thị") ||
    lowerName.includes("kiếm hiệp") ||
    lowerName.includes("tu tiên")
  ) {
    return "text-amber-400 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20";
  }
  if (lowerName.includes("hài hước") || lowerName.includes("xuyên không")) {
    return "text-cyan-400 border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20";
  }
  if (lowerName.includes("tiên hiệp")) {
    return "text-rose-400 border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20";
  }
  if (lowerName.includes("trùng sinh")) {
    return "text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20";
  }
  return "text-sky-400 border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20";
};

export const norm = (n, m) => ((n % m) + m) % m;

export const getPos = (idx, active, len) => {
  if (len <= 1) return 0;
  const d = norm(idx - active, len);
  if (d === 0) return 0;
  if (d === 1) return 1;
  if (d === 2) return 2;
  if (d === len - 1) return -1;
  return -2;
};