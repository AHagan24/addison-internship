import React from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import Countdown from "../../components/Countdown";
import { Link } from "react-router-dom";

const getValidExpiryDate = (expiryDate) => {
  if (!expiryDate) {
    return null;
  }

  const date = Number(expiryDate);

  if (!date || date <= Date.now()) {
    return null;
  }

  return date;
};

const NewItems = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems",
        );

        const data = await response.json();

        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const options = {
    items: 4,
    margin: 24,
    nav: true,
    loop: true,
    dots: false,
    slideBy: 1,
    navText: [
      '<i class="fa fa-chevron-left"></i>',
      '<i class="fa fa-chevron-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1024: { items: 4 },
    },
  };
  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center" data-aos="fade-up">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            {loading ? (
              <div className="row">
                {new Array(4).fill(0).map((_, index) => (
                  <div className="col-lg-3 col-md-6 col-sm-6" key={index}>
                    <div className="nft__item skeleton-card">
                      <div className="skeleton skeleton-img"></div>
                      <div className="skeleton skeleton-avatar"></div>
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-text"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <OwlCarousel className="owl-theme" {...options}>
                {items.map((item, index) => {
                  const validExpiryDate = getValidExpiryDate(item.expiryDate);

                  return (
                    <div
                      className="item"
                      key={item.id}
                      data-aos="fade-up"
                      data-aos-delay={index * 100}
                    >
                      <div className="nft__item">
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
                        {validExpiryDate && (
                          <Countdown expiryDate={validExpiryDate} />
                        )}

                        <div className="nft__item_wrap">
                          <div className="nft__item_extra">
                            <div className="nft__item_buttons">
                              <button>Buy Now</button>

                              <div className="nft__item_share">
                                <h4>Share</h4>

                                <a href="/">
                                  <i className="fa fa-facebook fa-lg"></i>
                                </a>

                                <a href="/">
                                  <i className="fa fa-twitter fa-lg"></i>
                                </a>

                                <a href="/">
                                  <i className="fa fa-envelope fa-lg"></i>
                                </a>
                              </div>
                            </div>
                          </div>

                          <Link to={`/item-details/${item.nftId}`}>
                            <img
                              src={item.nftImage}
                              className="lazy nft__item_preview"
                              alt={item.title}
                            />
                          </Link>
                        </div>

                        <div className="nft__item_info">
                          <Link to={`/item-details/${item.nftId}`}>
                            <h4>{item.title}</h4>
                          </Link>

                          <div className="nft__item_price">
                            {item.price} ETH
                          </div>

                          <div className="nft__item_like">
                            <i className="fa fa-heart"></i>
                            <span>{item.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </OwlCarousel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewItems;
