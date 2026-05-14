import React from "react";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { Link, useParams } from "react-router-dom";

const authorData = {
  83937449: {
    name: "Franklin Greer",
    username: "@greerrrr",
    wallet: "0xA91F83937449ETH",
    followers: 1132,
  },

  55757699: {
    name: "Sophia Blake",
    username: "@sophiablake",
    wallet: "0xB22C55757699NFT",
    followers: 842,
  },

  31906377: {
    name: "Marcus Lee",
    username: "@marcuslee",
    wallet: "0xC73D31906377WEB3",
    followers: 1564,
  },

  72378156: {
    name: "Elena Rivers",
    username: "@elenarivers",
    wallet: "0xD91A72378156ART",
    followers: 721,
  },

  18556210: {
    name: "Tyler Woods",
    username: "@tylerwoods",
    wallet: "0xE54F18556210DAO",
    followers: 932,
  },

  92837465: {
    name: "Sarah Parker",
    username: "@sarahparker",
    wallet: "0xF82B92837465NFT",
    followers: 1288,
  },

  24702857: {
    name: "Monica Lucas",
    username: "@monicalucas",
    wallet: "0xG44C24702857ETH",
    followers: 573,
  },
};

const Author = () => {
  const { authorId } = useParams();
  const profile = authorData[authorId];

  const [author, setAuthor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchAuthor() {
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

        const foundAuthor = allItems.find(
          (item) => item.authorId === Number(authorId),
        );

        setAuthor(foundAuthor);
      } catch (error) {
        console.error("Error fetching author:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [authorId]);

  if (loading) {
    return <div>Loading author...</div>;
  }

  if (!author) {
    return <div>Author not found.</div>;
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          data-bgimage="url(images/author_banner.jpg) top"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <img src={author.authorImage} alt="" />

                      <i className="fa fa-check"></i>

                      <div className="profile_name">
                        <h4>
                          {profile?.name || `Author #${authorId}`}
                          <span className="profile_username">
                            {profile?.username || `@author${authorId}`}
                          </span>
                          <span id="wallet" className="profile_wallet">
                            {profile?.wallet || authorId}
                          </span>
                          <button id="btn_copy" title="Copy Text">
                            Copy
                          </button>
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      <div className="profile_follower">
                        {profile?.followers || 0} followers
                      </div>

                      <Link to="#" className="btn-main">
                        Follow
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  <AuthorItems authorId={authorId} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
