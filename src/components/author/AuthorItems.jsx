import React from "react";
import { Link, useParams } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftImage from "../../images/nftImage.jpg";
import { fetchMarketplaceItems } from "../../api";

const getOwnerId = (item) =>
  item?.ownerId ||
  item?.ownerAuthorId ||
  item?.owner?.id ||
  item?.owner?.authorId ||
  item?.authorId;

const AuthorItems = ({ authorId }) => {
  const params = useParams();
  const currentAuthorId = authorId || params.authorId;
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchAuthorItems() {
      try {
        setLoading(true);
        setError(null);

        if (!currentAuthorId) {
          setItems([]);
          return;
        }

        const marketplaceItems = await fetchMarketplaceItems();
        const filteredItems = marketplaceItems.filter(
          (item) => Number(getOwnerId(item)) === Number(currentAuthorId),
        );

        setItems(filteredItems);
      } catch (error) {
        console.error("Error fetching author items:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthorItems();
  }, [currentAuthorId]);

  if (loading) {
    return (
      <div className="de_tab_content">
        <div className="tab-1">
          <div className="row">
            {new Array(4).fill(0).map((_, index) => (
              <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={index}>
                <div className="nft__item skeleton-card">
                  <div className="skeleton skeleton-img"></div>
                  <div className="skeleton skeleton-avatar"></div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="de_tab_content">
        <div className="tab-1">
          <div className="row">
            <div className="col-lg-12">
              <p>Error loading author items.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="de_tab_content">
      <div className="tab-1">
        <div className="row">
          {items.map((item, index) => {
            const nftId = item?.nftId ?? item?.id ?? index;
            const itemAuthorId = item?.authorId ?? currentAuthorId;
            const title = item?.title || "Untitled NFT";

            return (
              <div
                className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
                key={nftId}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="nft__item">
                  <div className="author_list_pp">
                    <Link to={`/author/${itemAuthorId}`}>
                      <img
                        className="lazy"
                        src={item?.authorImage || AuthorImage}
                        alt={item?.authorName || `Author ${itemAuthorId}`}
                      />
                      <i className="fa fa-check"></i>
                    </Link>
                  </div>

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

          {items.length === 0 && (
            <div className="col-lg-12">
              <p>No items found for this author.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthorItems;
