import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";

const TopSellers = () => {
  const [topSellers, setTopSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopSellers() {
      try {
        const response = await fetch(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers",
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch top sellers: ${response.status}`);
        }

        const data = await response.json();
        const sellers = Array.isArray(data)
          ? data
          : Array.isArray(data?.value)
            ? data.value
            : [];

        setTopSellers(sellers);
      } catch (error) {
        console.error("Error fetching top sellers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTopSellers();
  }, []);

  const getSellerValue = (seller) => {
    if (seller?.price !== undefined) {
      return `${seller.price} ETH`;
    }

    if (seller?.volume !== undefined) {
      return `${seller.volume} ETH`;
    }

    if (seller?.value !== undefined) {
      return `${seller.value} ETH`;
    }

    return "N/A";
  };

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center" data-aos="fade-up">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>
          <div className="col-md-12">
            <ol className="author_list">
              {loading
                ? new Array(12).fill(0).map((_, index) => (
                    <li key={index}>
                      <div className="author_list_pp">
                        <img
                          className="lazy pp-author"
                          src={AuthorImage}
                          alt=""
                        />
                      </div>
                      <div className="author_list_info">
                        <span>Loading...</span>
                      </div>
                    </li>
                  ))
                : topSellers.map((seller, index) => {
                    const authorId = seller?.authorId || seller?.id;
                    const authorName =
                      seller?.authorName ||
                      seller?.name ||
                      `Author #${authorId}`;
                    const ranking = index + 1;

                    return (
                      <li
                        key={seller?.id || authorId || index}
                        data-aos="fade-up"
                        data-aos-delay={index * 20}
                      >
                        <div className="author_list_pp">
                          <Link to={`/author/${authorId}`}>
                            <img
                              className="lazy pp-author"
                              src={seller?.authorImage || AuthorImage}
                              alt={authorName}
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${authorId}`}>{authorName}</Link>
                          <span>
                            {ranking ? `#${ranking} - ` : ""}
                            {getSellerValue(seller)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;
