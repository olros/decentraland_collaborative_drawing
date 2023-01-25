import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { DocumentReference } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import { useDebounce } from "~/hooks";
import type { DrawingDoc } from "./new";

function hexToRGB(hex: string) {
  let r = "0";
  let g = "0";
  let b = "0";

  // 3 digits
  if (hex.length == 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];

    // 6 digits
  } else if (hex.length == 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }

  return [Number(r), Number(g), Number(b)].join(",");
}

export async function loader({ params }: LoaderArgs) {
  const docRef = await getDoc(
    doc(
      firestore,
      DRAWING_COLLECTION_NAME,
      params.id as string
    ) as DocumentReference<DrawingDoc>
  );
  const data = docRef.data();
  if (!data) {
    return redirect("/");
  }
  return json({ id: params.id as string, document: data });
}

export default function DocumentDrawer() {
  const { document, id } = useLoaderData<typeof loader>();
  const [drawingDoc, setDrawingDoc] = useState(document);
  const inputColorRef = useRef<HTMLInputElement>(null);

  const debouncedLastUpdate = useDebounce(drawingDoc, 500);

  useEffect(() => {
    const updatedDocRef = doc(
      firestore,
      DRAWING_COLLECTION_NAME,
      id
    ) as DocumentReference<DrawingDoc>;

    updateDoc(updatedDocRef, debouncedLastUpdate);
  }, [debouncedLastUpdate, id]);

  const updateCanvas = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, row: number, col: number) => {
      const inputColor = inputColorRef.current?.value;
      if (e.pressure > 0 && inputColor) {
        setDrawingDoc((p) => {
          const prev = p || drawingDoc;
          const updated: DrawingDoc = {
            ...prev,
            rows: prev.rows.map((r, rowI) =>
              rowI === row
                ? {
                    columns: r.columns.map((c, colI) =>
                      colI === col ? { rgb: hexToRGB(inputColor) } : c
                    ),
                  }
                : r
            ),
          };
          return updated;
        });
      }
    },
    [drawingDoc]
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        maxHeight: "95vh",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          aspectRatio: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${drawingDoc.size}, 1fr)`,
          gridTemplateRows: `repeat(${drawingDoc.size}, 1fr)`,
          maxWidth: "95vw",
          background: "white",
          padding: 10,
          border: "5px solid black",
        }}
      >
        {drawingDoc.rows.map((row, rowId) => (
          <Fragment key={rowId}>
            {row.columns.map((col, colId) => (
              <button
                onPointerDown={(e) => updateCanvas(e, rowId, colId)}
                onPointerEnter={(e) => updateCanvas(e, rowId, colId)}
                key={colId}
                style={{
                  border: "none",
                  background: `rgb(${col.rgb})`,
                }}
              />
            ))}
          </Fragment>
        ))}
      </div>
      <div>
        <h1>Select a color</h1>
        <p>
          Hold down your pointer while dragging or clicking on the canvas to
          draw.
          <br /> The drawing is saved continuously as you draw
        </p>
        <input ref={inputColorRef} type="color" defaultValue="#ff0000" />
      </div>
    </div>
  );
}
