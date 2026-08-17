function OutfitCard({ name, vibe, tags, notes, image }) {
    return (
      <div className="border border-gray-300 rounded-xl p-4 shadow-sm bg-white max-w-xs">
        {image && (
          <img
            src={image}
            alt={name}
            className="w-full h-60 object-cover rounded-md mb-3"
          />
        )}
        <h2 className="text-xl font-semibold font-serif text-gray-800">{name}</h2>
        <p className="text-sm italic text-rose-600 mb-2">{vibe}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {tags.map(tag => (
            <span className="bg-gray-100 px-2 py-1 rounded-full" key={tag}>{tag}</span>
          ))}
        </div>
        <p className="mt-3 text-sm text-gray-500">{notes}</p>
      </div>
    );
  }
  
  export default OutfitCard;
  