const API_BASE_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net";

const normalizeApiList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.value)) {
    return data.value;
  }

  return [];
};

const normalizeApiRecord = (data) => {
  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (Array.isArray(data?.value)) {
    return data.value[0] || null;
  }

  if (data?.value && typeof data.value === "object") {
    return data.value;
  }

  if (data?.item && typeof data.item === "object") {
    return data.item;
  }

  if (data?.data && typeof data.data === "object") {
    return data.data;
  }

  if (data?.result && typeof data.result === "object") {
    return data.result;
  }

  if (data && typeof data === "object") {
    return data;
  }

  return null;
};

const fetchApiList = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
  }

  const data = await response.json();
  return normalizeApiList(data);
};

export const fetchMarketplaceItems = async () => {
  const [hotCollections, newItems, exploreItems] = await Promise.all([
    fetchApiList("hotCollections"),
    fetchApiList("newItems"),
    fetchApiList("explore"),
  ]);

  const itemsById = new Map();

  [...hotCollections, ...newItems, ...exploreItems].forEach((item, index) => {
    const itemId = item?.nftId ?? item?.id ?? `item-${index}`;
    itemsById.set(itemId, item);
  });

  return [...itemsById.values()];
};

export const fetchTopSellers = () => fetchApiList("topSellers");

export const fetchItemDetails = async (nftId) => {
  const response = await fetch(
    `${API_BASE_URL}/itemDetails?nftId=${encodeURIComponent(nftId)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch item details: ${response.status}`);
  }

  const data = await response.json();
  return normalizeApiRecord(data);
};

export const fetchAuthor = async (authorId) => {
  const response = await fetch(
    `${API_BASE_URL}/authors?author=${encodeURIComponent(authorId)}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch author: ${response.status}`);
  }

  const data = await response.json();
  return normalizeApiRecord(data);
};

export const fetchExploreItems = (filter = "") => {
  const endpoint = filter
    ? `explore?filter=${encodeURIComponent(filter)}`
    : "explore";

  return fetchApiList(endpoint);
};
