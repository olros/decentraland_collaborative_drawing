import type { LoaderArgs} from "@remix-run/node";
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

export async function loader({ params }: LoaderArgs) {
  const size = params.size ? Number(params.size) : 50; 

  const data: DrawingDoc = {
    rows: size,
    columns: size,
    drawings: [],
  }
  
  const docRef = await addDoc<DrawingDoc>(collection(firestore, DRAWING_COLLECTION_NAME) as CollectionReference<DrawingDoc>, data);

  return redirect(`/${docRef.id}`);
}
