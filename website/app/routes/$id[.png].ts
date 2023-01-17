import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { DocumentReference } from "firebase/firestore";
import { getDoc, doc } from "firebase/firestore";
import Jimp from 'jimp';
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import { drawingToImage } from "./$id";
import type { DrawingDoc } from "./new";

export async function loader({ params }: LoaderArgs) {
  const docRef = await getDoc(
    doc(firestore, DRAWING_COLLECTION_NAME, params.id as string) as DocumentReference<DrawingDoc>
  );
  const drawingDoc = docRef.data();
  if (!drawingDoc) {
    return redirect("/");
  }
  const document = drawingToImage(drawingDoc);

  const width = drawingDoc.columns;
  const height = drawingDoc.rows;
  const data = Buffer.alloc(width * height * 4);
  
  let i = 0;
  document.forEach((row) => {
    row.forEach((col) => {
      col.forEach((channel) => {
        data[i++] = channel;
      });
      data[i++] = 0xff; // alpha - ignored in JPEGs
    });
  })

  const image = await new Jimp({ data, width, height });
  image.scale(10, Jimp.RESIZE_NEAREST_NEIGHBOR)
  image.quality(100)

  const buffer = await image.getBufferAsync(Jimp.MIME_JPEG)

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
