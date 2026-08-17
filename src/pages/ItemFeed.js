import React from "react";
import { useParams } from "react-router-dom";

const ItemFeed = () => {
  const { itemId } = useParams();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">Community Stylings</h2>
      <p className="text-gray-600">Coming soon: Stylings for item ID: {itemId}</p>
    </div>
  );
};

export default ItemFeed;
