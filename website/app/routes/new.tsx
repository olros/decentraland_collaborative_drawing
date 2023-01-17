import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import type { CollectionReference } from "firebase/firestore";
import { addDoc, collection } from "firebase/firestore";

export type DrawingDoc = {
  size: number;
  rows: {
    columns: {
      rgb: string;
    }[];
  }[];
};

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const size = url.searchParams.get("size")
    ? Number(url.searchParams.get("size"))
    : 50;

  const newData: DrawingDoc = {
    size,
    rows: Array.from({ length: size }, (v, i) => ({
      columns: Array.from({ length: size }, (v, i) => ({ rgb: "255,255,255" })),
    })),
  };

  const newDocRef = await addDoc(
    collection(
      firestore,
      DRAWING_COLLECTION_NAME
    ) as CollectionReference<DrawingDoc>,
    newData
  );

  return redirect(`/${newDocRef.id}`);
}
