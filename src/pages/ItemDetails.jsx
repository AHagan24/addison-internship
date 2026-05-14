import React from "react";
import EthImage from "../images/ethereum.svg";
import { Link, useParams } from "react-router-dom";

const ItemDetails = () => {
  const { nftId } = useParams();

  const [item, setItem] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchItemDetails() {
      try {
        const hotCollectionsResponse = await fetch(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
        );

        const newItemsResponse = await fetch(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems",
        );

        const hotCollections = await hotCollectionsResponse.json();
        const newItems = await newItemsResponse.json();

        const allItems = [...hotCollections, ...newItems];

        const selectedItem = allItems.find(
          (item) => item.nftId === Number(nftId),
        );

        setItem(selectedItem);
      } catch (error) {
        console.error("Error fetching item details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItemDetails();
  }, [nftId]);

  if (loading) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <section className="mt90 sm-mt-0">
            <div className="container">
              <div className="row">
                <div className="col-md-6">
                  <div className="skeleton skeleton-detail-image"></div>
                </div>

                <div className="col-md-6">
                  <div className="skeleton skeleton-detail-title"></div>
                  <div className="skeleton skeleton-detail-text"></div>
                  <div className="skeleton skeleton-detail-text short"></div>
                  <div className="skeleton skeleton-detail-author"></div>
                  <div className="skeleton skeleton-detail-price"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (!item) {
    return <div>Item not found.</div>;
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              <div className="col-md-6 text-center">
                <img
                  src={item.nftImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt={item.title}
                />
              </div>

              <div className="col-md-6">
                <div className="item_info">
                  <h2>{item.title}</h2>

                  <div className="item_info_counts">
                    <div className="item_info_views">
                      <i className="fa fa-eye"></i>
                      100
                    </div>

                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {item.likes || 74}
                    </div>
                  </div>

                  <p>
                    This NFT is part of the {item.title} collection. It is
                    listed with NFT ID #{item.nftId}.
                  </p>

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>

                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={`/author/${item.authorId}`}>
                            <img
                              className="lazy"
                              src={item.authorImage}
                              alt={item.title}
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>

                        <div className="author_list_info">
                          <Link to={`/author/${item.authorId}`}>
                            Owner #{item.authorId}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Creator</h6>

                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={`/author/${item.authorId}`}>
                            <img
                              className="lazy"
                              src={item.authorImage}
                              alt={item.title}
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>

                        <div className="author_list_info">
                          <Link to={`/author/${item.authorId}`}>
                            Author #{item.authorId}
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="spacer-40"></div>

                    <h6>Price</h6>

                    <div className="nft-item-price">
                      <img src={EthImage} alt="" />
                      <span>{item.price || "1.85"} ETH</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
