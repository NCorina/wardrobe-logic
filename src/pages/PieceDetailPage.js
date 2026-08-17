import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function PieceDetailPage() {
  const { pieceId } = useParams();
  const [piece, setPiece] = useState(null);

  useEffect(() => {
    const fetchPieceDetails = async () => {
      const docRef = doc(db, "fashionPieces", pieceId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPiece(docSnap.data());
      }
    };
    fetchPieceDetails();
  }, [pieceId]);

  if (!piece) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-serif text-rose-700">{piece.moodTitle}</h2>
      <img src={piece.pieceImages[0]} alt={piece.moodTitle} className="w-full h-auto object-cover my-4" />
      <p className="text-lg text-gray-700">{piece.description}</p>

      <div className="mt-4">
        <h3 className="text-rose-600 text-lg">Fabric/Pattern Options</h3>
        <p>{piece.fabricOptions}</p>
      </div>

      <div className="mt-4">
        <h3 className="text-rose-600 text-lg">Store Links</h3>
        <p>{piece.storeLinks}</p>
      </div>
    </div>
  );
}
