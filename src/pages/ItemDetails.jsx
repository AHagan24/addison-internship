import React from "react";
import EthImage from "../images/ethereum.svg";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";
import { Link, useParams } from "react-router-dom";
import Countdown from "../components/Countdown";
import {
  fetchAuthor,
  fetchItemDetails,
  fetchMarketplaceItems,
  fetchTopSellers,
} from "../api";

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

const isValidItem = (item) => {
  return Boolean(item && typeof item === "object" && Object.keys(item).length);
};

const getAuthorId = (item) => {
  return item?.authorId ?? item?.creatorId ?? item?.ownerId;
};

const hasMissingItemDetails = (item) => {
  return !item?.nftImage || !item?.title || !getAuthorId(item);
};

const mergeMissingFields = (primary, fallback) => {
  const merged = { ...(primary || {}) };

  Object.entries(fallback || {}).forEach(([key, value]) => {
    if (
      (merged[key] === undefined ||
        merged[key] === null ||
        merged[key] === "") &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      merged[key] = value;
    }
  });

  return merged;
};

const getAuthorName = (author, authorId, fallbackLabel = "Author") => {
  return (
    author?.authorName ||
    author?.name ||
    author?.displayName ||
    author?.username ||
    (authorId ? `${fallbackLabel} #${authorId}` : `Unknown ${fallbackLabel}`)
  );
};

const getUsername = (author) => {
  const username = author?.username || author?.authorUsername;

  if (!username) {
    return "";
  }

  const normalizedUsername = String(username);

  return normalizedUsername.startsWith("@")
    ? normalizedUsername
    : `@${normalizedUsername}`;
};

const getFollowers = (author) => {
  if (author?.followers !== undefined && author?.followers !== null) {
    return `${author.followers} followers`;
  }

  if (author?.followerCount !== undefined && author?.followerCount !== null) {
    return `${author.followerCount} followers`;
  }

  return "";
};

const hasMissingAuthorProfileData = (author) => {
  return (
    !(
      author?.authorName ||
      author?.name ||
      author?.displayName ||
      author?.username ||
      author?.authorUsername
    ) ||
    (author?.followers === undefined && author?.followerCount === undefined)
  );
};

const getPersonValue = (item, type, fields) => {
  const nestedPerson = item?.[type];

  return fields.reduce((foundValue, field) => {
    if (foundValue !== undefined && foundValue !== null && foundValue !== "") {
      return foundValue;
    }

    const nestedField = field.charAt(0).toLowerCase() + field.slice(1);

    return item?.[`${type}${field}`] ?? nestedPerson?.[nestedField];
  }, undefined);
};

const getPersonProfile = (item, type, authorProfile) => {
  const fallbackLabel = type === "owner" ? "Owner" : "Creator";
  const id =
    getPersonValue(item, type, ["Id", "AuthorId"]) ??
    (type === "creator" ? item?.authorId : undefined);
  const name =
    getPersonValue(item, type, ["Name", "Username", "AuthorName"]) ||
    getAuthorName(authorProfile, id, fallbackLabel);
  const image =
    getPersonValue(item, type, [
      "Image",
      "ProfileImage",
      "AuthorImage",
      "Avatar",
    ]) ||
    authorProfile?.authorImage ||
    authorProfile?.profileImage ||
    authorProfile?.avatar ||
    authorProfile?.image ||
    AuthorImage;

  return {
    id,
    name,
    image,
    username:
      getPersonValue(item, type, ["Username"]) || getUsername(authorProfile),
    followers:
      getPersonValue(item, type, ["Followers", "FollowerCount"]) ||
      getFollowers(authorProfile),
  };
};

const getItemPersonProfile = (item, type) => {
  return {
    authorId:
      getPersonValue(item, type, ["Id", "AuthorId"]) ??
      (type === "creator" ? item?.authorId : undefined),
    authorName: getPersonValue(item, type, ["Name", "AuthorName"]),
    username: getPersonValue(item, type, ["Username"]),
    followers: getPersonValue(item, type, ["Followers"]),
    followerCount: getPersonValue(item, type, ["FollowerCount"]),
    authorImage: getPersonValue(item, type, [
      "Image",
      "ProfileImage",
      "AuthorImage",
      "Avatar",
    ]),
  };
};

const getAuthorLink = (authorId) => {
  return authorId ? `/author/${authorId}` : "#";
};

