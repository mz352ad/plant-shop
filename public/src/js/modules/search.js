/**
 * Search Module
 * Управління пошуком та фільтрацією
 */

// Глобальний стан фільтрів
const filterState = {
  category: "all",
  query: "",
  sort: "default",
};

/**
 * Отримати поточний стан фільтрів
 * @returns {object}
 */
function getFilterState() {
  return { ...filterState };
}

/**
 * Оновити стан фільтру категорії
 * @param {string} category - ID категорії
 */
function setCategory(category) {
  filterState.category = category;
}

/**
 * Оновити стан пошукового запиту
 * @param {string} query - Пошуковий запит
 */
function setSearchQuery(query) {
  filterState.query = query;
}

/**
 * Оновити тип сортування
 * @param {string} sort - Тип сортування
 */
function setSort(sort) {
  filterState.sort = sort;
}

/**
 * Скинути всі фільтри
 */
function resetFilters() {
  filterState.category = "all";
  filterState.query = "";
  filterState.sort = "default";
}

/**
 * Застосувати все фільтри та сортування до рослин
 * @param {array} items - Вихідний список рослин
 * @param {object} state - Стан фільтрів (опціонально, якщо не передавати, використовується глобальний)
 * @returns {array} - Відфільтрований та відсортований список
 */
function applyFilters(items, state = filterState) {
  let filtered = [...items];

  // Фільтр по категорії
  filtered = window.PlantsModule.filterByCategory(filtered, state.category);

  // Фільтр по пошуку
  filtered = window.PlantsModule.filterBySearch(filtered, state.query);

  // Сортування
  filtered = window.PlantsModule.sortPlants(filtered, state.sort);

  return filtered;
}

/**
 * Отримати результати з урахуванням всіх фільтрів
 * @returns {array}
 */
function getFilteredResults() {
  const allPlants = window.getPlantsData();
  return applyFilters(allPlants);
}

/**
 * Отримати кількість результатів
 * @returns {number}
 */
function getResultsCount() {
  return getFilteredResults().length;
}

// Export модуля
window.SearchModule = {
  getFilterState,
  setCategory,
  setSearchQuery,
  setSort,
  resetFilters,
  applyFilters,
  getFilteredResults,
  getResultsCount
};
