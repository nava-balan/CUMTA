interface QRCodeProps {
  data: string;
  size?: number;
}

export default function QRCode({ data, size = 120 }: QRCodeProps) {
  const gridSize = 21;
  const cellSize = size / gridSize;

  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const seed = hashCode(data);
  const cells: boolean[][] = [];

  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      const isFinderTL = row < 7 && col < 7;
      const isFinderTR = row < 7 && col >= gridSize - 7;
      const isFinderBL = row >= gridSize - 7 && col < 7;

      if (isFinderTL || isFinderTR || isFinderBL) {
        const lr = isFinderTL ? row : isFinderTR ? row : row - (gridSize - 7);
        const lc = isFinderTL ? col : isFinderTR ? col - (gridSize - 7) : col;
        const isOuter = lr === 0 || lr === 6 || lc === 0 || lc === 6;
        const isInner = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
        cells[row][col] = isOuter || isInner;
      } else {
        const val = ((seed * (row * gridSize + col + 1) * 7919) % 100);
        cells[row][col] = val < 45;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded border border-[#0A7D8C]">
      <rect width={size} height={size} fill="#FFFFFF" rx="4" />
      {cells.map((row, ri) =>
        row.map((cell, ci) =>
          cell ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * cellSize}
              y={ri * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#042F40"
            />
          ) : null
        )
      )}
    </svg>
  );
}