const ItemDetails = () => {
  const { nftId } = useParams();

  const [item, setItem] = React.useState(null);
  const [ownerProfile, setOwnerProfile] = React.useState(null);
  const [creatorProfile, setCreatorProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const authorCache = new Map();
    let topSellersPromise = null;

    async function enrichPersonProfile(personProfile) {
      if (!personProfile?.authorId) {
        return personProfile;
      }

      let enrichedProfile = personProfile;

      if (hasMissingAuthorProfileData(enrichedProfile)) {
        try {
          let authorData = authorCache.get(personProfile.authorId);

          if (!authorCache.has(personProfile.authorId)) {
            authorData = await fetchAuthor(personProfile.authorId);
            authorCache.set(personProfile.authorId, authorData);
          }

          if (authorData) {
            enrichedProfile = mergeMissingFields(enrichedProfile, authorData);
          }
        } catch (authorError) {
          console.error("Error fetching item author:", authorError);
        }
      }

      if (hasMissingAuthorProfileData(enrichedProfile)) {
        try {
          topSellersPromise = topSellersPromise || fetchTopSellers();

          const topSellers = await topSellersPromise;
          const topSellerAuthor = topSellers.find(
            (seller) => seller?.authorId === Number(personProfile.authorId),
          );

          if (topSellerAuthor) {
            enrichedProfile = mergeMissingFields(
              enrichedProfile,
              topSellerAuthor,
            );
          }
        } catch (topSellerError) {
          console.error("Error fetching top sellers:", topSellerError);
        }
      }

      return enrichedProfile;
    }

    async function loadItemDetails() {
      try {
        setLoading(true);
        setError(null);
        setItem(null);
        setOwnerProfile(null);
        setCreatorProfile(null);

        const itemDetails = await fetchItemDetails(nftId);

        if (!isValidItem(itemDetails)) {
          setItem(null);
          return;
        }

        let enrichedItem = itemDetails;

        if (hasMissingItemDetails(enrichedItem)) {
          const marketplaceItems = await fetchMarketplaceItems();
          const marketplaceItem = marketplaceItems.find(
            (marketplaceItem) =>
              marketplaceItem?.nftId === Number(nftId) ||
              marketplaceItem?.id === Number(nftId),
          );

          if (marketplaceItem) {
            enrichedItem = mergeMissingFields(enrichedItem, marketplaceItem);
          }
        }

        const initialOwnerProfile = getItemPersonProfile(enrichedItem, "owner");
        const initialCreatorProfile = getItemPersonProfile(
          enrichedItem,
          "creator",
        );
        const [enrichedOwnerProfile, enrichedCreatorProfile] =
          initialOwnerProfile?.authorId &&
          initialOwnerProfile.authorId === initialCreatorProfile?.authorId
            ? await enrichPersonProfile(initialOwnerProfile).then((profile) => [
                profile,
                profile,
              ])
            : await Promise.all([
                enrichPersonProfile(initialOwnerProfile),
                enrichPersonProfile(initialCreatorProfile),
              ]);

        setItem(enrichedItem);
        setOwnerProfile(enrichedOwnerProfile);
        setCreatorProfile(enrichedCreatorProfile);
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError(error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }

    loadItemDetails();
  }, [nftId]);

  const owner = getPersonProfile(item, "owner", ownerProfile);
  const creator = getPersonProfile(item, "creator", creatorProfile);
  const expiryDate = getValidExpiryDate(item?.expiryDate);
  const title = item?.title || item?.name || "Untitled NFT";
  const itemImage = item?.nftImage || item?.image || nftImage;
  const price = item?.price ?? "N/A";
  const likes = item?.likes ?? 0;
  const views = item?.views ?? item?.viewCount;
  const description =
    item?.description ||
    `This NFT is part of the ${title} collection. It is listed with NFT ID #${
      item?.nftId ?? nftId
    }.`;

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

  if (error || !item) {
    return <div>Item not found.</div>;
  }

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              <div className="col-md-6 text-center" data-aos="fade-right">
                <img
                  src={itemImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt={title}
                />
              </div>

              <div className="col-md-6" data-aos="fade-left">
                <div className="item_info">
                  <h2>{title}</h2>

                  <div className="item_info_counts">
                    {views !== undefined && views !== null && (
                      <div className="item_info_views">
                        <i className="fa fa-eye"></i>
                        {views}
                      </div>
                    )}

                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {likes}
                    </div>
                  </div>

                  {expiryDate && <Countdown expiryDate={expiryDate} />}

                  <p>{description}</p>

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>

                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={getAuthorLink(owner.id)}>
                            <img
                              className="lazy"
                              src={owner.image}
                              alt={owner.name}
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>

                        <div className="author_list_info">
                          <Link to={getAuthorLink(owner.id)}>
                            {owner.name}
                          </Link>
                          {owner.username && <span>{owner.username}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Creator</h6>

                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={getAuthorLink(creator.id)}>
                            <img
                              className="lazy"
                              src={creator.image}
                              alt={creator.name}
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>

                        <div className="author_list_info">
                          <Link to={getAuthorLink(creator.id)}>
                            {creator.name}
                          </Link>
                          {creator.username && <span>{creator.username}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="spacer-40"></div>

                    <h6>Price</h6>

                    <div className="nft-item-price">
                      <img src={EthImage} alt="" />
                      <span>{price} ETH</span>
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
