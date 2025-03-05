import React, { useEffect, useState } from "react";

const NewsWidget = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/economic_news")
      .then((res) => res.json())
      .then((data) => setNews(data.slice(0, 5))); // Mostra solo le prime 5 news
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">News</h2>
      <ul>
        {news.map((article, index) => (
          <li key={index} className="py-2">
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsWidget;
