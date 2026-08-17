import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase"; // Import Firebase auth

export default function SingleCurationPage() {
  const { id } = useParams();
  const [mood, setMood] = useState(null);
  const [user, setUser] = useState(null); // State for user
  const [brands, setBrands] = useState([]);  // State for storing brands

  useEffect(() => {
    const fetchMood = async () => {
      const docRef = doc(db, "basePieces", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMood({ id: docSnap.id, ...docSnap.data() });
        setBrands(docSnap.data().brands || []);  // Fetch brands from Firestore
      }
    };
    fetchMood();
  }, [id]);

  useEffect(() => {
    // Set the logged-in user
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (!mood) return <p className="text-center mt-20">Loading curation...</p>;

  // Only show the "Edit" link if the user is logged in and is the curator
  const isCurator = user && user.uid === "6BUKQUcGvVc7mqt3S6echELB33D3"; // Check if the user is the curator

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 font-serif text-gray-800 bg-fixed bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('/fabric-588884_1280.jpg')" }}>
      <div className="mb-6 text-center">
        <h1 className="text-4xl text-rose-700 font-bold mb-2">{mood.moodTitle}</h1>
        <p className="italic text-sm text-gray-500">{mood.category}</p>
        {isCurator && (
          <Link
            to={`/curation/${mood.id}/edit`}
            className="text-sm text-rose-600 underline hover:text-rose-800"
          >
            ✎ Edit this piece
          </Link>
        )}
      </div>

      <div className="space-y-8">
        {/* Display the text once */}
        <div className="text-lg text-gray-700 mb-6">{mood.scrapbookNote || "Write your thoughts here..."}</div>

        {/* Display Suggested Brands */}
        {brands.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-gray-800">Suggested Brands</h3>
            <ul className="list-disc pl-6">
              {brands.map((brand, index) => (
                <li key={index} className="text-gray-600">{brand}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Render images with the text not repeating */}
        {mood.pieceImages?.map((image, index) => (
          <div key={index} className="flex flex-col md:flex-row items-center mb-8">
            {/* Display the image on the left for even index */}
            {index % 2 === 0 ? (
              <>
                <div className="flex-1 mb-4 md:mb-0 md:mr-8">
                  <img
                    src={image}
                    alt={`Styled Piece ${index}`}
                    className="w-full h-auto object-cover rounded-lg shadow-xl"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  {/* Text will not repeat */}
                </div>
              </>
            ) : (
              <>
                {/* Display the image on the right for odd index */}
                <div className="flex-1 text-center md:text-right">
                  {/* Text will not repeat */}
                </div>
                <div className="flex-1 mb-4 md:mb-0 md:ml-8">
                  <img
                    src={image}
                    alt={`Styled Piece ${index}`}
                    className="w-full h-auto object-cover rounded-lg shadow-xl"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
