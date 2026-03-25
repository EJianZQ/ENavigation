/**
 * GitHub Gist 云同步工具
 * 将待办、便签、快捷方式数据同步到 GitHub Gist
 */

const FILE_NAME = "enavigation.json";

/**
 * 上传数据到 Gist
 * @param {String} token - GitHub Personal Access Token
 * @param {String} gistId - Gist ID
 * @param {Object} data - 要上传的数据 { todoData, noteData, shortcutData }
 */
export const uploadToGist = async (token, gistId, data) => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        [FILE_NAME]: {
          content: JSON.stringify(data, null, 2),
        },
      },
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `上传失败 (${response.status})`);
  }
  return await response.json();
};

/**
 * 从 Gist 下载数据
 * @param {String} token - GitHub Personal Access Token
 * @param {String} gistId - Gist ID
 * @returns {Object} { todoData, noteData, shortcutData }
 */
export const downloadFromGist = async (token, gistId) => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `下载失败 (${response.status})`);
  }
  const gist = await response.json();
  const file = gist.files?.[FILE_NAME];
  if (!file) {
    throw new Error(`Gist 中未找到 ${FILE_NAME} 文件`);
  }
  return JSON.parse(file.content);
};
