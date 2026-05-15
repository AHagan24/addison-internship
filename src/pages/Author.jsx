import React from "react";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorImage from "../images/author_thumbnail.jpg";
import AuthorItems from "../components/author/AuthorItems";
import { Link, useParams } from "react-router-dom";
import { fetchAuthor } from "../api";

const getAuthorName = (author, authorId) => {
  return (
    author?.authorName ||
    author?.name ||
    author?.displayName ||
    author?.username ||
    `Author #${authorId}`
  );
};

const getUsername = (author, authorId) => {
  if (author?.username) {
    return author.username.startsWith("@")
      ? author.username
      : `@${author.username}`;
  }

  if (author?.authorUsername) {
    return author.authorUsername.startsWith("@")
      ? author.authorUsername
      : `@${author.authorUsername}`;
  }

  if (author?.authorName) {
    return `@${author.authorName.toLowerCase().replace(/\s+/g, "")}`;
  }

  return `@author${authorId}`;
};

const getFollowers = (author) => {
  if (author?.followers !== undefined && author?.followers !== null) {
    return `${author.followers} followers`;
  }

  if (author?.followerCount !== undefined && author?.followerCount !== null) {
    return `${author.followerCount} followers`;
  }

  return "0 followers";
};

const getProfileImage = (author) => {
  return (
    author?.authorImage ||
    author?.profileImage ||
    author?.avatar ||
    author?.image ||
    AuthorImage
  );
};

const getBannerImage = (author) => {
  return (
    author?.banner ||
    author?.bannerImage ||
    author?.authorBanner ||
    author?.coverImage ||
    AuthorBanner
  );
};

const getWallet = (author) => {
  return author?.wallet || author?.walletAddress || author?.address || "";
};

const getExtraAuthorFields = (author) => {
  if (!author) {
    return [];
  }

  const hiddenFields = new Set([
    "authorId",
    "id",
    "authorName",
    "name",
    "displayName",
    "username",
    "authorUsername",
    "wallet",
    "walletAddress",
    "address",
    "followers",
    "followerCount",
    "authorImage",
    "profileImage",
    "avatar",
    "image",
    "banner",
    "bannerImage",
    "authorBanner",
    "coverImage",
  ]);

  return Object.entries(author).filter(([key, value]) => {
    return (
      !hiddenFields.has(key) &&
      value !== undefined &&
      value !== null &&
      value !== "" &&
      (typeof value === "string" || typeof value === "number")
    );
  });
};

const formatFieldName = (fieldName) => {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
};

const Author = () => {
  const { authorId } = useParams();

  const [author, setAuthor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function loadAuthor() {
      try {
        setLoading(true);
        setError(null);

        if (!authorId) {
          setAuthor(null);
          return;
        }

        const authorData = await fetchAuthor(authorId);
        setAuthor(
          authorData && Object.keys(authorData).length > 0 ? authorData : null,
        );
      } catch (error) {
        console.error("Error fetching author:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    loadAuthor();
  }, [authorId]);

  const profile = {
    name: getAuthorName(author, authorId),
    username: getUsername(author, authorId),
    wallet: getWallet(author),
    followers: getFollowers(author),
    image: getProfileImage(author),
    banner: getBannerImage(author),
    extraFields: getExtraAuthorFields(author),
  };

  if (loading) {
    return (
      <div id="wrapper">
        <div className="no-bottom no-top" id="content">
          <div id="top"></div>

          <section
            id="profile_banner"
            aria-label="section"
            className="text-light skeleton"
            data-bgimage="url(images/author_banner.jpg) top"
          ></section>

          <section aria-label="section">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <div className="d_profile de-flex">
                    <div className="de-flex-col">
                      <div className="profile_avatar">
                        <div className="skeleton skeleton-avatar"></div>

                        <div className="profile_name">
                          <h4>
                            <span className="skeleton skeleton-title"></span>
                            <span className="profile_username skeleton skeleton-text"></span>
                            <span
                              id="wallet"
                              className="profile_wallet skeleton skeleton-text"
                            ></span>
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="profile_follow de-flex">
                      <div className="de-flex-col">
                        <div className="profile_follower skeleton skeleton-text"></div>
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
          style={{ background: `url(${profile.banner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      <img src={profile.image} alt={profile.name} />

                      <i className="fa fa-check"></i>

                      <div className="profile_name">
                        <h4>
                          {profile.name}
                          <span className="profile_username">
                            {profile.username}
                          </span>
                          <span id="wallet" className="profile_wallet">
                            {profile.wallet || "Wallet unavailable"}
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
                        {profile.followers}
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
