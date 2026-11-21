// Money is an integer number of đồng from the API; the client only formats it (CLAUDE.md, the brief's facts).
export function formatVND(value) {
  return value.toLocaleString('vi-VN') + 'đ';
}
