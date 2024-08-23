import React, { useState } from 'react';

const ExpandableText = ({ text, maxLength, onMoreClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldTruncate = text.length > maxLength;

  return (
    <div>
      <span>
        {shouldTruncate && !isExpanded ? `${text.substring(0, maxLength)}...` : text}
      </span>
      
      {shouldTruncate && (
        <button
          onClick={onMoreClick}
          className="text-gray-500 hover:text-gray-700 ml-2 text-sm"
        >
          {isExpanded ? 'Свернуть' : 'Развернуть'}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
