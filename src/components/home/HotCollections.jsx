import React from "react";
import OwlCarousel from "react-owl-carousel";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const HotCollections = () => {
  const [collections, setCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
        );

        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
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
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center" data-aos="fade-up">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            {loading ? (
              <div className="row">
                {new Array(4).fill(0).map((_, index) => (
                  <div className="col-lg-3 col-md-6 col-sm-6" key={index}>
                    <div className="nft_coll skeleton-card">
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
                {collections.map((collection, index) => (
                  <div
                    className="item"
                    key={collection.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div className="nft_coll">
                      <div className="nft_wrap">
                        <Link to={`/item-details/${collection.nftId}`}>
                          <img
                            src={collection.nftImage}
                            className="lazy img-fluid"
                            alt={collection.title}
                          />
                        </Link>
                      </div>

                      <div className="nft_coll_pp">
                        <Link to={`/author/${collection.authorId}`}>
                          <img
                            className="lazy pp-coll"
                            src={collection.authorImage}
                            alt={collection.title}
                          />
                        </Link>
                        <i className="fa fa-check"></i>
                      </div>

                      <div className="nft_coll_info">
                        <Link to={`/item-details/${collection.nftId}`}>
                          <h4>{collection.title}</h4>
                        </Link>
                        <span>ERC-{collection.code}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </OwlCarousel>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotCollections;
