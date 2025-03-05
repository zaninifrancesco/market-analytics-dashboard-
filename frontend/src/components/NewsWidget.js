import React, { useEffect, useState } from "react";

const NewsWidget = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/economic_news")
      .then((res) => res.json())
      .then((data) => setNews(data.slice(0, 5))); // Mostra solo le prime 5 news
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Latest Economic News</h2>
      <div className="space-y-4">
        {news.map((article, index) => (
          <div 
            key={index} 
            className="border-b border-gray-100 pb-3 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 rounded-lg p-3"
          >
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block"
            >
              <h3 className="text-base font-semibold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {article.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="text-xs text-blue-500 hover:text-blue-700">
                  Read more →
                </span>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsWidget;