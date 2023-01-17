import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { DocumentReference } from "firebase/firestore";
import { arrayUnion, writeBatch } from "firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import { useDebounce } from "~/hooks";
import type { DrawingDoc } from "./new";

export const drawingToImage = (drawing: DrawingDoc) => {
  const document = Array.from({ length: drawing.rows }, (v, i) =>
    Array.from({ length: drawing.columns }, (v, i) => [255, 255, 255])
  );
  drawing.drawings.forEach((draw) => {
    document[draw.y][draw.x] = draw.color;
  });
  return document;
};

function hexToRGB(h: string) {
  let r = "0";
  let g = "0";
  let b = "0";

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return [Number(r), Number(g), Number(b)];
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
  const [inputColor, setInputColor] = useState("#ff0000");

  const [newDrawings, setNewDrawings] = useState<DrawingDoc["drawings"]>([]);

  const debouncedNewDrawings = useDebounce(newDrawings, 500);

  const canvas = useMemo(() => drawingToImage({ ...drawingDoc, drawings: [...drawingDoc.drawings, ...newDrawings] }), [newDrawings, drawingDoc]);

  useEffect(() => {
    let subscribed = true;
    (async () => {
      if (debouncedNewDrawings.length > 0) {
        const batch = writeBatch(firestore);
        const washingtonRef = doc(
          firestore,
          DRAWING_COLLECTION_NAME,
          id
        ) as DocumentReference<DrawingDoc>;

        debouncedNewDrawings.forEach((draw) =>
          batch.update<DrawingDoc>(washingtonRef, {
            drawings: arrayUnion(draw),
          })
        );
        await batch.commit();
        const docRef = await getDoc(
          doc(
            firestore,
            DRAWING_COLLECTION_NAME,
            id
          ) as DocumentReference<DrawingDoc>
        );
        const newDocument = docRef.data();
        if (subscribed && newDocument) {
          setDrawingDoc(newDocument)
          setNewDrawings([]);
        }
      }
    })();

    return () => {
      subscribed = false;
    };
  }, [debouncedNewDrawings, id]);

  const updateCanvas = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, row: number, col: number) => {
      if (e.pressure > 0) {
        setNewDrawings((p) => [
          ...p,
          {
            y: row,
            x: col,
            color: hexToRGB(inputColor),
            timestamp: new Date().toJSON(),
          },
        ]);
      }
    },
    [inputColor]
  );

  console.count();

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
          gridTemplateColumns: `repeat(${canvas.length}, 1fr)`,
          gridTemplateRows: `repeat(${canvas[0].length}, 1fr)`,
          maxWidth: "95vw",
          background: "white",
          padding: 10,
          border: "5px solid black",
        }}
      >
        {canvas.map((row, rowId) => (
          <Fragment key={rowId}>
            {row.map((col, colId) => (
              <button
                onPointerDown={(e) => updateCanvas(e, rowId, colId)}
                onPointerEnter={(e) => updateCanvas(e, rowId, colId)}
                key={colId}
                style={{
                  border: "none",
                  background: `rgb(${
                    (canvas[rowId][colId]).join(",")
                    // debouncedNewDrawings.find(
                    //   (draw) => draw.x === colId && draw.y === rowId
                    // )?.color || col.join(",")
                  })`,
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
          draw
        </p>
        <input
          type="color"
          value={inputColor}
          onChange={(e) => setInputColor(e.target.value)}
        />
      </div>
    </div>
  );
}
