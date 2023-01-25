import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { QuerySnapshot } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { DRAWING_COLLECTION_NAME, firestore } from "~/fb";
import type { DrawingDoc } from "./new";

export async function loader() {
  const querySnapshot = (await getDocs(
    collection(firestore, DRAWING_COLLECTION_NAME)
  )) as QuerySnapshot<DrawingDoc>;
  const data = querySnapshot.docs.map((doc) => doc.id);
  return json({ data });
}

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <div
        style={{
          width: "80%",
          margin: "0 auto",
        }}
      >
        <h1>Welcome to the EiT-drawer</h1>
        <p>This is an overview of the drawings that exists, click to edit</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
        >
          {data.map((docId) => (
            <a
              style={{ border: "2px solid black" }}
              href={`/${docId}`}
              key={docId}
            >
              <img
                style={{ width: "100%", aspectRatio: 1, objectFit: "cover" }}
                src={`/${docId}.png`}
                alt=""
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
