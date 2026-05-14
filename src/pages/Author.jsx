import React from "react";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorImage from "../images/author_thumbnail.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { Link, useParams } from "react-router-dom";
import { fetchTopSellers } from "../api";

const getFallbackFollowers = (authorId) => {
  const numericAuthorId = Number(authorId) || 0;
  return 100 + (numericAuthorId % 4901);
};

const getUsername = (author, authorId) => {
  if (author?.username) {
    return author.username;
  }

  if (author?.authorUsername) {
    return author.authorUsername;
  }

  if (author?.authorName) {
    return `@${author.authorName.toLowerCase().replace(/\s+/g, "")}`;
  }

  return `@author${authorId}`;
};

const getProfileStat = (author, authorId) => {
  if (author?.followers) {
    return `${author.followers} followers`;
  }

  if (author?.volume) {
    return `${author.volume} ETH volume`;
  }

  if (author?.value) {
    return `${author.value} ETH volume`;
  }

  if (author?.price) {
    return `${author.price} ETH volume`;
  }

  return `${getFallbackFollowers(authorId)} followers`;
};

const Author = () => {
  const { authorId } = useParams();

  const [author, setAuthor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchAuthor() {
      try {
        setLoading(true);
        setError(null);

        const topSellers = await fetchTopSellers();
        const foundAuthor = topSellers.find(
          (seller) => seller.authorId === Number(authorId),
        );

        setAuthor(foundAuthor);
      } catch (error) {
        console.error("Error fetching author:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [authorId]);

  const profile = {
    name: author?.authorName || author?.name || `Author #${authorId}`,
    username: getUsername(author, authorId),
    wallet: author?.wallet || `0x${authorId}NFT`,
    stat: getProfileStat(author, authorId),
  };

  if (loading) {
    return <div>Loading author...</div>;
  }

  if (error) {
    return <div>Error loading author.</div>;
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
                      <img src={author.authorImage || AuthorImage} alt="" />

                      <i className="fa fa-check"></i>

                      <div className="profile_name">
                        <h4>
                          {profile.name}
                          <span className="profile_username">
                            {profile.username}
                          </span>
                          <span id="wallet" className="profile_wallet">
                            {profile.wallet}
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
                        {profile.stat}
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
