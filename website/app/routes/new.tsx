import { redirect } from "@remix-run/node";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import type { CollectionReference} from "firebase/firestore";
import { addDoc, collection} from "firebase/firestore";

export type DrawingDoc = {
  rows: number;
  columns: number;
  drawings: {
    x: number;
    y: number;
    color: number[];
    timestamp: string;
  }[];
};

export async function loader() {
  const data: DrawingDoc = {
    rows: 50,
    columns: 50,
    drawings: [],
  }
  
  const docRef = await addDoc<DrawingDoc>(collection(firestore, DRAWING_COLLECTION_NAME) as CollectionReference<DrawingDoc>, data);

  return redirect(`/${docRef.id}`);
}
