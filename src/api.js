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

const fetchApiList = async (endpoint) => {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
  }

  const data = await response.json();
  return normalizeApiList(data);
};

export const fetchMarketplaceItems = async () => {
  const [hotCollections, newItems] = await Promise.all([
    fetchApiList("hotCollections"),
    fetchApiList("newItems"),
  ]);

  return [...hotCollections, ...newItems];
};

export const fetchTopSellers = () => fetchApiList("topSellers");

export const fetchExploreItems = (filter = "") => {
  const endpoint = filter
    ? `explore?filter=${encodeURIComponent(filter)}`
    : "explore";

  return fetchApiList(endpoint);
};
