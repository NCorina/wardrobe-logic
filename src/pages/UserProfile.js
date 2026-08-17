import React from "react";
import { useParams } from "react-router-dom";

const UserProfile = () => {
  const { userId } = useParams();

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-2">User Profile</h2>
      <p className="text-gray-600">Viewing public styles by user ID: {userId}</p>
    </div>
  );
};

export default UserProfile;
