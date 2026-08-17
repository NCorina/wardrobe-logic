import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";  // For generating unique IDs

const storage = getStorage();

export default function CuratorPanel() {
  const [formData, setFormData] = useState({
    moodTitle: "",
    category: "fashion", // Default category
    scrapbookNote: "", // Make sure this is included for the text box
    quote: "",
    sound: "",
    book: "",
    print: "",
  });

  const [basePieceImage, setBasePieceImage] = useState(null); // Sketched base image
  const [styledPieceImages, setStyledPieceImages] = useState([]); // Real styled pieces images
  const [supportingImages, setSupportingImages] = useState([]);
  const [brands, setBrands] = useState([]);  // New state for brands

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSupportingImage = () => {
    setSupportingImages([...supportingImages, null]);
  };

  const handleSupportingImageChange = (index, file) => {
    const updated = [...supportingImages];
    updated[index] = file;
    setSupportingImages(updated);
  };

  const handleStyledPieceImageChange = (e) => {
    const files = e.target.files;
    const newImages = [...styledPieceImages];
    for (let i = 0; i < files.length; i++) {
      newImages.push(files[i]);
    }
    setStyledPieceImages(newImages);
  };

  // Handle adding and removing brands
  const handleBrandChange = (index, e) => {
    const updatedBrands = [...brands];
    updatedBrands[index] = e.target.value;
    setBrands(updatedBrands);
  };

  const handleAddBrand = () => {
    setBrands([...brands, ""]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const uploads = [];
  
    // Upload Base Piece Image (Sketched)
    if (basePieceImage) {
      const basePieceRef = ref(storage, `base-pieces/${uuidv4()}`);
      await uploadBytes(basePieceRef, basePieceImage);
      const basePieceUrl = await getDownloadURL(basePieceRef);
      uploads.push(basePieceUrl); // Base image URL
    }
  
    // Upload Styled Piece Images (Actual items you styled)
    for (let img of styledPieceImages) {
      if (img) {
        const refImg = ref(storage, `styled-pieces/${uuidv4()}`);
        await uploadBytes(refImg, img);
        const imgUrl = await getDownloadURL(refImg);
        uploads.push(imgUrl); // Styled image URL
      }
    }
  
    // Upload Supporting Images
    for (let img of supportingImages) {
      if (img) {
        const refImg = ref(storage, `supporting-images/${uuidv4()}`);
        await uploadBytes(refImg, img);
        const imgUrl = await getDownloadURL(refImg);
        uploads.push(imgUrl); // Supporting image URL
      }
    }

    const curation = {
      ...formData,
      pieceImages: uploads,  // Store all image URLs
      brands: brands,  // Store brands with links
      createdAt: serverTimestamp(),  // Automatically adds timestamp
    };
  
    // Save to basePieces collection
    await addDoc(collection(db, "basePieces"), curation);
    alert("Curation submitted!");
  
    // Reset the form
    setFormData({
      moodTitle: "",
      category: "fashion",
      scrapbookNote: "",
      quote: "",
      sound: "",
      book: "",
      print: "",
    });
    setBasePieceImage(null);
    setStyledPieceImages([]);
    setSupportingImages([]);
    setBrands([]);  // Reset the brands field
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/90 rounded-xl shadow">
      <h2 className="text-2xl font-serif text-rose-700 mb-6">New Curated Piece</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-1">Title</label>
          <input
            type="text"
            name="moodTitle"
            value={formData.moodTitle}
            onChange={handleChange}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        {/* Base Piece (Sketch) */}
        <div>
          <label className="block text-sm font-semibold mb-1">Base Piece (Sketch)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBasePieceImage(e.target.files[0])}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        {/* Styled Piece Images */}
        <div>
          <label className="block text-sm font-semibold mb-1">Styled Pieces (Actual Items)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleStyledPieceImageChange}
            multiple
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        {/* Supporting Images */}
        <div>
          <label className="block text-sm font-semibold mb-1">Add Supporting Images</label>
          {supportingImages.map((_, i) => (
            <input
              key={i}
              type="file"
              accept="image/*"
              onChange={(e) => handleSupportingImageChange(i, e.target.files[0])}
              className="w-full border rounded p-2 text-sm mb-2"
            />
          ))}
          <button
            type="button"
            onClick={handleAddSupportingImage}
            className="text-rose-500 underline text-sm hover:text-rose-700"
          >
            + Add Another Image
          </button>
        </div>

        {/* Scrapbook Note */}
        <div>
          <label className="block text-sm font-semibold mb-1">Scrapbook Note</label>
          <textarea
            name="scrapbookNote"
            value={formData.scrapbookNote}
            onChange={handleChange}
            rows={5}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

        {/* Suggested Brands */}
        <div>
          <label className="block text-sm font-semibold mb-1">Suggested Brands</label>
          {brands.map((brand, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={brand}
                onChange={(e) => handleBrandChange(index, e)}
                placeholder="Brand Name & Link"
                className="w-full border rounded p-2 text-sm"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddBrand}
            className="text-rose-500 underline text-sm hover:text-rose-700"
          >
            + Add Another Brand
          </button>
        </div>

        <button
          type="submit"
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          Submit Curation
        </button>
      </form>
    </div>
  );
}
