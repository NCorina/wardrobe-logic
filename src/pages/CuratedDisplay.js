import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function CuratedDisplay() {
  const [curatedPieces, setCuratedPieces] = useState([]);

  useEffect(() => {
    const fetchCuratedImages = async () => {
      const q = query(collection(db, "basePieces"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCuratedPieces(data);
    };
    fetchCuratedImages();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-serif text-gray-800">
      <h1 className="text-4xl text-rose-700 font-bold text-center mb-12">One piece at a time. Curated with Intention.</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
        {curatedPieces.map((piece) => (
          <Link to={`/curation/${piece.id}`} key={piece.id} className="block transform hover:scale-[1.02] transition duration-300">
            <div className="relative w-full h-[22rem] flex flex-col justify-end items-center shadow-xl">
              {/* Loop through all pieceImages */}
              {piece.pieceImages?.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={piece.moodTitle}
                  className="absolute top-0 left-0 w-full h-[85%] object-cover"
                  style={{ borderRadius: "6px" }}
                />
              ))}
              <div className="text-[12px] italic text-gray-600 mb-3 mt-[85%] px-2">{piece.moodTitle}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
