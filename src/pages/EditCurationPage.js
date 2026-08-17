import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const storage = getStorage();

export default function EditCurationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [supportingImages, setSupportingImages] = useState([]);
  const [styledImages, setStyledImages] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, "basePieces", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setFormData(snapshot.data());
        setBrands(snapshot.data().brands || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

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

  const handleAddStyledImage = () => {
    setStyledImages([...styledImages, null]);
  };

  const handleStyledImageChange = (index, file) => {
    const updated = [...styledImages];
    updated[index] = file;
    setStyledImages(updated);
  };

  const handleBrandChange = (index, e) => {
    const updatedBrands = [...brands];
    updatedBrands[index] = e.target.value;
    setBrands(updatedBrands);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const uploads = [];
  
    // Handle main image (base piece image)
    if (mainImage) {
      const mainRef = ref(storage, `base-pieces/${uuidv4()}`);
      await uploadBytes(mainRef, mainImage);
      const mainUrl = await getDownloadURL(mainRef);
      uploads.push(mainUrl); // Add main image URL
    } else if (formData.pieceImages && formData.pieceImages.length > 0) {
      uploads.push(...formData.pieceImages); // Keep old images if no new image uploaded
    }
  
    // Handle supporting images
    for (let img of supportingImages) {
      if (img) {
        const refImg = ref(storage, `supporting-images/${uuidv4()}`);
        await uploadBytes(refImg, img);
        const imgUrl = await getDownloadURL(refImg);
        uploads.push(imgUrl); // Add supporting image URL
      }
    }
  
    // Handle styled images
    for (let img of styledImages) {
      if (img) {
        const refImg = ref(storage, `styled-images/${uuidv4()}`);
        await uploadBytes(refImg, img);
        const imgUrl = await getDownloadURL(refImg);
        uploads.push(imgUrl); // Add styled image URL
      }
    }
  
    // Update the curation data with the new images and brands
    const updatedCuration = {
      ...formData,
      pieceImages: uploads,  // Include both old and new images
      brands: brands,  // Store brands with links (this is the part you want to update)
    };
  
    // Update the curation in Firestore
    const docRef = doc(db, "basePieces", id); // Ensure we're updating the correct document
    await updateDoc(docRef, updatedCuration); // Update the document with new curation data
    alert("Curation updated!");
    navigate(`/curation/${id}`); // Navigate to the updated curation page
  };
  

  const handleDelete = async () => {
    const docRef = doc(db, "basePieces", id);
    const snapshot = await getDoc(docRef);

    // Delete images from Firebase Storage
    if (snapshot.exists()) {
      const pieceImages = snapshot.data().pieceImages || [];
      pieceImages.forEach(async (imageURL) => {
        const imageRef = ref(storage, imageURL);
        await deleteObject(imageRef); // Use deleteObject to delete image
      });
    }

    // Delete the curation document from Firestore
    await deleteDoc(docRef);
    alert("Curation deleted");
    navigate("/curated");
  };

  if (loading || !formData) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/90 rounded-xl shadow">
      <h2 className="text-2xl font-serif text-rose-700 mb-6">Edit Curation</h2>
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

        <div>
          <label className="block text-sm font-semibold mb-1">Scrapbook Note</label>
          <textarea
            name="scrapbookNote"
            value={formData.scrapbookNote}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded p-2 text-sm"
          />
        </div>

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
            onClick={() => setBrands([...brands, ""])}
            className="text-rose-500 underline text-sm hover:text-rose-700"
          >
            + Add Another Brand
          </button>
        </div>

        {/* Upload Main Image */}
        <div>
          <label className="block text-sm font-semibold mb-1">Upload Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainImage(e.target.files[0])}
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
            + Add Another Supporting Image
          </button>
        </div>

        {/* Styled Images */}
        <div>
          <label className="block text-sm font-semibold mb-1">Add Styled Images</label>
          {styledImages.map((_, i) => (
            <input
              key={i}
              type="file"
              accept="image/*"
              onChange={(e) => handleStyledImageChange(i, e.target.files[0])}
              className="w-full border rounded p-2 text-sm mb-2"
            />
          ))}
          <button
            type="button"
            onClick={handleAddStyledImage}
            className="text-rose-500 underline text-sm hover:text-rose-700"
          >
            + Add Another Styled Image
          </button>
        </div>

        <button
          type="submit"
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
        >
          Save Changes
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="mt-4 text-red-600 underline hover:text-red-800"
      >
        Delete Curation
      </button>
    </div>
  );
}
