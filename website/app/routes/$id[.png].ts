import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { DocumentReference } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";
import Jimp from "jimp";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import type { DrawingDoc } from "./new";

export async function loader({ params }: LoaderArgs) {
  const docRef = await getDoc(
    doc(
      firestore,
      DRAWING_COLLECTION_NAME,
      params.id as string
    ) as DocumentReference<DrawingDoc>
  );
  const drawingDoc = docRef.data();
  if (!drawingDoc) {
    return redirect("/");
  }

  const data = Buffer.alloc(drawingDoc.size * drawingDoc.size * 4);

  let i = 0;
  drawingDoc.rows.forEach((row) => {
    row.columns.forEach((col) => {
      const channels = col.rgb.split(",");
      channels.forEach((channel) => {
        data[i++] = Number(channel);
      });
      data[i++] = 0xff; // alpha - ignored in JPEGs
    });
  });

  const image = await new Jimp({
    data,
    width: drawingDoc.size,
    height: drawingDoc.size,
  });
  image.scale(10, Jimp.RESIZE_NEAREST_NEIGHBOR);
  image.quality(100);

  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
