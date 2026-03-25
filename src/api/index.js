import axios from "@/utils/request";
import fetchJsonp from "fetch-jsonp";

/**
 * 获取一言
 * https://hitokoto.cn/
 * @param {Array} types - 句子类型数组，如 ["a", "d"]
 */
export const getHitokoto = async (types = []) => {
  const typeParams = types.length
    ? types.map((t) => `c=${t}`).join("&")
    : "";
  const url = `https://international.v1.hitokoto.cn/?encode=json${typeParams ? "&" + typeParams : ""}`;
  return axios({
    method: "GET",
    url,
  });
};

/**
 * 获取搜索建议
 * 支持 Google / Bing / Baidu 三种来源
 * @param {String} keyWord - 搜索关键字
 * @param {String} provider - 来源：google / bing / baidu
 */
export const getSearchSuggestions = async (keyWord, provider = "google") => {
  try {
    const encodedKeyword = encodeURIComponent(keyWord);

    if (provider === "baidu") {
      const response = await fetchJsonp(
        `https://suggestion.baidu.com/su?wd=${encodedKeyword}`,
        { jsonpCallback: "cb", jsonpCallbackFunction: `bd_sug_${Date.now()}` },
      );
      const data = await response.json();
      return (data.s || []).slice(0, 10);
    }

    if (provider === "bing") {
      const response = await fetchJsonp(
        `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodedKeyword}`,
        { jsonpCallback: "cb" },
      );
      const data = await response.json();
      const items = data?.AS?.Results?.[0]?.Suggests || [];
      return items.map((item) => item.Txt).slice(0, 10);
    }

    // 默认 Google
    const response = await fetchJsonp(
      `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodedKeyword}`,
      { jsonpCallback: "jsonp" },
    );
    const data = await response.json();
    const suggestions = data[1] || [];
    return suggestions.map((item) => (Array.isArray(item) ? item[0] : item));
  } catch (error) {
    console.error("处理搜索建议发生错误：", error);
    return null;
  }
};
