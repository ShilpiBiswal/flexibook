import React, { useEffect, useState } from 'react';
import { Card } from "flowbite-react";

const ExpandableCard = ({ book }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100; // Adjust this value to control initial text length

  const truncatedText = book.bookDescription.slice(0, maxLength);
  const shouldShowReadMore = book.bookDescription.length > maxLength;

  return (
    <Card className="relative flex flex-col h-full">
      <div className="h-96 overflow-hidden">
        <img 
          src={book.imageURL} 
          alt={book.bookTitle}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          {book.bookTitle}
        </h5>
        
        <div className="flex-grow">
          <p className="text-gray-700">
            {isExpanded ? book.bookDescription : truncatedText}
            {!isExpanded && shouldShowReadMore && "..."}
          </p>
          
          {shouldShowReadMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 mt-2 text-sm font-medium"
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
        
        <button className="w-full bg-blue-700 text-white font-semibold py-2 rounded mt-4 hover:bg-blue-800 transition-colors">
          Buy Now
        </button>
      </div>
    </Card>
  );
};

const Shop = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5500/all-books")
      .then(res => res.json())
      .then(data => setBooks(data));
  }, []);

  return (
    <div className="mt-28 px-4 lg:px-24">
      <h2 className="text-5xl font-bold text-center">All Books are here</h2>
      
      <div className="grid gap-8 my-12 lg:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 grid-cols-1">
        {books.map(book => (
          <ExpandableCard key={book.id || book._id} book={book} />
        ))}
      </div>
    </div>
  );
};

export default Shop;