import React, { useState, useEffect, useRef } from "react";

// Sorting Visualizer - Single-file React component (Tailwind CSS assumed present)
// Features:
// - Generate random array
// - Visualize Bubble, Insertion, Selection, Merge, Quick sorts
// - Play / Pause, Step, Reset
// - Speed slider

export default function SortingVisualizer() {
  const [array, setArray] = useState([]);
  const [n, setN] = useState(40);
  const [speed, setSpeed] = useState(50); // ms per action
  const [activeAlgo, setActiveAlgo] = useState("bubble");
  const [running, setRunning] = useState(false);
  const [currentOps, setCurrentOps] = useState([]); // {type: 'compare'|'swap'|'set', idx:[], values:[]}
  const opsRef = useRef([]);
  const timerRef = useRef(null);
  const [iPtr, setIPtr] = useState(0);
  const [colors, setColors] = useState([]);

  // Initialize
  useEffect(() => {
    generateArray(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generateArray(size = 40) {
    cancelRun();
    const arr = Array.from({ length: size }, () => randInt(10, 400));
    setArray(arr);
    setN(size);
    setColors(new Array(size).fill("bg-slate-400"));
    opsRef.current = [];
    setCurrentOps([]);
    setIPtr(0);
  }

  function randInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  function scheduleOperations(ops) {
    opsRef.current = ops;
    setCurrentOps(ops);
    setIPtr(0);
  }

  function cancelRun() {
    setRunning(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  // Play the scheduled operations
  useEffect(() => {
    if (!running) return;
    if (!opsRef.current || opsRef.current.length === 0) {
      setRunning(false);
      return;
    }
    runNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function runNext() {
    if (!running) return;
    const idx = iPtr;
    if (idx >= opsRef.current.length) {
      setRunning(false);
      return;
    }
    const op = opsRef.current[idx];
    applyOp(op);
    setIPtr((p) => p + 1);
    timerRef.current = setTimeout(runNext, Math.max(5, 201 - speed));
  }

  function applyOp(op) {
    // op: {type, indices, values}
    if (op.type === "compare") {
      const c = new Array(array.length).fill("bg-slate-400");
      op.indices.forEach((j) => (c[j] = "bg-yellow-400"));
      setColors(c);
    } else if (op.type === "swap") {
      setArray((prev) => {
        const a = prev.slice();
        const [i, j] = op.indices;
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
        return a;
      });
      const c = new Array(array.length).fill("bg-slate-400");
      op.indices.forEach((j) => (c[j] = "bg-red-400"));
      setColors(c);
    } else if (op.type === "set") {
      // set a value at index
      setArray((prev) => {
        const a = prev.slice();
        op.indices.forEach((idx, k) => (a[idx] = op.values[k]));
        return a;
      });
      const c = new Array(array.length).fill("bg-slate-400");
      op.indices.forEach((j) => (c[j] = "bg-green-400"));
      setColors(c);
    } else if (op.type === "markSorted") {
      const c = colors.slice();
      op.indices.forEach((j) => (c[j] = "bg-emerald-400"));
      setColors(c);
    }
  }

  function play() {
    if (running) return;
    if (opsRef.current.length === 0) {
      // generate operations for selected algo
      const ops = generateOps(array.slice(), activeAlgo);
      scheduleOperations(ops);
    }
    setRunning(true);
  }

  function pause() {
    cancelRun();
  }

  function step() {
    cancelRun();
    if (opsRef.current.length === 0) {
      const ops = generateOps(array.slice(), activeAlgo);
      scheduleOperations(ops);
    }
    const idx = iPtr;
    if (idx >= opsRef.current.length) return;
    const op = opsRef.current[idx];
    applyOp(op);
    setIPtr((p) => p + 1);
  }

  function reset() {
    cancelRun();
    const ops = generateOps(array.slice(), activeAlgo);
    scheduleOperations(ops);
    setArray((prev) => prev.slice());
    setColors(new Array(array.length).fill("bg-slate-400"));
    setIPtr(0);
  }

  // Generate operations for different algorithms
  function generateOps(arr, algo) {
    const ops = [];
    if (algo === "bubble") bubbleSortOps(arr, ops);
    else if (algo === "insertion") insertionSortOps(arr, ops);
    else if (algo === "selection") selectionSortOps(arr, ops);
    else if (algo === "merge") mergeSortOps(arr, 0, arr.length - 1, ops);
    else if (algo === "quick") quickSortOps(arr, 0, arr.length - 1, ops);
    // finally mark all sorted
    ops.push({ type: "markSorted", indices: Array.from({ length: arr.length }, (_, i) => i) });
    return ops;
  }

  // Bubble Sort operations
  function bubbleSortOps(a, ops) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        ops.push({ type: "compare", indices: [j, j + 1] });
        if (a[j] > a[j + 1]) {
          ops.push({ type: "swap", indices: [j, j + 1] });
          const tmp = a[j];
          a[j] = a[j + 1];
          a[j + 1] = tmp;
        }
      }
      ops.push({ type: "markSorted", indices: [n - i - 1] });
    }
  }

  // Insertion Sort operations
  function insertionSortOps(a, ops) {
    const n = a.length;
    for (let i = 1; i < n; i++) {
      let key = a[i];
      let j = i - 1;
      ops.push({ type: "compare", indices: [j, i] });
      while (j >= 0 && a[j] > key) {
        ops.push({ type: "set", indices: [j + 1], values: [a[j]] });
        a[j + 1] = a[j];
        j = j - 1;
        if (j >= 0) ops.push({ type: "compare", indices: [j, i] });
      }
      ops.push({ type: "set", indices: [j + 1], values: [key] });
    }
  }

  // Selection Sort operations
  function selectionSortOps(a, ops) {
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        ops.push({ type: "compare", indices: [minIdx, j] });
        if (a[j] < a[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        ops.push({ type: "swap", indices: [i, minIdx] });
        const tmp = a[i];
        a[i] = a[minIdx];
        a[minIdx] = tmp;
      }
      ops.push({ type: "markSorted", indices: [i] });
    }
  }

  // Merge Sort operations
  function mergeSortOps(a, l, r, ops) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSortOps(a, l, m, ops);
    mergeSortOps(a, m + 1, r, ops);
    // merge step
    const left = a.slice(l, m + 1);
    const right = a.slice(m + 1, r + 1);
    let i = 0,
      j = 0,
      k = l;
    while (i < left.length && j < right.length) {
      ops.push({ type: "compare", indices: [l + i, m + 1 + j] });
      if (left[i] <= right[j]) {
        ops.push({ type: "set", indices: [k], values: [left[i]] });
        a[k++] = left[i++];
      } else {
        ops.push({ type: "set", indices: [k], values: [right[j]] });
        a[k++] = right[j++];
      }
    }
    while (i < left.length) {
      ops.push({ type: "set", indices: [k], values: [left[i]] });
      a[k++] = left[i++];
    }
    while (j < right.length) {
      ops.push({ type: "set", indices: [k], values: [right[j]] });
      a[k++] = right[j++];
    }
  }

  // Quick Sort operations
  function quickSortOps(a, low, high, ops) {
    if (low >= high) return;
    const p = partitionOps(a, low, high, ops);
    quickSortOps(a, low, p - 1, ops);
    quickSortOps(a, p + 1, high, ops);
  }

  function partitionOps(a, low, high, ops) {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      ops.push({ type: "compare", indices: [j, high] });
      if (a[j] <= pivot) {
        i++;
        ops.push({ type: "swap", indices: [i, j] });
        const tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
      }
    }
    ops.push({ type: "swap", indices: [i + 1, high] });
    const tmp = a[i + 1];
    a[i + 1] = a[high];
    a[high] = tmp;
    return i + 1;
  }

  // UI
  const maxVal = Math.max(...array, 400);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Sorting Visualizer</h1>

        <div className="flex gap-3 flex-wrap mb-4">
          <button
            className={`px-3 py-1 rounded ${activeAlgo === "bubble" ? "bg-indigo-600 text-white" : "bg-white border"}`}
            onClick={() => {
              setActiveAlgo("bubble");
              cancelRun();
              opsRef.current = [];
            }}
          >
            Bubble
          </button>

          <button
            className={`px-3 py-1 rounded ${activeAlgo === "insertion" ? "bg-indigo-600 text-white" : "bg-white border"}`}
            onClick={() => {
              setActiveAlgo("insertion");
              cancelRun();
              opsRef.current = [];
            }}
          >
            Insertion
          </button>

          <button
            className={`px-3 py-1 rounded ${activeAlgo === "selection" ? "bg-indigo-600 text-white" : "bg-white border"}`}
            onClick={() => {
              setActiveAlgo("selection");
              cancelRun();
              opsRef.current = [];
            }}
          >
            Selection
          </button>

          <button
            className={`px-3 py-1 rounded ${activeAlgo === "merge" ? "bg-indigo-600 text-white" : "bg-white border"}`}
            onClick={() => {
              setActiveAlgo("merge");
              cancelRun();
              opsRef.current = [];
            }}
          >
            Merge
          </button>

          <button
            className={`px-3 py-1 rounded ${activeAlgo === "quick" ? "bg-indigo-600 text-white" : "bg-white border"}`}
            onClick={() => {
              setActiveAlgo("quick");
              cancelRun();
              opsRef.current = [];
            }}
          >
            Quick
          </button>

          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm">Array size</label>
            <input
              type="range"
              min={10}
              max={120}
              value={n}
              onChange={(e) => generateArray(Number(e.target.value))}
            />
            <span className="text-sm">{n}</span>
          </div>

          <div className="ml-4 flex items-center gap-2">
            <label className="text-sm">Speed</label>
            <input
              type="range"
              min={5}
              max={200}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span className="text-sm">{speed} ms</span>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={play} className="px-4 py-2 bg-emerald-500 text-white rounded">Play</button>
          <button onClick={pause} className="px-4 py-2 bg-yellow-500 text-white rounded">Pause</button>
          <button onClick={step} className="px-4 py-2 bg-blue-500 text-white rounded">Step</button>
          <button onClick={() => generateArray(n)} className="px-4 py-2 bg-gray-700 text-white rounded">Randomize</button>
          <button onClick={reset} className="px-4 py-2 bg-red-500 text-white rounded">Reset</button>
        </div>

        <div className="w-full h-96 bg-white border rounded p-4 flex items-end overflow-hidden">
          <div className="w-full flex items-end gap-1" style={{ alignItems: 'flex-end', height: '100%' }}>
            {array.map((val, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-sm ${colors[idx] || 'bg-slate-400'}`}
                style={{ height: `${(val / maxVal) * 100}%`, transition: 'height 150ms linear' }}
                title={val}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Algorithm: <strong>{activeAlgo}</strong> • Steps scheduled: {opsRef.current.length} • Executed: {iPtr}</p>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Tip: Use smaller array size and high speed for smoother animations. TailwindCSS is assumed for styling. You can drop this component into any React app and it should work.</p>
        </div>
      </div>
    </div>
  );
}
