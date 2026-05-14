import React from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";
import { fetchExploreItems } from "../../api";
import Countdown from "../Countdown";

const getValidExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return null;
  }

  const expiryTime = Number(expiryDate) || Date.parse(expiryDate);

  if (!expiryTime || expiryTime <= Date.now()) {
    return null;
  }

  return expiryTime;
};

const ExploreItems = () => {
  const [items, setItems] = React.useState([]);
  const [filter, setFilter] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(8);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        setError(null);
        setVisibleCount(8);

        const exploreItems = await fetchExploreItems(filter);
        setItems(exploreItems);
      } catch (error) {
        console.error("Error fetching explore items:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [filter]);

  return (
    <>
      <div>
        <select
          id="filter-items"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {loading &&
        new Array(8).fill(0).map((_, index) => (
          <div
            key={index}
            className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            style={{ display: "block", backgroundSize: "cover" }}
          >
            <div className="nft__item skeleton-card">
              <div className="skeleton skeleton-img"></div>
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          </div>
        ))}

      {error && (
        <div className="col-md-12 text-center">
          <p>Error loading explore items.</p>
        </div>
      )}

      {!loading &&
        !error &&
        items.slice(0, visibleCount).map((item, index) => {
          const nftId = item?.nftId ?? item?.id ?? index;
          const authorId = item?.authorId ?? "unknown";
          const title = item?.title || "Untitled NFT";
          const expiryDate = getValidExpiryDate(item?.expiryDate);

          return (
            <div
              key={nftId}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
              style={{ display: "block", backgroundSize: "cover" }}
            >
              <div className="nft__item">
                <div className="author_list_pp">
                  <Link
                    to={`/author/${authorId}`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                    <img
                      className="lazy"
                      src={item?.authorImage || AuthorImage}
                      alt={item?.authorName || `Author ${authorId}`}
                    />
                    <i className="fa fa-check"></i>
                  </Link>
                </div>
                {expiryDate && <Countdown expiryDate={expiryDate} />}

                <div className="nft__item_wrap">
                  <div className="nft__item_extra">
                    <div className="nft__item_buttons">
                      <button>Buy Now</button>
                      <div className="nft__item_share">
                        <h4>Share</h4>
                        <a href="/" target="_blank" rel="noreferrer">
                          <i className="fa fa-facebook fa-lg"></i>
                        </a>
                        <a href="/" target="_blank" rel="noreferrer">
                          <i className="fa fa-twitter fa-lg"></i>
                        </a>
                        <a href="/">
                          <i className="fa fa-envelope fa-lg"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                  <Link to={`/item-details/${nftId}`}>
                    <img
                      src={item?.nftImage || nftImage}
                      className="lazy nft__item_preview"
                      alt={title}
                    />
                  </Link>
                </div>
                <div className="nft__item_info">
                  <Link to={`/item-details/${nftId}`}>
                    <h4>{title}</h4>
                  </Link>
                  <div className="nft__item_price">
                    {item?.price ?? "N/A"} ETH
                  </div>
                  <div className="nft__item_like">
                    <i className="fa fa-heart"></i>
                    <span>{item?.likes ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

      {!loading && !error && visibleCount < items.length && (
        <div className="col-md-12 text-center">
          <Link
            to=""
            id="loadmore"
            className="btn-main lead"
            onClick={(event) => {
              event.preventDefault();
              setVisibleCount((currentCount) => currentCount + 4);
            }}
          >
            Load more
          </Link>
        </div>
      )}
    </>
  );
};

export default ExploreItems;
